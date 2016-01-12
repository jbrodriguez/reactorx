"use strict";

var Box = require("./channels").Box;

var AltHandler = function AltHandler(flag, f) {
  this.f = f;
  this.flag = flag;
};

AltHandler.prototype.is_active = function () {
  return this.flag.value;
};

AltHandler.prototype.is_blockable = function () {
  return true;
};

AltHandler.prototype.commit = function () {
  this.flag.value = false;
  return this.f;
};

var AltResult = function AltResult(value, channel) {
  this.value = value;
  this.channel = channel;
};

function rand_int(n) {
  return Math.floor(Math.random() * (n + 1));
}

function random_array(n) {
  var a = new Array(n);
  var i;
  for (i = 0; i < n; i++) {
    a[i] = 0;
  }
  for (i = 1; i < n; i++) {
    var j = rand_int(i);
    a[i] = a[j];
    a[j] = i;
  }
  return a;
}

var hasOwnProperty = Object.prototype.hasOwnProperty;

var DEFAULT = {
  toString: function toString() {
    return "[object DEFAULT]";
  }
};

// TODO: Accept a priority function or something
exports.do_alts = function (operations, callback, options) {
  var length = operations.length;
  // XXX Hmm
  if (length === 0) {
    throw new Error("Empty alt list");
  }

  var priority = options && options.priority ? true : false;
  if (!priority) {
    var indexes = random_array(length);
  }

  var flag = new Box(true);

  for (var i = 0; i < length; i++) {
    var operation = operations[priority ? i : indexes[i]];
    var port, result;
    // XXX Hmm
    if (operation instanceof Array) {
      var value = operation[1];
      port = operation[0];
      // We wrap this in a function to capture the value of "port",
      // because js' closure captures vars by "references", not
      // values. "let port" would have worked, but I don't want to
      // raise the runtime requirement yet. TODO: So change this when
      // most runtimes are modern enough.
      result = port._put(value, (function (port) {
        return new AltHandler(flag, function (ok) {
          callback(new AltResult(ok, port));
        });
      })(port));
    } else {
      port = operation;
      result = port._take((function (port) {
        return new AltHandler(flag, function (value) {
          callback(new AltResult(value, port));
        });
      })(port));
    }
    // XXX Hmm
    if (result instanceof Box) {
      callback(new AltResult(result.value, port));
      break;
    }
  }

  if (!(result instanceof Box) && options && hasOwnProperty.call(options, "default")) {
    if (flag.value) {
      flag.value = false;
      callback(new AltResult(options["default"], DEFAULT));
    }
  }
};

exports.DEFAULT = DEFAULT;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3RtcC9qcy1jc3AvaW1wbC9zZWxlY3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUViLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLENBQUM7O0FBRXBDLElBQUksVUFBVSxHQUFHLFNBQWIsVUFBVSxDQUFZLElBQUksRUFBRSxDQUFDLEVBQUU7QUFDakMsTUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDWCxNQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztDQUNsQixDQUFDOztBQUVGLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFlBQVc7QUFDMUMsU0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztDQUN4QixDQUFDOztBQUVGLFVBQVUsQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLFlBQVc7QUFDN0MsU0FBTyxJQUFJLENBQUM7Q0FDYixDQUFDOztBQUVGLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLFlBQVc7QUFDdkMsTUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ3hCLFNBQU8sSUFBSSxDQUFDLENBQUMsQ0FBQztDQUNmLENBQUM7O0FBRUYsSUFBSSxTQUFTLEdBQUcsU0FBWixTQUFTLENBQVksS0FBSyxFQUFFLE9BQU8sRUFBRTtBQUN2QyxNQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNuQixNQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztDQUN4QixDQUFDOztBQUVGLFNBQVMsUUFBUSxDQUFDLENBQUMsRUFBRTtBQUNuQixTQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUEsQUFBQyxDQUFDLENBQUM7Q0FDNUM7O0FBRUQsU0FBUyxZQUFZLENBQUMsQ0FBQyxFQUFFO0FBQ3ZCLE1BQUksQ0FB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QyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUM1QyxZQUFNO0tBQ1A7R0FDRjs7QUFFRCxNQUFJLEVBQUUsTUFBTSxZQUFZLEdBQUcsQ0FBQSxBQUFDLElBQ3JCLE9BQU8sSUFDUCxjQUFjLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsRUFBRTtBQUM5QyxRQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7QUFDZCxVQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNuQixjQUFRLENBQUMsSUFBSSxTQUFTLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7S0FDdEQ7R0FDRjtDQUNGLENBQUM7O0FBRUYsT0FBTyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMiLCJmaWxlIjoic2VsZWN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBCb3ggPSByZXF1aXJlKFwiLi9jaGFubmVsc1wiKS5Cb3g7XG5cbnZhciBBbHRIYW5kbGVyID0gZnVuY3Rpb24oZmxhZywgZikge1xuICB0aGlzLmYgPSBmO1xuICB0aGlzLmZsYWcgPSBmbGFnO1xufTtcblxuQWx0SGFuZGxlci5wcm90b3R5cGUuaXNfYWN0aXZlID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmZsYWcudmFsdWU7XG59O1xuXG5BbHRIYW5kbGVyLnByb3RvdHlwZS5pc19ibG9ja2FibGUgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRydWU7XG59O1xuXG5BbHRIYW5kbGVyLnByb3RvdHlwZS5jb21taXQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5mbGFnLnZhbHVlID0gZmFsc2U7XG4gIHJldHVybiB0aGlzLmY7XG59O1xuXG52YXIgQWx0UmVzdWx0ID0gZnVuY3Rpb24odmFsdWUsIGNoYW5uZWwpIHtcbiAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICB0aGlzLmNoYW5uZWwgPSBjaGFubmVsO1xufTtcblxuZnVuY3Rpb24gcmFuZF9pbnQobikge1xuICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG4gKyAxKSk7XG59XG5cbmZ1bmN0aW9uIHJhbmRvbV9hcnJheShuKSB7XG4gIHZhciBhID0gbmV3IEFycmF5KG4pO1xuICB2YXIgaTtcbiAgZm9yIChpID0gMDsgaSA8IG47IGkrKykge1xuICAgIGFbaV0gPSAwO1xuICB9XG4gIGZvciAoaSA9IDE7IGkgPCBuOyBpKyspIHtcbiAgICB2YXIgaiA9IHJhbmRfaW50KGkpO1xuICAgIGFbaV0gPSBhW2pdO1xuICAgIGFbal0gPSBpO1xuICB9XG4gIHJldHVybiBhO1xufVxuXG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG52YXIgREVGQVVMVCA9IHtcbiAgdG9TdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBcIltvYmplY3QgREVGQVVMVF1cIjtcbiAgfVxufTtcblxuLy8gVE9ETzogQWNjZXB0IGEgcHJpb3JpdHkgZnVuY3Rpb24gb3Igc29tZXRoaW5nXG5leHBvcnRzLmRvX2FsdHMgPSBmdW5jdGlvbihvcGVyYXRpb25zLCBjYWxsYmFjaywgb3B0aW9ucykge1xuICB2YXIgbGVuZ3RoID0gb3BlcmF0aW9ucy5sZW5ndGg7XG4gIC8vIFhYWCBIbW1cbiAgaWYgKGxlbmd0aCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkVtcHR5IGFsdCBsaXN0XCIpO1xuICB9XG5cbiAgdmFyIHByaW9yaXR5ID0gKG9wdGlvbnMgJiYgb3B0aW9ucy5wcmlvcml0eSkgPyB0cnVlIDogZmFsc2U7XG4gIGlmICghcHJpb3JpdHkpIHtcbiAgICB2YXIgaW5kZXhlcyA9IHJhbmRvbV9hcnJheShsZW5ndGgpO1xuICB9XG5cbiAgdmFyIGZsYWcgPSBuZXcgQm94KHRydWUpO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgb3BlcmF0aW9uID0gb3BlcmF0aW9uc1twcmlvcml0eSA/IGkgOiBpbmRleGVzW2ldXTtcbiAgICB2YXIgcG9ydCwgcmVzdWx0O1xuICAgIC8vIFhYWCBIbW1cbiAgICBpZiAob3BlcmF0aW9uIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIHZhciB2YWx1ZSA9IG9wZXJhdGlvblsxXTtcbiAgICAgIHBvcnQgPSBvcGVyYXRpb25bMF07XG4gICAgICAvLyBXZSB3cmFwIHRoaXMgaW4gYSBmdW5jdGlvbiB0byBjYXB0dXJlIHRoZSB2YWx1ZSBvZiBcInBvcnRcIixcbiAgICAgIC8vIGJlY2F1c2UganMnIGNsb3N1cmUgY2FwdHVyZXMgdmFycyBieSBcInJlZmVyZW5jZXNcIiwgbm90XG4gICAgICAvLyB2YWx1ZXMuIFwibGV0IHBvcnRcIiB3b3VsZCBoYXZlIHdvcmtlZCwgYnV0IEkgZG9uJ3Qgd2FudCB0b1xuICAgICAgLy8gcmFpc2UgdGhlIHJ1bnRpbWUgcmVxdWlyZW1lbnQgeWV0LiBUT0RPOiBTbyBjaGFuZ2UgdGhpcyB3aGVuXG4gICAgICAvLyBtb3N0IHJ1bnRpbWVzIGFyZSBtb2Rlcm4gZW5vdWdoLlxuICAgICAgcmVzdWx0ID0gcG9ydC5fcHV0KHZhbHVlLCAoZnVuY3Rpb24ocG9ydCkge1xuICAgICAgICByZXR1cm4gbmV3IEFsdEhhbmRsZXIoZmxhZywgZnVuY3Rpb24ob2spIHtcbiAgICAgICAgICBjYWxsYmFjayhuZXcgQWx0UmVzdWx0KG9rLCBwb3J0KSk7XG4gICAgICAgIH0pO1xuICAgICAgfSkocG9ydCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwb3J0ID0gb3BlcmF0aW9uO1xuICAgICAgcmVzdWx0ID0gcG9ydC5fdGFrZSgoZnVuY3Rpb24ocG9ydCkge1xuICAgICAgICByZXR1cm4gbmV3IEFsdEhhbmRsZXIoZmxhZywgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICBjYWxsYmFjayhuZXcgQWx0UmVzdWx0KHZhbHVlLCBwb3J0KSk7XG4gICAgICAgIH0pO1xuICAgICAgfSkocG9ydCkpO1xuICAgIH1cbiAgICAvLyBYWFggSG1tXG4gICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIEJveCkge1xuICAgICAgY2FsbGJhY2sobmV3IEFsdFJlc3VsdChyZXN1bHQudmFsdWUsIHBvcnQpKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGlmICghKHJlc3VsdCBpbnN0YW5jZW9mIEJveClcbiAgICAgICYmIG9wdGlvbnNcbiAgICAgICYmIGhhc093blByb3BlcnR5LmNhbGwob3B0aW9ucywgXCJkZWZhdWx0XCIpKSB7XG4gICAgaWYgKGZsYWcudmFsdWUpIHtcbiAgICAgIGZsYWcudmFsdWUgPSBmYWxzZTtcbiAgICAgIGNhbGxiYWNrKG5ldyBBbHRSZXN1bHQob3B0aW9uc1tcImRlZmF1bHRcIl0sIERFRkFVTFQpKTtcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydHMuREVGQVVMVCA9IERFRkFVTFQ7XG4iXX0=