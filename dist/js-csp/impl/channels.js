"use strict";

var buffers = require("./buffers");
var dispatch = require("./dispatch");

var MAX_DIRTY = 64;
var MAX_QUEUE_SIZE = 1024;

var CLOSED = null;

var Box = function Box(value) {
  this.value = value;
};

var PutBox = function PutBox(handler, value) {
  this.handler = handler;
  this.value = value;
};

var Channel = function Channel(takes, puts, buf, xform) {
  this.buf = buf;
  this.xform = xform;
  this.takes = takes;
  this.puts = puts;

  this.dirty_takes = 0;
  this.dirty_puts = 0;
  this.closed = false;
};

function isReduced(v) {
  return v && v["@@transducer/reduced"];
}

function schedule(f, v) {
  dispatch.run(function () {
    f(v);
  });
}

Channel.prototype._put = function (value, handler) {
  if (value === CLOSED) {
    throw new Error("Cannot put CLOSED on a channel.");
  }

  // TODO: I'm not sure how this can happen, because the operations
  // are registered in 1 tick, and the only way for this to be inactive
  // is for a previous operation in the same alt to have returned
  // immediately, which would have short-circuited to prevent this to
  // be ever register anyway. The same thing goes for the active check
  // in "_take".
  if (!handler.is_active()) {
    return null;
  }

  if (this.closed) {
    handler.commit();
    return new Box(false);
  }

  var taker, callback;

  // Soak the value through the buffer first, even if there is a
  // pending taker. This way the step function has a chance to act on the
  // value.
  if (this.buf && !this.buf.is_full()) {
    handler.commit();
    var done = isReduced(this.xform["@@transducer/step"](this.buf, value));
    while (true) {
      if (this.buf.count() === 0) {
        break;
      }
      taker = this.takes.pop();
      if (taker === buffers.EMPTY) {
        break;
      }
      if (taker.is_active()) {
        value = this.buf.remove();
        callback = taker.commit();
        schedule(callback, value);
      }
    }
    if (done) {
      this.close();
    }
    return new Box(true);
  }

  // Either the buffer is full, in which case there won't be any
  // pending takes, or we don't have a buffer, in which case this loop
  // fulfills the first of them that is active (note that we don't
  // have to worry about transducers here since we require a buffer
  // for that).
  while (true) {
    taker = this.takes.pop();
    if (taker === buffers.EMPTY) {
      break;
    }
    if (taker.is_active()) {
      handler.commit();
      callback = taker.commit();
      schedule(callback, value);
      return new Box(true);
    }
  }

  // No buffer, full buffer, no pending takes. Queue this put now if blockable.
  if (this.dirty_puts > MAX_DIRTY) {
    this.puts.cleanup(function (putter) {
      return putter.handler.is_active();
    });
    this.dirty_puts = 0;
  } else {
    this.dirty_puts++;
  }
  if (handler.is_blockable()) {
    if (this.puts.length >= MAX_QUEUE_SIZE) {
      throw new Error("No more than " + MAX_QUEUE_SIZE + " pending puts are allowed on a single channel.");
    }
    this.puts.unbounded_unshift(new PutBox(handler, value));
  }
  return null;
};

Channel.prototype._take = function (handler) {
  if (!handler.is_active()) {
    return null;
  }

  var putter, put_handler, callback, value;

  if (this.buf && this.buf.count() > 0) {
    handler.commit();
    value = this.buf.remove();
    // We need to check pending puts here, other wise they won't
    // be able to proceed until their number reaches MAX_DIRTY
    while (true) {
      if (this.buf.is_full()) {
        break;
      }
      putter = this.puts.pop();
      if (putter === buffers.EMPTY) {
        break;
      }
      put_handler = putter.handler;
      if (put_handler.is_active()) {
        callback = put_handler.commit();
        if (callback) {
          schedule(callback, true);
        }
        if (isReduced(this.xform["@@transducer/step"](this.buf, putter.value))) {
          this.close();
        }
      }
    }
    return new Box(value);
  }

  // Either the buffer is empty, in which case there won't be any
  // pending puts, or we don't have a buffer, in which case this loop
  // fulfills the first of them that is active (note that we don't
  // have to worry about transducers here since we require a buffer
  // for that).
  while (true) {
    putter = this.puts.pop();
    value = putter.value;
    if (putter === buffers.EMPTY) {
      break;
    }
    put_handler = putter.handler;
    if (put_handler.is_active()) {
      handler.commit();
      callback = put_handler.commit();
      if (callback) {
        schedule(callback, true);
      }
      return new Box(value);
    }
  }

  if (this.closed) {
    handler.commit();
    return new Box(CLOSED);
  }

  // No buffer, empty buffer, no pending puts. Queue this take now if blockable.
  if (this.dirty_takes > MAX_DIRTY) {
    this.takes.cleanup(function (handler) {
      return handler.is_active();
    });
    this.dirty_takes = 0;
  } else {
    this.dirty_takes++;
  }
  if (handler.is_blockable()) {
    if (this.takes.length >= MAX_QUEUE_SIZE) {
      throw new Error("No more than " + MAX_QUEUE_SIZE + " pending takes are allowed on a single channel.");
    }
    this.takes.unbounded_unshift(handler);
  }
  return null;
};

Channel.prototype.close = function () {
  if (this.closed) {
    return;
  }
  this.closed = true;

  // TODO: Duplicate code. Make a "_flush" function or something
  if (this.buf) {
    this.xform["@@transducer/result"](this.buf);
    while (true) {
      if (this.buf.count() === 0) {
        break;
      }
      taker = this.takes.pop();
      if (taker === buffers.EMPTY) {
        break;
      }
      if (taker.is_active()) {
        callback = taker.commit();
        var value = this.buf.remove();
        schedule(callback, value);
      }
    }
  }

  while (true) {
    var taker = this.takes.pop();
    if (taker === buffers.EMPTY) {
      break;
    }
    if (taker.is_active()) {
      var callback = taker.commit();
      schedule(callback, CLOSED);
    }
  }

  while (true) {
    var putter = this.puts.pop();
    if (putter === buffers.EMPTY) {
      break;
    }
    if (putter.handler.is_active()) {
      var put_callback = putter.handler.commit();
      if (put_callback) {
        schedule(put_callback, false);
      }
    }
  }
};

Channel.prototype.is_closed = function () {
  return this.closed;
};

function defaultHandler(e) {
  console.log('error in channel transformer', e.stack);
  return CLOSED;
}

function handleEx(buf, exHandler, e) {
  var def = (exHandler || defaultHandler)(e);
  if (def !== CLOSED) {
    buf.add(def);
  }
  return buf;
}

// The base transformer object to use with transducers
function AddTransformer() {}

AddTransformer.prototype["@@transducer/init"] = function () {
  throw new Error('init not available');
};

AddTransformer.prototype["@@transducer/result"] = function (v) {
  return v;
};

AddTransformer.prototype["@@transducer/step"] = function (buffer, input) {
  buffer.add(input);
  return buffer;
};

function handleException(exHandler) {
  return function (xform) {
    return {
      "@@transducer/step": function transducerStep(buffer, input) {
        try {
          return xform["@@transducer/step"](buffer, input);
        } catch (e) {
          return handleEx(buffer, exHandler, e);
        }
      },
      "@@transducer/result": function transducerResult(buffer) {
        try {
          return xform["@@transducer/result"](buffer);
        } catch (e) {
          return handleEx(buffer, exHandler, e);
        }
      }
    };
  };
}

// XXX: This is inconsistent. We should either call the reducing
// function xform, or call the transducer xform, not both
exports.chan = function (buf, xform, exHandler) {
  if (xform) {
    if (!buf) {
      throw new Error("Only buffered channels can use transducers");
    }

    xform = xform(new AddTransformer());
  } else {
    xform = new AddTransformer();
  }
  xform = handleException(exHandler)(xform);

  return new Channel(buffers.ring(32), buffers.ring(32), buf, xform);
};

exports.Box = Box;
exports.Channel = Channel;
exports.CLOSED = CLOSED;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9qcy1jc3AvaW1wbC9jaGFubmVscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBRWIsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ25DLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFckMsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ25CLElBQUksY0FBYyxHQUFHLElBQUksQ0FBQzs7QUFFMUIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDOztBQUVsQixJQUFJLEdBQUcsR0FBRyxTQUFOLEdBQUcsQ0FBWSxLQUFLLEVBQUU7QUFDeEIsTUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7Q0FDcEIsQ0FBQzs7QUFFRixJQUFJLE1BQU0sR0FBRyxTQUFULE1BQU0sQ0FBWSxPQUFPLEVBQUUsS0FBSyxFQUFFO0FBQ3BDLE1BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3ZCLE1BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0NBQ3BCLENBQUM7O0FBRUYsSUFBSSxPQUFPLEdBQUcsU0FBVixPQUFPLENBQVksS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFO0FBQzlDLE1BQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQ2YsTUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDbkIsTUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDbkIsTUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7O0FBRWpCLE1BQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO0FBQ3JCLE1BQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO0FBQ3BCLE1BQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0NBQ3JCLENBQUM7O0FBRUYsU0FBUyxTQUFTLENBQUMsQ0FBQyxFQUFFO0FBQ3BCLFNB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QUk7QUFDRixpQkFBTyxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUM3QyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YsaUJBQU8sUUFBUSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDdkM7T0FDRjtLQUNGLENBQUM7R0FDSCxDQUFDO0NBQ0g7Ozs7QUFBQSxBQUlELE9BQU8sQ0FBQyxJQUFJLEdBQUcsVUFBUyxHQUFHLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRTtBQUM3QyxNQUFJLEtBQUssRUFBRTtBQUNULFFBQUksQ0FBQyxHQUFHLEVBQUU7QUFDUixZQUFNLElBQUksS0FBSyxDQUFDLDRDQUE0QyxDQUFDLENBQUM7S0FDL0Q7O0FBRUQsU0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLGNBQWMsRUFBRSxDQUFDLENBQUM7R0FDckMsTUFBTTtBQUNMLFNBQUssR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO0dBQzlCO0FBQ0QsT0FBSyxHQUFHLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFMUMsU0FBTyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO0NBQ3BFLENBQUM7O0FBRUYsT0FBTyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDbEIsT0FBTyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDMUIsT0FBTyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMiLCJmaWxlIjoiY2hhbm5lbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxudmFyIGJ1ZmZlcnMgPSByZXF1aXJlKFwiLi9idWZmZXJzXCIpO1xudmFyIGRpc3BhdGNoID0gcmVxdWlyZShcIi4vZGlzcGF0Y2hcIik7XG5cbnZhciBNQVhfRElSVFkgPSA2NDtcbnZhciBNQVhfUVVFVUVfU0laRSA9IDEwMjQ7XG5cbnZhciBDTE9TRUQgPSBudWxsO1xuXG52YXIgQm94ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgdGhpcy52YWx1ZSA9IHZhbHVlO1xufTtcblxudmFyIFB1dEJveCA9IGZ1bmN0aW9uKGhhbmRsZXIsIHZhbHVlKSB7XG4gIHRoaXMuaGFuZGxlciA9IGhhbmRsZXI7XG4gIHRoaXMudmFsdWUgPSB2YWx1ZTtcbn07XG5cbnZhciBDaGFubmVsID0gZnVuY3Rpb24odGFrZXMsIHB1dHMsIGJ1ZiwgeGZvcm0pIHtcbiAgdGhpcy5idWYgPSBidWY7XG4gIHRoaXMueGZvcm0gPSB4Zm9ybTtcbiAgdGhpcy50YWtlcyA9IHRha2VzO1xuICB0aGlzLnB1dHMgPSBwdXRzO1xuXG4gIHRoaXMuZGlydHlfdGFrZXMgPSAwO1xuICB0aGlzLmRpcnR5X3B1dHMgPSAwO1xuICB0aGlzLmNsb3NlZCA9IGZhbHNlO1xufTtcblxuZnVuY3Rpb24gaXNSZWR1Y2VkKHYpIHtcbiAgcmV0dXJuIHYgJiYgdltcIkBAdHJhbnNkdWNlci9yZWR1Y2VkXCJdO1xufVxuXG5mdW5jdGlvbiBzY2hlZHVsZShmLCB2KSB7XG4gIGRpc3BhdGNoLnJ1bihmdW5jdGlvbigpIHtcbiAgICBmKHYpO1xuICB9KTtcbn1cblxuQ2hhbm5lbC5wcm90b3R5cGUuX3B1dCA9IGZ1bmN0aW9uKHZhbHVlLCBoYW5kbGVyKSB7XG4gIGlmICh2YWx1ZSA9PT0gQ0xPU0VEKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHB1dCBDTE9TRUQgb24gYSBjaGFubmVsLlwiKTtcbiAgfVxuXG4gIC8vIFRPRE86IEknbSBub3Qgc3VyZSBob3cgdGhpcyBjYW4gaGFwcGVuLCBiZWNhdXNlIHRoZSBvcGVyYXRpb25zXG4gIC8vIGFyZSByZWdpc3RlcmVkIGluIDEgdGljaywgYW5kIHRoZSBvbmx5IHdheSBmb3IgdGhpcyB0byBiZSBpbmFjdGl2ZVxuICAvLyBpcyBmb3IgYSBwcmV2aW91cyBvcGVyYXRpb24gaW4gdGhlIHNhbWUgYWx0IHRvIGhhdmUgcmV0dXJuZWRcbiAgLy8gaW1tZWRpYXRlbHksIHdoaWNoIHdvdWxkIGhhdmUgc2hvcnQtY2lyY3VpdGVkIHRvIHByZXZlbnQgdGhpcyB0b1xuICAvLyBiZSBldmVyIHJlZ2lzdGVyIGFueXdheS4gVGhlIHNhbWUgdGhpbmcgZ29lcyBmb3IgdGhlIGFjdGl2ZSBjaGVja1xuICAvLyBpbiBcIl90YWtlXCIuXG4gIGlmICghaGFuZGxlci5pc19hY3RpdmUoKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgaWYgKHRoaXMuY2xvc2VkKSB7XG4gICAgaGFuZGxlci5jb21taXQoKTtcbiAgICByZXR1cm4gbmV3IEJveChmYWxzZSk7XG4gIH1cblxuICB2YXIgdGFrZXIsIGNhbGxiYWNrO1xuXG4gIC8vIFNvYWsgdGhlIHZhbHVlIHRocm91Z2ggdGhlIGJ1ZmZlciBmaXJzdCwgZXZlbiBpZiB0aGVyZSBpcyBhXG4gIC8vIHBlbmRpbmcgdGFrZXIuIFRoaXMgd2F5IHRoZSBzdGVwIGZ1bmN0aW9uIGhhcyBhIGNoYW5jZSB0byBhY3Qgb24gdGhlXG4gIC8vIHZhbHVlLlxuICBpZiAodGhpcy5idWYgJiYgIXRoaXMuYnVmLmlzX2Z1bGwoKSkge1xuICAgIGhhbmRsZXIuY29tbWl0KCk7XG4gICAgdmFyIGRvbmUgPSBpc1JlZHVjZWQodGhpcy54Zm9ybVtcIkBAdHJhbnNkdWNlci9zdGVwXCJdKHRoaXMuYnVmLCB2YWx1ZSkpO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAodGhpcy5idWYuY291bnQoKSA9PT0gMCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIHRha2VyID0gdGhpcy50YWtlcy5wb3AoKTtcbiAgICAgIGlmICh0YWtlciA9PT0gYnVmZmVycy5FTVBUWSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGlmICh0YWtlci5pc19hY3RpdmUoKSkge1xuICAgICAgICB2YWx1ZSA9IHRoaXMuYnVmLnJlbW92ZSgpO1xuICAgICAgICBjYWxsYmFjayA9IHRha2VyLmNvbW1pdCgpO1xuICAgICAgICBzY2hlZHVsZShjYWxsYmFjaywgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZG9uZSkge1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IEJveCh0cnVlKTtcbiAgfVxuXG4gIC8vIEVpdGhlciB0aGUgYnVmZmVyIGlzIGZ1bGwsIGluIHdoaWNoIGNhc2UgdGhlcmUgd29uJ3QgYmUgYW55XG4gIC8vIHBlbmRpbmcgdGFrZXMsIG9yIHdlIGRvbid0IGhhdmUgYSBidWZmZXIsIGluIHdoaWNoIGNhc2UgdGhpcyBsb29wXG4gIC8vIGZ1bGZpbGxzIHRoZSBmaXJzdCBvZiB0aGVtIHRoYXQgaXMgYWN0aXZlIChub3RlIHRoYXQgd2UgZG9uJ3RcbiAgLy8gaGF2ZSB0byB3b3JyeSBhYm91dCB0cmFuc2R1Y2VycyBoZXJlIHNpbmNlIHdlIHJlcXVpcmUgYSBidWZmZXJcbiAgLy8gZm9yIHRoYXQpLlxuICB3aGlsZSAodHJ1ZSkge1xuICAgIHRha2VyID0gdGhpcy50YWtlcy5wb3AoKTtcbiAgICBpZiAodGFrZXIgPT09IGJ1ZmZlcnMuRU1QVFkpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpZiAodGFrZXIuaXNfYWN0aXZlKCkpIHtcbiAgICAgIGhhbmRsZXIuY29tbWl0KCk7XG4gICAgICBjYWxsYmFjayA9IHRha2VyLmNvbW1pdCgpO1xuICAgICAgc2NoZWR1bGUoY2FsbGJhY2ssIHZhbHVlKTtcbiAgICAgIHJldHVybiBuZXcgQm94KHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIC8vIE5vIGJ1ZmZlciwgZnVsbCBidWZmZXIsIG5vIHBlbmRpbmcgdGFrZXMuIFF1ZXVlIHRoaXMgcHV0IG5vdyBpZiBibG9ja2FibGUuXG4gIGlmICh0aGlzLmRpcnR5X3B1dHMgPiBNQVhfRElSVFkpIHtcbiAgICB0aGlzLnB1dHMuY2xlYW51cChmdW5jdGlvbihwdXR0ZXIpIHtcbiAgICAgIHJldHVybiBwdXR0ZXIuaGFuZGxlci5pc19hY3RpdmUoKTtcbiAgICB9KTtcbiAgICB0aGlzLmRpcnR5X3B1dHMgPSAwO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuZGlydHlfcHV0cyArKztcbiAgfVxuICBpZiAoaGFuZGxlci5pc19ibG9ja2FibGUoKSkge1xuICAgIGlmICh0aGlzLnB1dHMubGVuZ3RoID49IE1BWF9RVUVVRV9TSVpFKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIG1vcmUgdGhhbiBcIiArIE1BWF9RVUVVRV9TSVpFICsgXCIgcGVuZGluZyBwdXRzIGFyZSBhbGxvd2VkIG9uIGEgc2luZ2xlIGNoYW5uZWwuXCIpO1xuICAgIH1cbiAgICB0aGlzLnB1dHMudW5ib3VuZGVkX3Vuc2hpZnQobmV3IFB1dEJveChoYW5kbGVyLCB2YWx1ZSkpO1xuICB9XG4gIHJldHVybiBudWxsO1xufTtcblxuQ2hhbm5lbC5wcm90b3R5cGUuX3Rha2UgPSBmdW5jdGlvbihoYW5kbGVyKSB7XG4gIGlmICghaGFuZGxlci5pc19hY3RpdmUoKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmFyIHB1dHRlciwgcHV0X2hhbmRsZXIsIGNhbGxiYWNrLCB2YWx1ZTtcblxuICBpZiAodGhpcy5idWYgJiYgdGhpcy5idWYuY291bnQoKSA+IDApIHtcbiAgICBoYW5kbGVyLmNvbW1pdCgpO1xuICAgIHZhbHVlID0gdGhpcy5idWYucmVtb3ZlKCk7XG4gICAgLy8gV2UgbmVlZCB0byBjaGVjayBwZW5kaW5nIHB1dHMgaGVyZSwgb3RoZXIgd2lzZSB0aGV5IHdvbid0XG4gICAgLy8gYmUgYWJsZSB0byBwcm9jZWVkIHVudGlsIHRoZWlyIG51bWJlciByZWFjaGVzIE1BWF9ESVJUWVxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAodGhpcy5idWYuaXNfZnVsbCgpKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgcHV0dGVyID0gdGhpcy5wdXRzLnBvcCgpO1xuICAgICAgaWYgKHB1dHRlciA9PT0gYnVmZmVycy5FTVBUWSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIHB1dF9oYW5kbGVyID0gcHV0dGVyLmhhbmRsZXI7XG4gICAgICBpZiAocHV0X2hhbmRsZXIuaXNfYWN0aXZlKCkpIHtcbiAgICAgICAgY2FsbGJhY2sgPSBwdXRfaGFuZGxlci5jb21taXQoKTtcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgc2NoZWR1bGUoY2FsbGJhY2ssIHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc1JlZHVjZWQodGhpcy54Zm9ybVtcIkBAdHJhbnNkdWNlci9zdGVwXCJdKHRoaXMuYnVmLCBwdXR0ZXIudmFsdWUpKSkge1xuICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IEJveCh2YWx1ZSk7XG4gIH1cblxuICAvLyBFaXRoZXIgdGhlIGJ1ZmZlciBpcyBlbXB0eSwgaW4gd2hpY2ggY2FzZSB0aGVyZSB3b24ndCBiZSBhbnlcbiAgLy8gcGVuZGluZyBwdXRzLCBvciB3ZSBkb24ndCBoYXZlIGEgYnVmZmVyLCBpbiB3aGljaCBjYXNlIHRoaXMgbG9vcFxuICAvLyBmdWxmaWxscyB0aGUgZmlyc3Qgb2YgdGhlbSB0aGF0IGlzIGFjdGl2ZSAobm90ZSB0aGF0IHdlIGRvbid0XG4gIC8vIGhhdmUgdG8gd29ycnkgYWJvdXQgdHJhbnNkdWNlcnMgaGVyZSBzaW5jZSB3ZSByZXF1aXJlIGEgYnVmZmVyXG4gIC8vIGZvciB0aGF0KS5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBwdXR0ZXIgPSB0aGlzLnB1dHMucG9wKCk7XG4gICAgdmFsdWUgPSBwdXR0ZXIudmFsdWU7XG4gICAgaWYgKHB1dHRlciA9PT0gYnVmZmVycy5FTVBUWSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHB1dF9oYW5kbGVyID0gcHV0dGVyLmhhbmRsZXI7XG4gICAgaWYgKHB1dF9oYW5kbGVyLmlzX2FjdGl2ZSgpKSB7XG4gICAgICBoYW5kbGVyLmNvbW1pdCgpO1xuICAgICAgY2FsbGJhY2sgPSBwdXRfaGFuZGxlci5jb21taXQoKTtcbiAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICBzY2hlZHVsZShjYWxsYmFjaywgdHJ1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IEJveCh2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHRoaXMuY2xvc2VkKSB7XG4gICAgaGFuZGxlci5jb21taXQoKTtcbiAgICByZXR1cm4gbmV3IEJveChDTE9TRUQpO1xuICB9XG5cbiAgLy8gTm8gYnVmZmVyLCBlbXB0eSBidWZmZXIsIG5vIHBlbmRpbmcgcHV0cy4gUXVldWUgdGhpcyB0YWtlIG5vdyBpZiBibG9ja2FibGUuXG4gIGlmICh0aGlzLmRpcnR5X3Rha2VzID4gTUFYX0RJUlRZKSB7XG4gICAgdGhpcy50YWtlcy5jbGVhbnVwKGZ1bmN0aW9uKGhhbmRsZXIpIHtcbiAgICAgIHJldHVybiBoYW5kbGVyLmlzX2FjdGl2ZSgpO1xuICAgIH0pO1xuICAgIHRoaXMuZGlydHlfdGFrZXMgPSAwO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuZGlydHlfdGFrZXMgKys7XG4gIH1cbiAgaWYgKGhhbmRsZXIuaXNfYmxvY2thYmxlKCkpIHtcbiAgICBpZiAodGhpcy50YWtlcy5sZW5ndGggPj0gTUFYX1FVRVVFX1NJWkUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIG1vcmUgdGhhbiBcIiArIE1BWF9RVUVVRV9TSVpFICsgXCIgcGVuZGluZyB0YWtlcyBhcmUgYWxsb3dlZCBvbiBhIHNpbmdsZSBjaGFubmVsLlwiKTtcbiAgICB9XG4gICAgdGhpcy50YWtlcy51bmJvdW5kZWRfdW5zaGlmdChoYW5kbGVyKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5cbkNoYW5uZWwucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gIGlmICh0aGlzLmNsb3NlZCkge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLmNsb3NlZCA9IHRydWU7XG5cbiAgLy8gVE9ETzogRHVwbGljYXRlIGNvZGUuIE1ha2UgYSBcIl9mbHVzaFwiIGZ1bmN0aW9uIG9yIHNvbWV0aGluZ1xuICBpZiAodGhpcy5idWYpIHtcbiAgICB0aGlzLnhmb3JtW1wiQEB0cmFuc2R1Y2VyL3Jlc3VsdFwiXSh0aGlzLmJ1Zik7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGlmICh0aGlzLmJ1Zi5jb3VudCgpID09PSAwKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgdGFrZXIgPSB0aGlzLnRha2VzLnBvcCgpO1xuICAgICAgaWYgKHRha2VyID09PSBidWZmZXJzLkVNUFRZKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgaWYgKHRha2VyLmlzX2FjdGl2ZSgpKSB7XG4gICAgICAgIGNhbGxiYWNrID0gdGFrZXIuY29tbWl0KCk7XG4gICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuYnVmLnJlbW92ZSgpO1xuICAgICAgICBzY2hlZHVsZShjYWxsYmFjaywgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgdmFyIHRha2VyID0gdGhpcy50YWtlcy5wb3AoKTtcbiAgICBpZiAodGFrZXIgPT09IGJ1ZmZlcnMuRU1QVFkpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpZiAodGFrZXIuaXNfYWN0aXZlKCkpIHtcbiAgICAgIHZhciBjYWxsYmFjayA9IHRha2VyLmNvbW1pdCgpO1xuICAgICAgc2NoZWR1bGUoY2FsbGJhY2ssIENMT1NFRCk7XG4gICAgfVxuICB9XG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICB2YXIgcHV0dGVyID0gdGhpcy5wdXRzLnBvcCgpO1xuICAgIGlmIChwdXR0ZXIgPT09IGJ1ZmZlcnMuRU1QVFkpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpZiAocHV0dGVyLmhhbmRsZXIuaXNfYWN0aXZlKCkpIHtcbiAgICAgIHZhciBwdXRfY2FsbGJhY2sgPSBwdXR0ZXIuaGFuZGxlci5jb21taXQoKTtcbiAgICAgIGlmIChwdXRfY2FsbGJhY2spIHtcbiAgICAgICAgc2NoZWR1bGUocHV0X2NhbGxiYWNrLCBmYWxzZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5cbkNoYW5uZWwucHJvdG90eXBlLmlzX2Nsb3NlZCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5jbG9zZWQ7XG59O1xuXG5mdW5jdGlvbiBkZWZhdWx0SGFuZGxlcihlKSB7XG4gIGNvbnNvbGUubG9nKCdlcnJvciBpbiBjaGFubmVsIHRyYW5zZm9ybWVyJywgZS5zdGFjayk7XG4gIHJldHVybiBDTE9TRUQ7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZUV4KGJ1ZiwgZXhIYW5kbGVyLCBlKSB7XG4gIHZhciBkZWYgPSAoZXhIYW5kbGVyIHx8IGRlZmF1bHRIYW5kbGVyKShlKTtcbiAgaWYgKGRlZiAhPT0gQ0xPU0VEKSB7XG4gICAgYnVmLmFkZChkZWYpO1xuICB9XG4gIHJldHVybiBidWY7XG59XG5cbi8vIFRoZSBiYXNlIHRyYW5zZm9ybWVyIG9iamVjdCB0byB1c2Ugd2l0aCB0cmFuc2R1Y2Vyc1xuZnVuY3Rpb24gQWRkVHJhbnNmb3JtZXIoKSB7XG59XG5cbkFkZFRyYW5zZm9ybWVyLnByb3RvdHlwZVtcIkBAdHJhbnNkdWNlci9pbml0XCJdID0gZnVuY3Rpb24oKSB7XG4gIHRocm93IG5ldyBFcnJvcignaW5pdCBub3QgYXZhaWxhYmxlJyk7XG59O1xuXG5BZGRUcmFuc2Zvcm1lci5wcm90b3R5cGVbXCJAQHRyYW5zZHVjZXIvcmVzdWx0XCJdID0gZnVuY3Rpb24odikge1xuICByZXR1cm4gdjtcbn07XG5cbkFkZFRyYW5zZm9ybWVyLnByb3RvdHlwZVtcIkBAdHJhbnNkdWNlci9zdGVwXCJdID0gZnVuY3Rpb24oYnVmZmVyLCBpbnB1dCkge1xuICBidWZmZXIuYWRkKGlucHV0KTtcbiAgcmV0dXJuIGJ1ZmZlcjtcbn07XG5cblxuZnVuY3Rpb24gaGFuZGxlRXhjZXB0aW9uKGV4SGFuZGxlcikge1xuICByZXR1cm4gZnVuY3Rpb24oeGZvcm0pIHtcbiAgICByZXR1cm4ge1xuICAgICAgXCJAQHRyYW5zZHVjZXIvc3RlcFwiOiBmdW5jdGlvbihidWZmZXIsIGlucHV0KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIHhmb3JtW1wiQEB0cmFuc2R1Y2VyL3N0ZXBcIl0oYnVmZmVyLCBpbnB1dCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICByZXR1cm4gaGFuZGxlRXgoYnVmZmVyLCBleEhhbmRsZXIsIGUpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJAQHRyYW5zZHVjZXIvcmVzdWx0XCI6IGZ1bmN0aW9uKGJ1ZmZlcikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiB4Zm9ybVtcIkBAdHJhbnNkdWNlci9yZXN1bHRcIl0oYnVmZmVyKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHJldHVybiBoYW5kbGVFeChidWZmZXIsIGV4SGFuZGxlciwgZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9O1xufVxuXG4vLyBYWFg6IFRoaXMgaXMgaW5jb25zaXN0ZW50LiBXZSBzaG91bGQgZWl0aGVyIGNhbGwgdGhlIHJlZHVjaW5nXG4vLyBmdW5jdGlvbiB4Zm9ybSwgb3IgY2FsbCB0aGUgdHJhbnNkdWNlciB4Zm9ybSwgbm90IGJvdGhcbmV4cG9ydHMuY2hhbiA9IGZ1bmN0aW9uKGJ1ZiwgeGZvcm0sIGV4SGFuZGxlcikge1xuICBpZiAoeGZvcm0pIHtcbiAgICBpZiAoIWJ1Zikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiT25seSBidWZmZXJlZCBjaGFubmVscyBjYW4gdXNlIHRyYW5zZHVjZXJzXCIpO1xuICAgIH1cblxuICAgIHhmb3JtID0geGZvcm0obmV3IEFkZFRyYW5zZm9ybWVyKCkpO1xuICB9IGVsc2Uge1xuICAgIHhmb3JtID0gbmV3IEFkZFRyYW5zZm9ybWVyKCk7XG4gIH1cbiAgeGZvcm0gPSBoYW5kbGVFeGNlcHRpb24oZXhIYW5kbGVyKSh4Zm9ybSk7XG5cbiAgcmV0dXJuIG5ldyBDaGFubmVsKGJ1ZmZlcnMucmluZygzMiksIGJ1ZmZlcnMucmluZygzMiksIGJ1ZiwgeGZvcm0pO1xufTtcblxuZXhwb3J0cy5Cb3ggPSBCb3g7XG5leHBvcnRzLkNoYW5uZWwgPSBDaGFubmVsO1xuZXhwb3J0cy5DTE9TRUQgPSBDTE9TRUQ7XG4iXX0=