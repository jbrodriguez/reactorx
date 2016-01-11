"use strict";

var marked0$0 = [mapcat].map(regeneratorRuntime.mark);

var Box = require("./impl/channels").Box;

var csp = require("./csp.core"),
    go = csp.go,
    take = csp.take,
    put = csp.put,
    takeAsync = csp.takeAsync,
    putAsync = csp.putAsync,
    alts = csp.alts,
    chan = csp.chan,
    CLOSED = csp.CLOSED;

function mapFrom(f, ch) {
  return {
    is_closed: function is_closed() {
      return ch.is_closed();
    },
    close: function close() {
      ch.close();
    },
    _put: function _put(value, handler) {
      return ch._put(value, handler);
    },
    _take: function _take(handler) {
      var result = ch._take({
        is_active: function is_active() {
          return handler.is_active();
        },
        commit: function commit() {
          var take_cb = handler.commit();
          return function (value) {
            return take_cb(value === CLOSED ? CLOSED : f(value));
          };
        }
      });
      if (result) {
        var value = result.value;
        return new Box(value === CLOSED ? CLOSED : f(value));
      } else {
        return null;
      }
    }
  };
}

function mapInto(f, ch) {
  return {
    is_closed: function is_closed() {
      return ch.is_closed();
    },
    close: function close() {
      ch.close();
    },
    _put: function _put(value, handler) {
      return ch._put(f(value), handler);
    },
    _take: function _take(handler) {
      return ch._take(handler);
    }
  };
}

function filterFrom(p, ch, bufferOrN) {
  var out = chan(bufferOrN);
  go(regeneratorRuntime.mark(function callee$1$0() {
    var value;

    return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
      while (1) {
        switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (!true) {
              context$2$0.next = 12;
              break;
            }

            context$2$0.next = 3;
            return take(ch);
          case 3:
            value = context$2$0.sent;

            if (!(value === CLOSED)) {
              context$2$0.next = 7;
              break;
            }

            out.close();
            return context$2$0.abrupt("break", 12);
          case 7:
            if (!p(value)) {
              context$2$0.next = 10;
              break;
            }

            context$2$0.next = 10;
            return put(out, value);
          case 10:
            context$2$0.next = 0;
            break;
          case 12:
          case "end":
            return context$2$0.stop();
        }
      }
    }, callee$1$0, this);
  }));
  return out;
}

function filterInto(p, ch) {
  return {
    is_closed: function is_closed() {
      return ch.is_closed();
    },
    close: function close() {
      ch.close();
    },
    _put: function _put(value, handler) {
      if (p(value)) {
        return ch._put(value, handler);
      } else {
        return new Box(!ch.is_closed());
      }
    },
    _take: function _take(handler) {
      return ch._take(handler);
    }
  };
}

function removeFrom(p, ch) {
  return filterFrom(function (value) {
    return !p(value);
  }, ch);
}

function removeInto(p, ch) {
  return filterInto(function (value) {
    return !p(value);
  }, ch);
}

function mapcat(f, src, dst) {
  var value, seq, length, i;

  return regeneratorRuntime.wrap(function mapcat$(context$1$0) {
    while (1) {
      switch (context$1$0.prev = context$1$0.next) {
        case 0:
          if (!true) {
            context$1$0.next = 22;
            break;
          }

          context$1$0.next = 3;
          return take(src);
        case 3:
          value = context$1$0.sent;

          if (!(value === CLOSED)) {
            context$1$0.next = 9;
            break;
          }

          dst.close();
          return context$1$0.abrupt("break", 22);
        case 9:
          seq = f(value);
          length = seq.length;
          i = 0;
        case 12:
          if (!(i < length)) {
            context$1$0.next = 18;
            break;
          }

          context$1$0.next = 15;
          return put(dst, seq[i]);
        case 15:
          i++;
          context$1$0.next = 12;
          break;
        case 18:
          if (!dst.is_closed()) {
            context$1$0.next = 20;
            break;
          }

          return context$1$0.abrupt("break", 22);
        case 20:
          context$1$0.next = 0;
          break;
        case 22:
        case "end":
          return context$1$0.stop();
      }
    }
  }, marked0$0[0], this);
}

function mapcatFrom(f, ch, bufferOrN) {
  var out = chan(bufferOrN);
  go(mapcat, [f, ch, out]);
  return out;
}

function mapcatInto(f, ch, bufferOrN) {
  var src = chan(bufferOrN);
  go(mapcat, [f, src, ch]);
  return src;
}

function pipe(src, dst, keepOpen) {
  go(regeneratorRuntime.mark(function callee$1$0() {
    var value;

    return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
      while (1) {
        switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (!true) {
              context$2$0.next = 13;
              break;
            }

            context$2$0.next = 3;
            return take(src);
          case 3:
            value = context$2$0.sent;

            if (!(value === CLOSED)) {
              context$2$0.next = 7;
              break;
            }

            if (!keepOpen) {
              dst.close();
            }
            return context$2$0.abrupt("break", 13);
          case 7:
            context$2$0.next = 9;
            return put(dst, value);
          case 9:
            if (context$2$0.sent) {
              context$2$0.next = 11;
              break;
            }

            return context$2$0.abrupt("break", 13);
          case 11:
            context$2$0.next = 0;
            break;
          case 13:
          case "end":
            return context$2$0.stop();
        }
      }
    }, callee$1$0, this);
  }));
  return dst;
}

function split(p, ch, trueBufferOrN, falseBufferOrN) {
  var tch = chan(trueBufferOrN);
  var fch = chan(falseBufferOrN);
  go(regeneratorRuntime.mark(function callee$1$0() {
    var value;

    return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
      while (1) {
        switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (!true) {
              context$2$0.next = 12;
              break;
            }

            context$2$0.next = 3;
            return take(ch);
          case 3:
            value = context$2$0.sent;

            if (!(value === CLOSED)) {
              context$2$0.next = 8;
              break;
            }

            tch.close();
            fch.close();
            return context$2$0.abrupt("break", 12);
          case 8:
            context$2$0.next = 10;
            return put(p(value) ? tch : fch, value);
          case 10:
            context$2$0.next = 0;
            break;
          case 12:
          case "end":
            return context$2$0.stop();
        }
      }
    }, callee$1$0, this);
  }));
  return [tch, fch];
}

function reduce(f, init, ch) {
  return go(regeneratorRuntime.mark(function callee$1$0() {
    var result, value;

    return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
      while (1) {
        switch (context$2$0.prev = context$2$0.next) {
          case 0:
            result = init;
          case 1:
            if (!true) {
              context$2$0.next = 12;
              break;
            }

            context$2$0.next = 4;
            return take(ch);
          case 4:
            value = context$2$0.sent;

            if (!(value === CLOSED)) {
              context$2$0.next = 9;
              break;
            }

            return context$2$0.abrupt("return", result);
          case 9:
            result = f(result, value);
          case 10:
            context$2$0.next = 1;
            break;
          case 12:
          case "end":
            return context$2$0.stop();
        }
      }
    }, callee$1$0, this);
  }), [], true);
}

function onto(ch, coll, keepOpen) {
  return go(regeneratorRuntime.mark(function callee$1$0() {
    var length, i;

    return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
      while (1) {
        switch (context$2$0.prev = context$2$0.next) {
          case 0:
            length = coll.length;
            i = 0;
          case 2:
            if (!(i < length)) {
              context$2$0.next = 8;
              break;
            }

            context$2$0.next = 5;
            return put(ch, coll[i]);
          case 5:
            i++;
            context$2$0.next = 2;
            break;
          case 8:
            if (!keepOpen) {
              ch.close();
            }
          case 9:
          case "end":
            return context$2$0.stop();
        }
      }
    }, callee$1$0, this);
  }));
}

// TODO: Bounded?
function fromColl(coll) {
  var ch = chan(coll.length);
  onto(ch, coll);
  return ch;
}

function map(f, chs, bufferOrN) {
  var out = chan(bufferOrN);
  var length = chs.length;
  // Array holding 1 round of values
  var values = new Array(length);
  // TODO: Not sure why we need a size-1 buffer here
  var dchan = chan(1);
  // How many more items this round
  var dcount;
  // put callbacks for each channel
  var dcallbacks = new Array(length);
  for (var i = 0; i < length; i++) {
    dcallbacks[i] = (function (i) {
      return function (value) {
        values[i] = value;
        dcount--;
        if (dcount === 0) {
          putAsync(dchan, values.slice(0));
        }
      };
    })(i);
  }
  go(regeneratorRuntime.mark(function callee$1$0() {
    var i, values;

    return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
      while (1) {
        switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (!true) {
              context$2$0.next = 18;
              break;
            }

            dcount = length;
            // We could just launch n goroutines here, but for effciency we
            // don't
            for (i = 0; i < length; i++) {
              try {
                takeAsync(chs[i], dcallbacks[i]);
              } catch (e) {
                // FIX: Hmm why catching here?
                dcount--;
              }
            }
            context$2$0.next = 5;
            return take(dchan);
          case 5:
            values = context$2$0.sent;
            i = 0;
          case 7:
            if (!(i < length)) {
              context$2$0.next = 14;
              break;
            }

            if (!(values[i] === CLOSED)) {
              context$2$0.next = 11;
              break;
            }

            out.close();
            return context$2$0.abrupt("return");
          case 11:
            i++;
            context$2$0.next = 7;
            break;
          case 14:
            context$2$0.next = 16;
            return put(out, f.apply(null, values));
          case 16:
            context$2$0.next = 0;
            break;
          case 18:
          case "end":
            return context$2$0.stop();
        }
      }
    }, callee$1$0, this);
  }));
  return out;
}

function merge(chs, bufferOrN) {
  var out = chan(bufferOrN);
  var actives = chs.slice(0);
  go(regeneratorRuntime.mark(function callee$1$0() {
    var r, value, i;

    return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
      while (1) {
        switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (!true) {
              context$2$0.next = 15;
              break;
            }

            if (!(actives.length === 0)) {
              context$2$0.next = 3;
              break;
            }

            return context$2$0.abrupt("break", 15);
          case 3:
            context$2$0.next = 5;
            return alts(actives);
          case 5:
            r = context$2$0.sent;
            value = r.value;

            if (!(value === CLOSED)) {
              context$2$0.next = 11;
              break;
            }

            i = actives.indexOf(r.channel);
            actives.splice(i, 1);
            return context$2$0.abrupt("continue", 0);
          case 11:
            context$2$0.next = 13;
            return put(out, value);
          case 13:
            context$2$0.next = 0;
            break;
          case 15:
            out.close();
          case 16:
          case "end":
            return context$2$0.stop();
        }
      }
    }, callee$1$0, this);
  }));
  return out;
}

function into(coll, ch) {
  var result = coll.slice(0);
  return reduce(function (result, item) {
    result.push(item);
    return result;
  }, result, ch);
}

function takeN(n, ch, bufferOrN) {
  var out = chan(bufferOrN);
  go(regeneratorRuntime.mark(function callee$1$0() {
    var i, value;

    return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
      while (1) {
        switch (context$2$0.prev = context$2$0.next) {
          case 0:
            i = 0;
          case 1:
            if (!(i < n)) {
              context$2$0.next = 12;
              break;
            }

            context$2$0.next = 4;
            return take(ch);
          case 4:
            value = context$2$0.sent;

            if (!(value === CLOSED)) {
              context$2$0.next = 7;
              break;
            }

            return context$2$0.abrupt("break", 12);
          case 7:
            context$2$0.next = 9;
            return put(out, value);
          case 9:
            i++;
            context$2$0.next = 1;
            break;
          case 12:
            out.close();
          case 13:
          case "end":
            return context$2$0.stop();
        }
      }
    }, callee$1$0, this);
  }));
  return out;
}

var NOTHING = {};

function unique(ch, bufferOrN) {
  var out = chan(bufferOrN);
  var last = NOTHING;
  go(regeneratorRuntime.mark(function callee$1$0() {
    var value;

    return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
      while (1) {
        switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (!true) {
              context$2$0.next = 13;
              break;
            }

            context$2$0.next = 3;
            return take(ch);
          case 3:
            value = context$2$0.sent;

            if (!(value === CLOSED)) {
              context$2$0.next = 6;
              break;
            }

            return context$2$0.abrupt("break", 13);
          case 6:
            if (!(value === last)) {
              context$2$0.next = 8;
              break;
            }

            return context$2$0.abrupt("continue", 0);
          case 8:
            last = value;
            context$2$0.next = 11;
            return put(out, value);
          case 11:
            context$2$0.next = 0;
            break;
          case 13:
            out.close();
          case 14:
          case "end":
            return context$2$0.stop();
        }
      }
    }, callee$1$0, this);
  }));
  return out;
}

function partitionBy(f, ch, bufferOrN) {
  var out = chan(bufferOrN);
  var part = [];
  var last = NOTHING;
  go(regeneratorRuntime.mark(function callee$1$0() {
    var value, newItem;

    return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
      while (1) {
        switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (!true) {
              context$2$0.next = 23;
              break;
            }

            context$2$0.next = 3;
            return take(ch);
          case 3:
            value = context$2$0.sent;

            if (!(value === CLOSED)) {
              context$2$0.next = 12;
              break;
            }

            if (!(part.length > 0)) {
              context$2$0.next = 8;
              break;
            }

            context$2$0.next = 8;
            return put(out, part);
          case 8:
            out.close();
            return context$2$0.abrupt("break", 23);
          case 12:
            newItem = f(value);

            if (!(newItem === last || last === NOTHING)) {
              context$2$0.next = 17;
              break;
            }

            part.push(value);
            context$2$0.next = 20;
            break;
          case 17:
            context$2$0.next = 19;
            return put(out, part);
          case 19:
            part = [value];
          case 20:
            last = newItem;
          case 21:
            context$2$0.next = 0;
            break;
          case 23:
          case "end":
            return context$2$0.stop();
        }
      }
    }, callee$1$0, this);
  }));
  return out;
}

function partition(n, ch, bufferOrN) {
  var out = chan(bufferOrN);
  go(regeneratorRuntime.mark(function callee$1$0() {
    var part, i, value;

    return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
      while (1) {
        switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (!true) {
              context$2$0.next = 21;
              break;
            }

            part = new Array(n);
            i = 0;
          case 3:
            if (!(i < n)) {
              context$2$0.next = 17;
              break;
            }

            context$2$0.next = 6;
            return take(ch);
          case 6:
            value = context$2$0.sent;

            if (!(value === CLOSED)) {
              context$2$0.next = 13;
              break;
            }

            if (!(i > 0)) {
              context$2$0.next = 11;
              break;
            }

            context$2$0.next = 11;
            return put(out, part.slice(0, i));
          case 11:
            out.close();
            return context$2$0.abrupt("return");
          case 13:
            part[i] = value;
          case 14:
            i++;
            context$2$0.next = 3;
            break;
          case 17:
            context$2$0.next = 19;
            return put(out, part);
          case 19:
            context$2$0.next = 0;
            break;
          case 21:
          case "end":
            return context$2$0.stop();
        }
      }
    }, callee$1$0, this);
  }));
  return out;
}

// For channel identification
var genId = (function () {
  var i = 0;
  return function () {
    i++;
    return "" + i;
  };
})();

var ID_ATTR = "__csp_channel_id";

// TODO: Do we need to check with hasOwnProperty?
function len(obj) {
  var count = 0;
  for (var p in obj) {
    count++;
  }
  return count;
}

function chanId(ch) {
  var id = ch[ID_ATTR];
  if (id === undefined) {
    id = ch[ID_ATTR] = genId();
  }
  return id;
}

var Mult = function Mult(ch) {
  this.taps = {};
  this.ch = ch;
};

var Tap = function Tap(channel, keepOpen) {
  this.channel = channel;
  this.keepOpen = keepOpen;
};

Mult.prototype.muxch = function () {
  return this.ch;
};

Mult.prototype.tap = function (ch, keepOpen) {
  var id = chanId(ch);
  this.taps[id] = new Tap(ch, keepOpen);
};

Mult.prototype.untap = function (ch) {
  delete this.taps[chanId(ch)];
};

Mult.prototype.untapAll = function () {
  this.taps = {};
};

function mult(ch) {
  var m = new Mult(ch);
  var dchan = chan(1);
  var dcount;
  function makeDoneCallback(tap) {
    return function (stillOpen) {
      dcount--;
      if (dcount === 0) {
        putAsync(dchan, true);
      }
      if (!stillOpen) {
        m.untap(tap.channel);
      }
    };
  }
  go(regeneratorRuntime.mark(function callee$1$0() {
    var value, id, t, taps, initDcount;

    return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
      while (1) {
        switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (!true) {
              context$2$0.next = 17;
              break;
            }

            context$2$0.next = 3;
            return take(ch);
          case 3:
            value = context$2$0.sent;
            taps = m.taps;

            if (!(value === CLOSED)) {
              context$2$0.next = 9;
              break;
            }

            for (id in taps) {
              t = taps[id];
              if (!t.keepOpen) {
                t.channel.close();
              }
            }
            // TODO: Is this necessary?
            m.untapAll();
            return context$2$0.abrupt("break", 17);
          case 9:
            dcount = len(taps);
            initDcount = dcount;
            // Put value on tapping channels...
            for (id in taps) {
              t = taps[id];
              putAsync(t.channel, value, makeDoneCallback(t));
            }

            if (!(initDcount > 0)) {
              context$2$0.next = 15;
              break;
            }

            context$2$0.next = 15;
            return take(dchan);
          case 15:
            context$2$0.next = 0;
            break;
          case 17:
          case "end":
            return context$2$0.stop();
        }
      }
    }, callee$1$0, this);
  }));
  return m;
}

mult.tap = function tap(m, ch, keepOpen) {
  m.tap(ch, keepOpen);
  return ch;
};

mult.untap = function untap(m, ch) {
  m.untap(ch);
};

mult.untapAll = function untapAll(m) {
  m.untapAll();
};

var Mix = function Mix(ch) {
  this.ch = ch;
  this.stateMap = {};
  this.change = chan();
  this.soloMode = mix.MUTE;
};

Mix.prototype._changed = function () {
  putAsync(this.change, true);
};

Mix.prototype._getAllState = function () {
  var allState = {};
  var stateMap = this.stateMap;
  var solos = [];
  var mutes = [];
  var pauses = [];
  var reads;
  for (var id in stateMap) {
    var chanData = stateMap[id];
    var state = chanData.state;
    var channel = chanData.channel;
    if (state[mix.SOLO]) {
      solos.push(channel);
    }
    // TODO
    if (state[mix.MUTE]) {
      mutes.push(channel);
    }
    if (state[mix.PAUSE]) {
      pauses.push(channel);
    }
  }
  var i, n;
  if (this.soloMode === mix.PAUSE && solos.length > 0) {
    n = solos.length;
    reads = new Array(n + 1);
    for (i = 0; i < n; i++) {
      reads[i] = solos[i];
    }
    reads[n] = this.change;
  } else {
    reads = [];
    for (id in stateMap) {
      chanData = stateMap[id];
      channel = chanData.channel;
      if (pauses.indexOf(channel) < 0) {
        reads.push(channel);
      }
    }
    reads.push(this.change);
  }

  return {
    solos: solos,
    mutes: mutes,
    reads: reads
  };
};

Mix.prototype.admix = function (ch) {
  this.stateMap[chanId(ch)] = {
    channel: ch,
    state: {}
  };
  this._changed();
};

Mix.prototype.unmix = function (ch) {
  delete this.stateMap[chanId(ch)];
  this._changed();
};

Mix.prototype.unmixAll = function () {
  this.stateMap = {};
  this._changed();
};

Mix.prototype.toggle = function (updateStateList) {
  // [[ch1, {}], [ch2, {solo: true}]];
  var length = updateStateList.length;
  for (var i = 0; i < length; i++) {
    var ch = updateStateList[i][0];
    var id = chanId(ch);
    var updateState = updateStateList[i][1];
    var chanData = this.stateMap[id];
    if (!chanData) {
      chanData = this.stateMap[id] = {
        channel: ch,
        state: {}
      };
    }
    for (var mode in updateState) {
      chanData.state[mode] = updateState[mode];
    }
  }
  this._changed();
};

Mix.prototype.setSoloMode = function (mode) {
  if (VALID_SOLO_MODES.indexOf(mode) < 0) {
    throw new Error("Mode must be one of: ", VALID_SOLO_MODES.join(", "));
  }
  this.soloMode = mode;
  this._changed();
};

function mix(out) {
  var m = new Mix(out);
  go(regeneratorRuntime.mark(function callee$1$0() {
    var state, result, value, channel, solos, stillOpen;

    return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
      while (1) {
        switch (context$2$0.prev = context$2$0.next) {
          case 0:
            state = m._getAllState();
          case 1:
            if (!true) {
              context$2$0.next = 23;
              break;
            }

            context$2$0.next = 4;
            return alts(state.reads);
          case 4:
            result = context$2$0.sent;
            value = result.value;
            channel = result.channel;

            if (!(value === CLOSED)) {
              context$2$0.next = 11;
              break;
            }

            delete m.stateMap[chanId(channel)];
            state = m._getAllState();
            return context$2$0.abrupt("continue", 1);
          case 11:
            if (!(channel === m.change)) {
              context$2$0.next = 14;
              break;
            }

            state = m._getAllState();
            return context$2$0.abrupt("continue", 1);
          case 14:
            solos = state.solos;

            if (!(solos.indexOf(channel) > -1 || solos.length === 0 && !(state.mutes.indexOf(channel) > -1))) {
              context$2$0.next = 21;
              break;
            }

            context$2$0.next = 18;
            return put(out, value);
          case 18:
            stillOpen = context$2$0.sent;

            if (stillOpen) {
              context$2$0.next = 21;
              break;
            }

            return context$2$0.abrupt("break", 23);
          case 21:
            context$2$0.next = 1;
            break;
          case 23:
          case "end":
            return context$2$0.stop();
        }
      }
    }, callee$1$0, this);
  }));
  return m;
}

mix.MUTE = "mute";
mix.PAUSE = "pause";
mix.SOLO = "solo";
var VALID_SOLO_MODES = [mix.MUTE, mix.PAUSE];

mix.add = function admix(m, ch) {
  m.admix(ch);
};

mix.remove = function unmix(m, ch) {
  m.unmix(ch);
};

mix.removeAll = function unmixAll(m) {
  m.unmixAll();
};

mix.toggle = function toggle(m, updateStateList) {
  m.toggle(updateStateList);
};

mix.setSoloMode = function setSoloMode(m, mode) {
  m.setSoloMode(mode);
};

function constantlyNull() {
  return null;
}

var Pub = function Pub(ch, topicFn, bufferFn) {
  this.ch = ch;
  this.topicFn = topicFn;
  this.bufferFn = bufferFn;
  this.mults = {};
};

Pub.prototype._ensureMult = function (topic) {
  var m = this.mults[topic];
  var bufferFn = this.bufferFn;
  if (!m) {
    m = this.mults[topic] = mult(chan(bufferFn(topic)));
  }
  return m;
};

Pub.prototype.sub = function (topic, ch, keepOpen) {
  var m = this._ensureMult(topic);
  return mult.tap(m, ch, keepOpen);
};

Pub.prototype.unsub = function (topic, ch) {
  var m = this.mults[topic];
  if (m) {
    mult.untap(m, ch);
  }
};

Pub.prototype.unsubAll = function (topic) {
  if (topic === undefined) {
    this.mults = {};
  } else {
    delete this.mults[topic];
  }
};

function pub(ch, topicFn, bufferFn) {
  bufferFn = bufferFn || constantlyNull;
  var p = new Pub(ch, topicFn, bufferFn);
  go(regeneratorRuntime.mark(function callee$1$0() {
    var value, mults, topic, m, stillOpen;

    return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
      while (1) {
        switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (!true) {
              context$2$0.next = 17;
              break;
            }

            context$2$0.next = 3;
            return take(ch);
          case 3:
            value = context$2$0.sent;
            mults = p.mults;

            if (!(value === CLOSED)) {
              context$2$0.next = 8;
              break;
            }

            for (topic in mults) {
              mults[topic].muxch().close();
            }
            return context$2$0.abrupt("break", 17);
          case 8:
            // TODO: Somehow ensure/document that this must return a string
            // (otherwise use proper (hash)maps)
            topic = topicFn(value);
            m = mults[topic];

            if (!m) {
              context$2$0.next = 15;
              break;
            }

            context$2$0.next = 13;
            return put(m.muxch(), value);
          case 13:
            stillOpen = context$2$0.sent;
            if (!stillOpen) {
              delete mults[topic];
            }
          case 15:
            context$2$0.next = 0;
            break;
          case 17:
          case "end":
            return context$2$0.stop();
        }
      }
    }, callee$1$0, this);
  }));
  return p;
}

pub.sub = function sub(p, topic, ch, keepOpen) {
  return p.sub(topic, ch, keepOpen);
};

pub.unsub = function unsub(p, topic, ch) {
  p.unsub(topic, ch);
};

pub.unsubAll = function unsubAll(p, topic) {
  p.unsubAll(topic);
};

// Possible "fluid" interfaces:
// thread(
//   [fromColl, [1, 2, 3, 4]],
//   [mapFrom, inc],
//   [into, []]
// )
// thread(
//   [fromColl, [1, 2, 3, 4]],
//   [mapFrom, inc, _],
//   [into, [], _]
// )
// wrap()
//   .fromColl([1, 2, 3, 4])
//   .mapFrom(inc)
//   .into([])
//   .unwrap();
module.exports = {
  mapFrom: mapFrom,
  mapInto: mapInto,
  filterFrom: filterFrom,
  filterInto: filterInto,
  removeFrom: removeFrom,
  removeInto: removeInto,
  mapcatFrom: mapcatFrom,
  mapcatInto: mapcatInto,

  pipe: pipe,
  split: split,
  reduce: reduce,
  onto: onto,
  fromColl: fromColl,

  map: map,
  merge: merge,
  into: into,
  take: takeN,
  unique: unique,
  partition: partition,
  partitionBy: partitionBy,

  mult: mult,
  mix: mix,
  pub: pub
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9qcy1jc3AvY3NwLm9wZXJhdGlvbnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUViLElBQUksU0FBUyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDOztBQUV0RCxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxHQUFHLENBQUM7O0FBRXpDLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUM7SUFDM0IsRUFBRSxHQUFHLEdBQUcsQ0FBQyxFQUFFO0lBQ1gsSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJO0lBQ2YsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHO0lBQ2IsU0FBUyxHQUFHLEdBQUcsQ0FBQyxTQUFTO0lBQ3pCLFFBQVEsR0FBRyxHQUFHLENBQUMsUUFBUTtJQUN2QixJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUk7SUFDZixJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUk7SUFDZixNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQzs7QUFHeEIsU0FBUyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRTtBQUN0QixTQUFPO0FBQ0wsYUFBUyxFQUFFLHFCQUFXO0FBQ3BCLGFBQU8sRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDO0tBQ3ZCO0FBQ0QsU0FBSyxFQUFFLGlCQUFXO0FBQ2hCLFFBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUNaO0FBQ0QsUUFBSSxFQUFFLGNBQVMsS0FBSyxFQUFFLE9BQU8sRUFBRTtBQUM3QixhQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQ2hDO0FBQ0QsU0FBSyxFQUFFLGVBQVMsT0FBTyxFQUFFO0FBQ3ZCLFVBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7QUFDcEIsaUJBQVMsRUFBRSxxQkFBVztBQUNw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LEVBQUUsVUFBVTtBQUN0QixZQUFVLEVBQUUsVUFBVTtBQUN0QixZQUFVLEVBQUUsVUFBVTtBQUN0QixZQUFVLEVBQUUsVUFBVTtBQUN0QixZQUFVLEVBQUUsVUFBVTtBQUN0QixZQUFVLEVBQUUsVUFBVTs7QUFFdEIsTUFBSSxFQUFFLElBQUk7QUFDVixPQUFLLEVBQUUsS0FBSztBQUNaLFFBQU0sRUFBRSxNQUFNO0FBQ2QsTUFBSSxFQUFFLElBQUk7QUFDVixVQUFRLEVBQUUsUUFBUTs7QUFFbEIsS0FBRyxFQUFFLEdBQUc7QUFDUixPQUFLLEVBQUUsS0FBSztBQUNaLE1BQUksRUFBRSxJQUFJO0FBQ1YsTUFBSSxFQUFFLEtBQUs7QUFDWCxRQUFNLEVBQUUsTUFBTTtBQUNkLFdBQVMsRUFBRSxTQUFTO0FBQ3BCLGFBQVcsRUFBRSxXQUFXOztBQUV4QixNQUFJLEVBQUUsSUFBSTtBQUNWLEtBQUcsRUFBRSxHQUFHO0FBQ1IsS0FBRyxFQUFFLEdBQUc7Q0FDVCxDQUFDIiwiZmlsZSI6ImNzcC5vcGVyYXRpb25zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBtYXJrZWQwJDAgPSBbbWFwY2F0XS5tYXAocmVnZW5lcmF0b3JSdW50aW1lLm1hcmspO1xuXG52YXIgQm94ID0gcmVxdWlyZShcIi4vaW1wbC9jaGFubmVsc1wiKS5Cb3g7XG5cbnZhciBjc3AgPSByZXF1aXJlKFwiLi9jc3AuY29yZVwiKSxcbiAgICBnbyA9IGNzcC5nbyxcbiAgICB0YWtlID0gY3NwLnRha2UsXG4gICAgcHV0ID0gY3NwLnB1dCxcbiAgICB0YWtlQXN5bmMgPSBjc3AudGFrZUFzeW5jLFxuICAgIHB1dEFzeW5jID0gY3NwLnB1dEFzeW5jLFxuICAgIGFsdHMgPSBjc3AuYWx0cyxcbiAgICBjaGFuID0gY3NwLmNoYW4sXG4gICAgQ0xPU0VEID0gY3NwLkNMT1NFRDtcblxuXG5mdW5jdGlvbiBtYXBGcm9tKGYsIGNoKSB7XG4gIHJldHVybiB7XG4gICAgaXNfY2xvc2VkOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBjaC5pc19jbG9zZWQoKTtcbiAgICB9LFxuICAgIGNsb3NlOiBmdW5jdGlvbigpIHtcbiAgICAgIGNoLmNsb3NlKCk7XG4gICAgfSxcbiAgICBfcHV0OiBmdW5jdGlvbih2YWx1ZSwgaGFuZGxlcikge1xuICAgICAgcmV0dXJuIGNoLl9wdXQodmFsdWUsIGhhbmRsZXIpO1xuICAgIH0sXG4gICAgX3Rha2U6IGZ1bmN0aW9uKGhhbmRsZXIpIHtcbiAgICAgIHZhciByZXN1bHQgPSBjaC5fdGFrZSh7XG4gICAgICAgIGlzX2FjdGl2ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIGhhbmRsZXIuaXNfYWN0aXZlKCk7XG4gICAgICAgIH0sXG4gICAgICAgIGNvbW1pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIHRha2VfY2IgPSBoYW5kbGVyLmNvbW1pdCgpO1xuICAgICAgICAgIHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRha2VfY2IodmFsdWUgPT09IENMT1NFRCA/IENMT1NFRCA6IGYodmFsdWUpKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gcmVzdWx0LnZhbHVlO1xuICAgICAgICByZXR1cm4gbmV3IEJveCh2YWx1ZSA9PT0gQ0xPU0VEID8gQ0xPU0VEIDogZih2YWx1ZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBtYXBJbnRvKGYsIGNoKSB7XG4gIHJldHVybiB7XG4gICAgaXNfY2xvc2VkOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBjaC5pc19jbG9zZWQoKTtcbiAgICB9LFxuICAgIGNsb3NlOiBmdW5jdGlvbigpIHtcbiAgICAgIGNoLmNsb3NlKCk7XG4gICAgfSxcbiAgICBfcHV0OiBmdW5jdGlvbih2YWx1ZSwgaGFuZGxlcikge1xuICAgICAgcmV0dXJuIGNoLl9wdXQoZih2YWx1ZSksIGhhbmRsZXIpO1xuICAgIH0sXG4gICAgX3Rha2U6IGZ1bmN0aW9uKGhhbmRsZXIpIHtcbiAgICAgIHJldHVybiBjaC5fdGFrZShoYW5kbGVyKTtcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGZpbHRlckZyb20ocCwgY2gsIGJ1ZmZlck9yTikge1xuICB2YXIgb3V0ID0gY2hhbihidWZmZXJPck4pO1xuICBnbyhyZWdlbmVyYXRvclJ1bnRpbWUubWFyayhmdW5jdGlvbiBjYWxsZWUkMSQwKCkge1xuICAgIHZhciB2YWx1ZTtcblxuICAgIHJldHVybiByZWdlbmVyYXRvclJ1bnRpbWUud3JhcChmdW5jdGlvbiBjYWxsZWUkMSQwJChjb250ZXh0JDIkMCkge1xuICAgICAgd2hpbGUgKDEpIHN3aXRjaCAoY29udGV4dCQyJDAucHJldiA9IGNvbnRleHQkMiQwLm5leHQpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgaWYgKCF0cnVlKSB7XG4gICAgICAgICAgY29udGV4dCQyJDAubmV4dCA9IDEyO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgY29udGV4dCQyJDAubmV4dCA9IDM7XG4gICAgICAgIHJldHVybiB0YWtlKGNoKTtcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgdmFsdWUgPSBjb250ZXh0JDIkMC5zZW50O1xuXG4gICAgICAgIGlmICghKHZhbHVlID09PSBDTE9TRUQpKSB7XG4gICAgICAgICAgY29udGV4dCQyJDAubmV4dCA9IDc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBvdXQuY2xvc2UoKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQkMiQwLmFicnVwdChcImJyZWFrXCIsIDEyKTtcbiAgICAgIGNhc2UgNzpcbiAgICAgICAgaWYgKCFwKHZhbHVlKSkge1xuICAgICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSAxMDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSAxMDtcbiAgICAgICAgcmV0dXJuIHB1dChvdXQsIHZhbHVlKTtcbiAgICAgIGNhc2UgMTA6XG4gICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSAwO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMTI6XG4gICAgICBjYXNlIFwiZW5kXCI6XG4gICAgICAgIHJldHVybiBjb250ZXh0JDIkMC5zdG9wKCk7XG4gICAgICB9XG4gICAgfSwgY2FsbGVlJDEkMCwgdGhpcyk7XG4gIH0pKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuZnVuY3Rpb24gZmlsdGVySW50byhwLCBjaCkge1xuICByZXR1cm4ge1xuICAgIGlzX2Nsb3NlZDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gY2guaXNfY2xvc2VkKCk7XG4gICAgfSxcbiAgICBjbG9zZTogZnVuY3Rpb24oKSB7XG4gICAgICBjaC5jbG9zZSgpO1xuICAgIH0sXG4gICAgX3B1dDogZnVuY3Rpb24odmFsdWUsIGhhbmRsZXIpIHtcbiAgICAgIGlmIChwKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gY2guX3B1dCh2YWx1ZSwgaGFuZGxlcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IEJveCghY2guaXNfY2xvc2VkKCkpO1xuICAgICAgfVxuICAgIH0sXG4gICAgX3Rha2U6IGZ1bmN0aW9uKGhhbmRsZXIpIHtcbiAgICAgIHJldHVybiBjaC5fdGFrZShoYW5kbGVyKTtcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUZyb20ocCwgY2gpIHtcbiAgcmV0dXJuIGZpbHRlckZyb20oZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gIXAodmFsdWUpO1xuICB9LCBjaCk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUludG8ocCwgY2gpIHtcbiAgcmV0dXJuIGZpbHRlckludG8oZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gIXAodmFsdWUpO1xuICB9LCBjaCk7XG59XG5cbmZ1bmN0aW9uIG1hcGNhdChmLCBzcmMsIGRzdCkge1xuICB2YXIgdmFsdWUsIHNlcSwgbGVuZ3RoLCBpO1xuXG4gIHJldHVybiByZWdlbmVyYXRvclJ1bnRpbWUud3JhcChmdW5jdGlvbiBtYXBjYXQkKGNvbnRleHQkMSQwKSB7XG4gICAgd2hpbGUgKDEpIHN3aXRjaCAoY29udGV4dCQxJDAucHJldiA9IGNvbnRleHQkMSQwLm5leHQpIHtcbiAgICBjYXNlIDA6XG4gICAgICBpZiAoIXRydWUpIHtcbiAgICAgICAgY29udGV4dCQxJDAubmV4dCA9IDIyO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgY29udGV4dCQxJDAubmV4dCA9IDM7XG4gICAgICByZXR1cm4gdGFrZShzcmMpO1xuICAgIGNhc2UgMzpcbiAgICAgIHZhbHVlID0gY29udGV4dCQxJDAuc2VudDtcblxuICAgICAgaWYgKCEodmFsdWUgPT09IENMT1NFRCkpIHtcbiAgICAgICAgY29udGV4dCQxJDAubmV4dCA9IDk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBkc3QuY2xvc2UoKTtcbiAgICAgIHJldHVybiBjb250ZXh0JDEkMC5hYnJ1cHQoXCJicmVha1wiLCAyMik7XG4gICAgY2FzZSA5OlxuICAgICAgc2VxID0gZih2YWx1ZSk7XG4gICAgICBsZW5ndGggPSBzZXEubGVuZ3RoO1xuICAgICAgaSA9IDA7XG4gICAgY2FzZSAxMjpcbiAgICAgIGlmICghKGkgPCBsZW5ndGgpKSB7XG4gICAgICAgIGNvbnRleHQkMSQwLm5leHQgPSAxODtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGNvbnRleHQkMSQwLm5leHQgPSAxNTtcbiAgICAgIHJldHVybiBwdXQoZHN0LCBzZXFbaV0pO1xuICAgIGNhc2UgMTU6XG4gICAgICBpKys7XG4gICAgICBjb250ZXh0JDEkMC5uZXh0ID0gMTI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDE4OlxuICAgICAgaWYgKCFkc3QuaXNfY2xvc2VkKCkpIHtcbiAgICAgICAgY29udGV4dCQxJDAubmV4dCA9IDIwO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNvbnRleHQkMSQwLmFicnVwdChcImJyZWFrXCIsIDIyKTtcbiAgICBjYXNlIDIwOlxuICAgICAgY29udGV4dCQxJDAubmV4dCA9IDA7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDIyOlxuICAgIGNhc2UgXCJlbmRcIjpcbiAgICAgIHJldHVybiBjb250ZXh0JDEkMC5zdG9wKCk7XG4gICAgfVxuICB9LCBtYXJrZWQwJDBbMF0sIHRoaXMpO1xufVxuXG5mdW5jdGlvbiBtYXBjYXRGcm9tKGYsIGNoLCBidWZmZXJPck4pIHtcbiAgdmFyIG91dCA9IGNoYW4oYnVmZmVyT3JOKTtcbiAgZ28obWFwY2F0LCBbZiwgY2gsIG91dF0pO1xuICByZXR1cm4gb3V0O1xufVxuXG5mdW5jdGlvbiBtYXBjYXRJbnRvKGYsIGNoLCBidWZmZXJPck4pIHtcbiAgdmFyIHNyYyA9IGNoYW4oYnVmZmVyT3JOKTtcbiAgZ28obWFwY2F0LCBbZiwgc3JjLCBjaF0pO1xuICByZXR1cm4gc3JjO1xufVxuXG5mdW5jdGlvbiBwaXBlKHNyYywgZHN0LCBrZWVwT3Blbikge1xuICBnbyhyZWdlbmVyYXRvclJ1bnRpbWUubWFyayhmdW5jdGlvbiBjYWxsZWUkMSQwKCkge1xuICAgIHZhciB2YWx1ZTtcblxuICAgIHJldHVybiByZWdlbmVyYXRvclJ1bnRpbWUud3JhcChmdW5jdGlvbiBjYWxsZWUkMSQwJChjb250ZXh0JDIkMCkge1xuICAgICAgd2hpbGUgKDEpIHN3aXRjaCAoY29udGV4dCQyJDAucHJldiA9IGNvbnRleHQkMiQwLm5leHQpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgaWYgKCF0cnVlKSB7XG4gICAgICAgICAgY29udGV4dCQyJDAubmV4dCA9IDEzO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgY29udGV4dCQyJDAubmV4dCA9IDM7XG4gICAgICAgIHJldHVybiB0YWtlKHNyYyk7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIHZhbHVlID0gY29udGV4dCQyJDAuc2VudDtcblxuICAgICAgICBpZiAoISh2YWx1ZSA9PT0gQ0xPU0VEKSkge1xuICAgICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSA3O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFrZWVwT3Blbikge1xuICAgICAgICAgIGRzdC5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb250ZXh0JDIkMC5hYnJ1cHQoXCJicmVha1wiLCAxMyk7XG4gICAgICBjYXNlIDc6XG4gICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSA5O1xuICAgICAgICByZXR1cm4gcHV0KGRzdCwgdmFsdWUpO1xuICAgICAgY2FzZSA5OlxuICAgICAgICBpZiAoY29udGV4dCQyJDAuc2VudCkge1xuICAgICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSAxMTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjb250ZXh0JDIkMC5hYnJ1cHQoXCJicmVha1wiLCAxMyk7XG4gICAgICBjYXNlIDExOlxuICAgICAgICBjb250ZXh0JDIkMC5uZXh0ID0gMDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDEzOlxuICAgICAgY2FzZSBcImVuZFwiOlxuICAgICAgICByZXR1cm4gY29udGV4dCQyJDAuc3RvcCgpO1xuICAgICAgfVxuICAgIH0sIGNhbGxlZSQxJDAsIHRoaXMpO1xuICB9KSk7XG4gIHJldHVybiBkc3Q7XG59XG5cbmZ1bmN0aW9uIHNwbGl0KHAsIGNoLCB0cnVlQnVmZmVyT3JOLCBmYWxzZUJ1ZmZlck9yTikge1xuICB2YXIgdGNoID0gY2hhbih0cnVlQnVmZmVyT3JOKTtcbiAgdmFyIGZjaCA9IGNoYW4oZmFsc2VCdWZmZXJPck4pO1xuICBnbyhyZWdlbmVyYXRvclJ1bnRpbWUubWFyayhmdW5jdGlvbiBjYWxsZWUkMSQwKCkge1xuICAgIHZhciB2YWx1ZTtcblxuICAgIHJldHVybiByZWdlbmVyYXRvclJ1bnRpbWUud3JhcChmdW5jdGlvbiBjYWxsZWUkMSQwJChjb250ZXh0JDIkMCkge1xuICAgICAgd2hpbGUgKDEpIHN3aXRjaCAoY29udGV4dCQyJDAucHJldiA9IGNvbnRleHQkMiQwLm5leHQpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgaWYgKCF0cnVlKSB7XG4gICAgICAgICAgY29udGV4dCQyJDAubmV4dCA9IDEyO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgY29udGV4dCQyJDAubmV4dCA9IDM7XG4gICAgICAgIHJldHVybiB0YWtlKGNoKTtcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgdmFsdWUgPSBjb250ZXh0JDIkMC5zZW50O1xuXG4gICAgICAgIGlmICghKHZhbHVlID09PSBDTE9TRUQpKSB7XG4gICAgICAgICAgY29udGV4dCQyJDAubmV4dCA9IDg7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICB0Y2guY2xvc2UoKTtcbiAgICAgICAgZmNoLmNsb3NlKCk7XG4gICAgICAgIHJldHVybiBjb250ZXh0JDIkMC5hYnJ1cHQoXCJicmVha1wiLCAxMik7XG4gICAgICBjYXNlIDg6XG4gICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSAxMDtcbiAgICAgICAgcmV0dXJuIHB1dChwKHZhbHVlKSA/IHRjaCA6IGZjaCwgdmFsdWUpO1xuICAgICAgY2FzZSAxMDpcbiAgICAgICAgY29udGV4dCQyJDAubmV4dCA9IDA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAxMjpcbiAgICAgIGNhc2UgXCJlbmRcIjpcbiAgICAgICAgcmV0dXJuIGNvbnRleHQkMiQwLnN0b3AoKTtcbiAgICAgIH1cbiAgICB9LCBjYWxsZWUkMSQwLCB0aGlzKTtcbiAgfSkpO1xuICByZXR1cm4gW3RjaCwgZmNoXTtcbn1cblxuZnVuY3Rpb24gcmVkdWNlKGYsIGluaXQsIGNoKSB7XG4gIHJldHVybiBnbyhyZWdlbmVyYXRvclJ1bnRpbWUubWFyayhmdW5jdGlvbiBjYWxsZWUkMSQwKCkge1xuICAgIHZhciByZXN1bHQsIHZhbHVlO1xuXG4gICAgcmV0dXJuIHJlZ2VuZXJhdG9yUnVudGltZS53cmFwKGZ1bmN0aW9uIGNhbGxlZSQxJDAkKGNvbnRleHQkMiQwKSB7XG4gICAgICB3aGlsZSAoMSkgc3dpdGNoIChjb250ZXh0JDIkMC5wcmV2ID0gY29udGV4dCQyJDAubmV4dCkge1xuICAgICAgY2FzZSAwOlxuICAgICAgICByZXN1bHQgPSBpbml0O1xuICAgICAgY2FzZSAxOlxuICAgICAgICBpZiAoIXRydWUpIHtcbiAgICAgICAgICBjb250ZXh0JDIkMC5uZXh0ID0gMTI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBjb250ZXh0JDIkMC5uZXh0ID0gNDtcbiAgICAgICAgcmV0dXJuIHRha2UoY2gpO1xuICAgICAgY2FzZSA0OlxuICAgICAgICB2YWx1ZSA9IGNvbnRleHQkMiQwLnNlbnQ7XG5cbiAgICAgICAgaWYgKCEodmFsdWUgPT09IENMT1NFRCkpIHtcbiAgICAgICAgICBjb250ZXh0JDIkMC5uZXh0ID0gOTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjb250ZXh0JDIkMC5hYnJ1cHQoXCJyZXR1cm5cIiwgcmVzdWx0KTtcbiAgICAgIGNhc2UgOTpcbiAgICAgICAgcmVzdWx0ID0gZihyZXN1bHQsIHZhbHVlKTtcbiAgICAgIGNhc2UgMTA6XG4gICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSAxO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMTI6XG4gICAgICBjYXNlIFwiZW5kXCI6XG4gICAgICAgIHJldHVybiBjb250ZXh0JDIkMC5zdG9wKCk7XG4gICAgICB9XG4gICAgfSwgY2FsbGVlJDEkMCwgdGhpcyk7XG4gIH0pLCBbXSwgdHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIG9udG8oY2gsIGNvbGwsIGtlZXBPcGVuKSB7XG4gIHJldHVybiBnbyhyZWdlbmVyYXRvclJ1bnRpbWUubWFyayhmdW5jdGlvbiBjYWxsZWUkMSQwKCkge1xuICAgIHZhciBsZW5ndGgsIGk7XG5cbiAgICByZXR1cm4gcmVnZW5lcmF0b3JSdW50aW1lLndyYXAoZnVuY3Rpb24gY2FsbGVlJDEkMCQoY29udGV4dCQyJDApIHtcbiAgICAgIHdoaWxlICgxKSBzd2l0Y2ggKGNvbnRleHQkMiQwLnByZXYgPSBjb250ZXh0JDIkMC5uZXh0KSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIGxlbmd0aCA9IGNvbGwubGVuZ3RoO1xuICAgICAgICBpID0gMDtcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaWYgKCEoaSA8IGxlbmd0aCkpIHtcbiAgICAgICAgICBjb250ZXh0JDIkMC5uZXh0ID0gODtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSA1O1xuICAgICAgICByZXR1cm4gcHV0KGNoLCBjb2xsW2ldKTtcbiAgICAgIGNhc2UgNTpcbiAgICAgICAgaSsrO1xuICAgICAgICBjb250ZXh0JDIkMC5uZXh0ID0gMjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDg6XG4gICAgICAgIGlmICgha2VlcE9wZW4pIHtcbiAgICAgICAgICBjaC5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICBjYXNlIDk6XG4gICAgICBjYXNlIFwiZW5kXCI6XG4gICAgICAgIHJldHVybiBjb250ZXh0JDIkMC5zdG9wKCk7XG4gICAgICB9XG4gICAgfSwgY2FsbGVlJDEkMCwgdGhpcyk7XG4gIH0pKTtcbn1cblxuLy8gVE9ETzogQm91bmRlZD9cbmZ1bmN0aW9uIGZyb21Db2xsKGNvbGwpIHtcbiAgdmFyIGNoID0gY2hhbihjb2xsLmxlbmd0aCk7XG4gIG9udG8oY2gsIGNvbGwpO1xuICByZXR1cm4gY2g7XG59XG5cbmZ1bmN0aW9uIG1hcChmLCBjaHMsIGJ1ZmZlck9yTikge1xuICB2YXIgb3V0ID0gY2hhbihidWZmZXJPck4pO1xuICB2YXIgbGVuZ3RoID0gY2hzLmxlbmd0aDtcbiAgLy8gQXJyYXkgaG9sZGluZyAxIHJvdW5kIG9mIHZhbHVlc1xuICB2YXIgdmFsdWVzID0gbmV3IEFycmF5KGxlbmd0aCk7XG4gIC8vIFRPRE86IE5vdCBzdXJlIHdoeSB3ZSBuZWVkIGEgc2l6ZS0xIGJ1ZmZlciBoZXJlXG4gIHZhciBkY2hhbiA9IGNoYW4oMSk7XG4gIC8vIEhvdyBtYW55IG1vcmUgaXRlbXMgdGhpcyByb3VuZFxuICB2YXIgZGNvdW50O1xuICAvLyBwdXQgY2FsbGJhY2tzIGZvciBlYWNoIGNoYW5uZWxcbiAgdmFyIGRjYWxsYmFja3MgPSBuZXcgQXJyYXkobGVuZ3RoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkgKyspIHtcbiAgICBkY2FsbGJhY2tzW2ldID0gKGZ1bmN0aW9uKGkpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICB2YWx1ZXNbaV0gPSB2YWx1ZTtcbiAgICAgICAgZGNvdW50IC0tO1xuICAgICAgICBpZiAoZGNvdW50ID09PSAwKSB7XG4gICAgICAgICAgcHV0QXN5bmMoZGNoYW4sIHZhbHVlcy5zbGljZSgwKSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfShpKSk7XG4gIH1cbiAgZ28ocmVnZW5lcmF0b3JSdW50aW1lLm1hcmsoZnVuY3Rpb24gY2FsbGVlJDEkMCgpIHtcbiAgICB2YXIgaSwgdmFsdWVzO1xuXG4gICAgcmV0dXJuIHJlZ2VuZXJhdG9yUnVudGltZS53cmFwKGZ1bmN0aW9uIGNhbGxlZSQxJDAkKGNvbnRleHQkMiQwKSB7XG4gICAgICB3aGlsZSAoMSkgc3dpdGNoIChjb250ZXh0JDIkMC5wcmV2ID0gY29udGV4dCQyJDAubmV4dCkge1xuICAgICAgY2FzZSAwOlxuICAgICAgICBpZiAoIXRydWUpIHtcbiAgICAgICAgICBjb250ZXh0JDIkMC5uZXh0ID0gMTg7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBkY291bnQgPSBsZW5ndGg7XG4gICAgICAgIC8vIFdlIGNvdWxkIGp1c3QgbGF1bmNoIG4gZ29yb3V0aW5lcyBoZXJlLCBidXQgZm9yIGVmZmNpZW5jeSB3ZVxuICAgICAgICAvLyBkb24ndFxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpICsrKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRha2VBc3luYyhjaHNbaV0sIGRjYWxsYmFja3NbaV0pO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIC8vIEZJWDogSG1tIHdoeSBjYXRjaGluZyBoZXJlP1xuICAgICAgICAgICAgZGNvdW50IC0tO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb250ZXh0JDIkMC5uZXh0ID0gNTtcbiAgICAgICAgcmV0dXJuIHRha2UoZGNoYW4pO1xuICAgICAgY2FzZSA1OlxuICAgICAgICB2YWx1ZXMgPSBjb250ZXh0JDIkMC5zZW50O1xuICAgICAgICBpID0gMDtcbiAgICAgIGNhc2UgNzpcbiAgICAgICAgaWYgKCEoaSA8IGxlbmd0aCkpIHtcbiAgICAgICAgICBjb250ZXh0JDIkMC5uZXh0ID0gMTQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoISh2YWx1ZXNbaV0gPT09IENMT1NFRCkpIHtcbiAgICAgICAgICBjb250ZXh0JDIkMC5uZXh0ID0gMTE7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBvdXQuY2xvc2UoKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQkMiQwLmFicnVwdChcInJldHVyblwiKTtcbiAgICAgIGNhc2UgMTE6XG4gICAgICAgIGkgKys7XG4gICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSA3O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMTQ6XG4gICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSAxNjtcbiAgICAgICAgcmV0dXJuIHB1dChvdXQsIGYuYXBwbHkobnVsbCwgdmFsdWVzKSk7XG4gICAgICBjYXNlIDE2OlxuICAgICAgICBjb250ZXh0JDIkMC5uZXh0ID0gMDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDE4OlxuICAgICAgY2FzZSBcImVuZFwiOlxuICAgICAgICByZXR1cm4gY29udGV4dCQyJDAuc3RvcCgpO1xuICAgICAgfVxuICAgIH0sIGNhbGxlZSQxJDAsIHRoaXMpO1xuICB9KSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbmZ1bmN0aW9uIG1lcmdlKGNocywgYnVmZmVyT3JOKSB7XG4gIHZhciBvdXQgPSBjaGFuKGJ1ZmZlck9yTik7XG4gIHZhciBhY3RpdmVzID0gY2hzLnNsaWNlKDApO1xuICBnbyhyZWdlbmVyYXRvclJ1bnRpbWUubWFyayhmdW5jdGlvbiBjYWxsZWUkMSQwKCkge1xuICAgIHZhciByLCB2YWx1ZSwgaTtcblxuICAgIHJldHVybiByZWdlbmVyYXRvclJ1bnRpbWUud3JhcChmdW5jdGlvbiBjYWxsZWUkMSQwJChjb250ZXh0JDIkMCkge1xuICAgICAgd2hpbGUgKDEpIHN3aXRjaCAoY29udGV4dCQyJDAucHJldiA9IGNvbnRleHQkMiQwLm5leHQpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgaWYgKCF0cnVlKSB7XG4gICAgICAgICAgY29udGV4dCQyJDAubmV4dCA9IDE1O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCEoYWN0aXZlcy5sZW5ndGggPT09IDApKSB7XG4gICAgICAgICAgY29udGV4dCQyJDAubmV4dCA9IDM7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY29udGV4dCQyJDAuYWJydXB0KFwiYnJlYWtcIiwgMTUpO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBjb250ZXh0JDIkMC5uZXh0ID0gNTtcbiAgICAgICAgcmV0dXJuIGFsdHMoYWN0aXZlcyk7XG4gICAgICBjYXNlIDU6XG4gICAgICAgIHIgPSBjb250ZXh0JDIkMC5zZW50O1xuICAgICAgICB2YWx1ZSA9IHIudmFsdWU7XG5cbiAgICAgICAgaWYgKCEodmFsdWUgPT09IENMT1NFRCkpIHtcbiAgICAgICAgICBjb250ZXh0JDIkMC5uZXh0ID0gMTE7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpID0gYWN0aXZlcy5pbmRleE9mKHIuY2hhbm5lbCk7XG4gICAgICAgIGFjdGl2ZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICByZXR1cm4gY29udGV4dCQyJDAuYWJydXB0KFwiY29udGludWVcIiwgMCk7XG4gICAgICBjYXNlIDExOlxuICAgICAgICBjb250ZXh0JDIkMC5uZXh0ID0gMTM7XG4gICAgICAgIHJldHVybiBwdXQob3V0LCB2YWx1ZSk7XG4gICAgICBjYXNlIDEzOlxuICAgICAgICBjb250ZXh0JDIkMC5uZXh0ID0gMDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDE1OlxuICAgICAgICBvdXQuY2xvc2UoKTtcbiAgICAgIGNhc2UgMTY6XG4gICAgICBjYXNlIFwiZW5kXCI6XG4gICAgICAgIHJldHVybiBjb250ZXh0JDIkMC5zdG9wKCk7XG4gICAgICB9XG4gICAgfSwgY2FsbGVlJDEkMCwgdGhpcyk7XG4gIH0pKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuZnVuY3Rpb24gaW50byhjb2xsLCBjaCkge1xuICB2YXIgcmVzdWx0ID0gY29sbC5zbGljZSgwKTtcbiAgcmV0dXJuIHJlZHVjZShmdW5jdGlvbihyZXN1bHQsIGl0ZW0pIHtcbiAgICByZXN1bHQucHVzaChpdGVtKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9LCByZXN1bHQsIGNoKTtcbn1cblxuZnVuY3Rpb24gdGFrZU4obiwgY2gsIGJ1ZmZlck9yTikge1xuICB2YXIgb3V0ID0gY2hhbihidWZmZXJPck4pO1xuICBnbyhyZWdlbmVyYXRvclJ1bnRpbWUubWFyayhmdW5jdGlvbiBjYWxsZWUkMSQwKCkge1xuICAgIHZhciBpLCB2YWx1ZTtcblxuICAgIHJldHVybiByZWdlbmVyYXRvclJ1bnRpbWUud3JhcChmdW5jdGlvbiBjYWxsZWUkMSQwJChjb250ZXh0JDIkMCkge1xuICAgICAgd2hpbGUgKDEpIHN3aXRjaCAoY29udGV4dCQyJDAucHJldiA9IGNvbnRleHQkMiQwLm5leHQpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgaSA9IDA7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIGlmICghKGkgPCBuKSkge1xuICAgICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSAxMjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSA0O1xuICAgICAgICByZXR1cm4gdGFrZShjaCk7XG4gICAgICBjYXNlIDQ6XG4gICAgICAgIHZhbHVlID0gY29udGV4dCQyJDAuc2VudDtcblxuICAgICAgICBpZiAoISh2YWx1ZSA9PT0gQ0xPU0VEKSkge1xuICAgICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSA3O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNvbnRleHQkMiQwLmFicnVwdChcImJyZWFrXCIsIDEyKTtcbiAgICAgIGNhc2UgNzpcbiAgICAgICAgY29udGV4dCQyJDAubmV4dCA9IDk7XG4gICAgICAgIHJldHVybiBwdXQob3V0LCB2YWx1ZSk7XG4gICAgICBjYXNlIDk6XG4gICAgICAgIGkgKys7XG4gICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSAxO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMTI6XG4gICAgICAgIG91dC5jbG9zZSgpO1xuICAgICAgY2FzZSAxMzpcbiAgICAgIGNhc2UgXCJlbmRcIjpcbiAgICAgICAgcmV0dXJuIGNvbnRleHQkMiQwLnN0b3AoKTtcbiAgICAgIH1cbiAgICB9LCBjYWxsZWUkMSQwLCB0aGlzKTtcbiAgfSkpO1xuICByZXR1cm4gb3V0O1xufVxuXG52YXIgTk9USElORyA9IHt9O1xuXG5mdW5jdGlvbiB1bmlxdWUoY2gsIGJ1ZmZlck9yTikge1xuICB2YXIgb3V0ID0gY2hhbihidWZmZXJPck4pO1xuICB2YXIgbGFzdCA9IE5PVEhJTkc7XG4gIGdvKHJlZ2VuZXJhdG9yUnVudGltZS5tYXJrKGZ1bmN0aW9uIGNhbGxlZSQxJDAoKSB7XG4gICAgdmFyIHZhbHVlO1xuXG4gICAgcmV0dXJuIHJlZ2VuZXJhdG9yUnVudGltZS53cmFwKGZ1bmN0aW9uIGNhbGxlZSQxJDAkKGNvbnRleHQkMiQwKSB7XG4gICAgICB3aGlsZSAoMSkgc3dpdGNoIChjb250ZXh0JDIkMC5wcmV2ID0gY29udGV4dCQyJDAubmV4dCkge1xuICAgICAgY2FzZSAwOlxuICAgICAgICBpZiAoIXRydWUpIHtcbiAgICAgICAgICBjb250ZXh0JDIkMC5uZXh0ID0gMTM7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBjb250ZXh0JDIkMC5uZXh0ID0gMztcbiAgICAgICAgcmV0dXJuIHRha2UoY2gpO1xuICAgICAgY2FzZSAzOlxuICAgICAgICB2YWx1ZSA9IGNvbnRleHQkMiQwLnNlbnQ7XG5cbiAgICAgICAgaWYgKCEodmFsdWUgPT09IENMT1NFRCkpIHtcbiAgICAgICAgICBjb250ZXh0JDIkMC5uZXh0ID0gNjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjb250ZXh0JDIkMC5hYnJ1cHQoXCJicmVha1wiLCAxMyk7XG4gICAgICBjYXNlIDY6XG4gICAgICAgIGlmICghKHZhbHVlID09PSBsYXN0KSkge1xuICAgICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSA4O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNvbnRleHQkMiQwLmFicnVwdChcImNvbnRpbnVlXCIsIDApO1xuICAgICAgY2FzZSA4OlxuICAgICAgICBsYXN0ID0gdmFsdWU7XG4gICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSAxMTtcbiAgICAgICAgcmV0dXJuIHB1dChvdXQsIHZhbHVlKTtcbiAgICAgIGNhc2UgMTE6XG4gICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSAwO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMTM6XG4gICAgICAgIG91dC5jbG9zZSgpO1xuICAgICAgY2FzZSAxNDpcbiAgICAgIGNhc2UgXCJlbmRcIjpcbiAgICAgICAgcmV0dXJuIGNvbnRleHQkMiQwLnN0b3AoKTtcbiAgICAgIH1cbiAgICB9LCBjYWxsZWUkMSQwLCB0aGlzKTtcbiAgfSkpO1xuICByZXR1cm4gb3V0O1xufVxuXG5mdW5jdGlvbiBwYXJ0aXRpb25CeShmLCBjaCwgYnVmZmVyT3JOKSB7XG4gIHZhciBvdXQgPSBjaGFuKGJ1ZmZlck9yTik7XG4gIHZhciBwYXJ0ID0gW107XG4gIHZhciBsYXN0ID0gTk9USElORztcbiAgZ28ocmVnZW5lcmF0b3JSdW50aW1lLm1hcmsoZnVuY3Rpb24gY2FsbGVlJDEkMCgpIHtcbiAgICB2YXIgdmFsdWUsIG5ld0l0ZW07XG5cbiAgICByZXR1cm4gcmVnZW5lcmF0b3JSdW50aW1lLndyYXAoZnVuY3Rpb24gY2FsbGVlJDEkMCQoY29udGV4dCQyJDApIHtcbiAgICAgIHdoaWxlICgxKSBzd2l0Y2ggKGNvbnRleHQkMiQwLnByZXYgPSBjb250ZXh0JDIkMC5uZXh0KSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIGlmICghdHJ1ZSkge1xuICAgICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSAyMztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSAzO1xuICAgICAgICByZXR1cm4gdGFrZShjaCk7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIHZhbHVlID0gY29udGV4dCQyJDAuc2VudDtcblxuICAgICAgICBpZiAoISh2YWx1ZSA9PT0gQ0xPU0VEKSkge1xuICAgICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSAxMjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghKHBhcnQubGVuZ3RoID4gMCkpIHtcbiAgICAgICAgICBjb250ZXh0JDIkMC5uZXh0ID0gODtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSA4O1xuICAgICAgICByZXR1cm4gcHV0KG91dCwgcGFydCk7XG4gICAgICBjYXNlIDg6XG4gICAgICAgIG91dC5jbG9zZSgpO1xuICAgICAgICByZXR1cm4gY29udGV4dCQyJDAuYWJydXB0KFwiYnJlYWtcIiwgMjMpO1xuICAgICAgY2FzZSAxMjpcbiAgICAgICAgbmV3SXRlbSA9IGYodmFsdWUpO1xuXG4gICAgICAgIGlmICghKG5ld0l0ZW0gPT09IGxhc3QgfHwgbGFzdCA9PT0gTk9USElORykpIHtcbiAgICAgICAgICBjb250ZXh0JDIkMC5uZXh0ID0gMTc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBwYXJ0LnB1c2godmFsdWUpO1xuICAgICAgICBjb250ZXh0JDIkMC5uZXh0ID0gMjA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAxNzpcbiAgICAgICAgY29udGV4dCQyJDAubmV4dCA9IDE5O1xuICAgICAgICByZXR1cm4gcHV0KG91dCwgcGFydCk7XG4gICAgICBjYXNlIDE5OlxuICAgICAgICBwYXJ0ID0gW3ZhbHVlXTtcbiAgICAgIGNhc2UgMjA6XG4gICAgICAgIGxhc3QgPSBuZXdJdGVtO1xuICAgICAgY2FzZSAyMTpcbiAgICAgICAgY29udGV4dCQyJDAubmV4dCA9IDA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyMzpcbiAgICAgIGNhc2UgXCJlbmRcIjpcbiAgICAgICAgcmV0dXJuIGNvbnRleHQkMiQwLnN0b3AoKTtcbiAgICAgIH1cbiAgICB9LCBjYWxsZWUkMSQwLCB0aGlzKTtcbiAgfSkpO1xuICByZXR1cm4gb3V0O1xufVxuXG5mdW5jdGlvbiBwYXJ0aXRpb24obiwgY2gsIGJ1ZmZlck9yTikge1xuICB2YXIgb3V0ID0gY2hhbihidWZmZXJPck4pO1xuICBnbyhyZWdlbmVyYXRvclJ1bnRpbWUubWFyayhmdW5jdGlvbiBjYWxsZWUkMSQwKCkge1xuICAgIHZhciBwYXJ0LCBpLCB2YWx1ZTtcblxuICAgIHJldHVybiByZWdlbmVyYXRvclJ1bnRpbWUud3JhcChmdW5jdGlvbiBjYWxsZWUkMSQwJChjb250ZXh0JDIkMCkge1xuICAgICAgd2hpbGUgKDEpIHN3aXRjaCAoY29udGV4dCQyJDAucHJldiA9IGNvbnRleHQkMiQwLm5leHQpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgaWYgKCF0cnVlKSB7XG4gICAgICAgICAgY29udGV4dCQyJDAubmV4dCA9IDIxO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgcGFydCA9IG5ldyBBcnJheShuKTtcbiAgICAgICAgaSA9IDA7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGlmICghKGkgPCBuKSkge1xuICAgICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSAxNztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSA2O1xuICAgICAgICByZXR1cm4gdGFrZShjaCk7XG4gICAgICBjYXNlIDY6XG4gICAgICAgIHZhbHVlID0gY29udGV4dCQyJDAuc2VudDtcblxuICAgICAgICBpZiAoISh2YWx1ZSA9PT0gQ0xPU0VEKSkge1xuICAgICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSAxMztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghKGkgPiAwKSkge1xuICAgICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSAxMTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSAxMTtcbiAgICAgICAgcmV0dXJuIHB1dChvdXQsIHBhcnQuc2xpY2UoMCwgaSkpO1xuICAgICAgY2FzZSAxMTpcbiAgICAgICAgb3V0LmNsb3NlKCk7XG4gICAgICAgIHJldHVybiBjb250ZXh0JDIkMC5hYnJ1cHQoXCJyZXR1cm5cIik7XG4gICAgICBjYXNlIDEzOlxuICAgICAgICBwYXJ0W2ldID0gdmFsdWU7XG4gICAgICBjYXNlIDE0OlxuICAgICAgICBpKys7XG4gICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSAzO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMTc6XG4gICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSAxOTtcbiAgICAgICAgcmV0dXJuIHB1dChvdXQsIHBhcnQpO1xuICAgICAgY2FzZSAxOTpcbiAgICAgICAgY29udGV4dCQyJDAubmV4dCA9IDA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyMTpcbiAgICAgIGNhc2UgXCJlbmRcIjpcbiAgICAgICAgcmV0dXJuIGNvbnRleHQkMiQwLnN0b3AoKTtcbiAgICAgIH1cbiAgICB9LCBjYWxsZWUkMSQwLCB0aGlzKTtcbiAgfSkpO1xuICByZXR1cm4gb3V0O1xufVxuXG4vLyBGb3IgY2hhbm5lbCBpZGVudGlmaWNhdGlvblxudmFyIGdlbklkID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgaSA9IDA7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBpICsrO1xuICAgIHJldHVybiBcIlwiICsgaTtcbiAgfTtcbn0pKCk7XG5cbnZhciBJRF9BVFRSID0gXCJfX2NzcF9jaGFubmVsX2lkXCI7XG5cbi8vIFRPRE86IERvIHdlIG5lZWQgdG8gY2hlY2sgd2l0aCBoYXNPd25Qcm9wZXJ0eT9cbmZ1bmN0aW9uIGxlbihvYmopIHtcbiAgdmFyIGNvdW50ID0gMDtcbiAgZm9yICh2YXIgcCBpbiBvYmopIHtcbiAgICBjb3VudCArKztcbiAgfVxuICByZXR1cm4gY291bnQ7XG59XG5cbmZ1bmN0aW9uIGNoYW5JZChjaCkge1xuICB2YXIgaWQgPSBjaFtJRF9BVFRSXTtcbiAgaWYgKGlkID09PSB1bmRlZmluZWQpIHtcbiAgICBpZCA9IGNoW0lEX0FUVFJdID0gZ2VuSWQoKTtcbiAgfVxuICByZXR1cm4gaWQ7XG59XG5cbnZhciBNdWx0ID0gZnVuY3Rpb24oY2gpIHtcbiAgdGhpcy50YXBzID0ge307XG4gIHRoaXMuY2ggPSBjaDtcbn07XG5cbnZhciBUYXAgPSBmdW5jdGlvbihjaGFubmVsLCBrZWVwT3Blbikge1xuICB0aGlzLmNoYW5uZWwgPSBjaGFubmVsO1xuICB0aGlzLmtlZXBPcGVuID0ga2VlcE9wZW47XG59O1xuXG5NdWx0LnByb3RvdHlwZS5tdXhjaCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5jaDtcbn07XG5cbk11bHQucHJvdG90eXBlLnRhcCA9IGZ1bmN0aW9uKGNoLCBrZWVwT3Blbikge1xuICB2YXIgaWQgPSBjaGFuSWQoY2gpO1xuICB0aGlzLnRhcHNbaWRdID0gbmV3IFRhcChjaCwga2VlcE9wZW4pO1xufTtcblxuTXVsdC5wcm90b3R5cGUudW50YXAgPSBmdW5jdGlvbihjaCkge1xuICBkZWxldGUgdGhpcy50YXBzW2NoYW5JZChjaCldO1xufTtcblxuTXVsdC5wcm90b3R5cGUudW50YXBBbGwgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy50YXBzID0ge307XG59O1xuXG5mdW5jdGlvbiBtdWx0KGNoKSB7XG4gIHZhciBtID0gbmV3IE11bHQoY2gpO1xuICB2YXIgZGNoYW4gPSBjaGFuKDEpO1xuICB2YXIgZGNvdW50O1xuICBmdW5jdGlvbiBtYWtlRG9uZUNhbGxiYWNrKHRhcCkge1xuICAgIHJldHVybiBmdW5jdGlvbihzdGlsbE9wZW4pIHtcbiAgICAgIGRjb3VudCAtLTtcbiAgICAgIGlmIChkY291bnQgPT09IDApIHtcbiAgICAgICAgcHV0QXN5bmMoZGNoYW4sIHRydWUpO1xuICAgICAgfVxuICAgICAgaWYgKCFzdGlsbE9wZW4pIHtcbiAgICAgICAgbS51bnRhcCh0YXAuY2hhbm5lbCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICBnbyhyZWdlbmVyYXRvclJ1bnRpbWUubWFyayhmdW5jdGlvbiBjYWxsZWUkMSQwKCkge1xuICAgIHZhciB2YWx1ZSwgaWQsIHQsIHRhcHMsIGluaXREY291bnQ7XG5cbiAgICByZXR1cm4gcmVnZW5lcmF0b3JSdW50aW1lLndyYXAoZnVuY3Rpb24gY2FsbGVlJDEkMCQoY29udGV4dCQyJDApIHtcbiAgICAgIHdoaWxlICgxKSBzd2l0Y2ggKGNvbnRleHQkMiQwLnByZXYgPSBjb250ZXh0JDIkMC5uZXh0KSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIGlmICghdHJ1ZSkge1xuICAgICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSAxNztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSAzO1xuICAgICAgICByZXR1cm4gdGFrZShjaCk7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIHZhbHVlID0gY29udGV4dCQyJDAuc2VudDtcbiAgICAgICAgdGFwcyA9IG0udGFwcztcblxuICAgICAgICBpZiAoISh2YWx1ZSA9PT0gQ0xPU0VEKSkge1xuICAgICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSA5O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChpZCBpbiB0YXBzKSB7XG4gICAgICAgICAgdCA9IHRhcHNbaWRdO1xuICAgICAgICAgIGlmICghdC5rZWVwT3Blbikge1xuICAgICAgICAgICAgdC5jaGFubmVsLmNsb3NlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFRPRE86IElzIHRoaXMgbmVjZXNzYXJ5P1xuICAgICAgICBtLnVudGFwQWxsKCk7XG4gICAgICAgIHJldHVybiBjb250ZXh0JDIkMC5hYnJ1cHQoXCJicmVha1wiLCAxNyk7XG4gICAgICBjYXNlIDk6XG4gICAgICAgIGRjb3VudCA9IGxlbih0YXBzKTtcbiAgICAgICAgaW5pdERjb3VudCA9IGRjb3VudDtcbiAgICAgICAgLy8gUHV0IHZhbHVlIG9uIHRhcHBpbmcgY2hhbm5lbHMuLi5cbiAgICAgICAgZm9yIChpZCBpbiB0YXBzKSB7XG4gICAgICAgICAgdCA9IHRhcHNbaWRdO1xuICAgICAgICAgIHB1dEFzeW5jKHQuY2hhbm5lbCwgdmFsdWUsIG1ha2VEb25lQ2FsbGJhY2sodCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCEoaW5pdERjb3VudCA+IDApKSB7XG4gICAgICAgICAgY29udGV4dCQyJDAubmV4dCA9IDE1O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgY29udGV4dCQyJDAubmV4dCA9IDE1O1xuICAgICAgICByZXR1cm4gdGFrZShkY2hhbik7XG4gICAgICBjYXNlIDE1OlxuICAgICAgICBjb250ZXh0JDIkMC5uZXh0ID0gMDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDE3OlxuICAgICAgY2FzZSBcImVuZFwiOlxuICAgICAgICByZXR1cm4gY29udGV4dCQyJDAuc3RvcCgpO1xuICAgICAgfVxuICAgIH0sIGNhbGxlZSQxJDAsIHRoaXMpO1xuICB9KSk7XG4gIHJldHVybiBtO1xufVxuXG5tdWx0LnRhcCA9IGZ1bmN0aW9uIHRhcChtLCBjaCwga2VlcE9wZW4pIHtcbiAgbS50YXAoY2gsIGtlZXBPcGVuKTtcbiAgcmV0dXJuIGNoO1xufTtcblxubXVsdC51bnRhcCA9IGZ1bmN0aW9uIHVudGFwKG0sIGNoKSB7XG4gIG0udW50YXAoY2gpO1xufTtcblxubXVsdC51bnRhcEFsbCA9IGZ1bmN0aW9uIHVudGFwQWxsKG0pIHtcbiAgbS51bnRhcEFsbCgpO1xufTtcblxudmFyIE1peCA9IGZ1bmN0aW9uKGNoKSB7XG4gIHRoaXMuY2ggPSBjaDtcbiAgdGhpcy5zdGF0ZU1hcCA9IHt9O1xuICB0aGlzLmNoYW5nZSA9IGNoYW4oKTtcbiAgdGhpcy5zb2xvTW9kZSA9IG1peC5NVVRFO1xufTtcblxuTWl4LnByb3RvdHlwZS5fY2hhbmdlZCA9IGZ1bmN0aW9uKCkge1xuICBwdXRBc3luYyh0aGlzLmNoYW5nZSwgdHJ1ZSk7XG59O1xuXG5NaXgucHJvdG90eXBlLl9nZXRBbGxTdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgYWxsU3RhdGUgPSB7fTtcbiAgdmFyIHN0YXRlTWFwID0gdGhpcy5zdGF0ZU1hcDtcbiAgdmFyIHNvbG9zID0gW107XG4gIHZhciBtdXRlcyA9IFtdO1xuICB2YXIgcGF1c2VzID0gW107XG4gIHZhciByZWFkcztcbiAgZm9yICh2YXIgaWQgaW4gc3RhdGVNYXApIHtcbiAgICB2YXIgY2hhbkRhdGEgPSBzdGF0ZU1hcFtpZF07XG4gICAgdmFyIHN0YXRlID0gY2hhbkRhdGEuc3RhdGU7XG4gICAgdmFyIGNoYW5uZWwgPSBjaGFuRGF0YS5jaGFubmVsO1xuICAgIGlmIChzdGF0ZVttaXguU09MT10pIHtcbiAgICAgIHNvbG9zLnB1c2goY2hhbm5lbCk7XG4gICAgfVxuICAgIC8vIFRPRE9cbiAgICBpZiAoc3RhdGVbbWl4Lk1VVEVdKSB7XG4gICAgICBtdXRlcy5wdXNoKGNoYW5uZWwpO1xuICAgIH1cbiAgICBpZiAoc3RhdGVbbWl4LlBBVVNFXSkge1xuICAgICAgcGF1c2VzLnB1c2goY2hhbm5lbCk7XG4gICAgfVxuICB9XG4gIHZhciBpLCBuO1xuICBpZiAodGhpcy5zb2xvTW9kZSA9PT0gbWl4LlBBVVNFICYmIHNvbG9zLmxlbmd0aCA+IDApIHtcbiAgICBuID0gc29sb3MubGVuZ3RoO1xuICAgIHJlYWRzID0gbmV3IEFycmF5KG4gKyAxKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbjsgaSsrKSB7XG4gICAgICByZWFkc1tpXSA9IHNvbG9zW2ldO1xuICAgIH1cbiAgICByZWFkc1tuXSA9IHRoaXMuY2hhbmdlO1xuICB9IGVsc2Uge1xuICAgIHJlYWRzID0gW107XG4gICAgZm9yIChpZCBpbiBzdGF0ZU1hcCkge1xuICAgICAgY2hhbkRhdGEgPSBzdGF0ZU1hcFtpZF07XG4gICAgICBjaGFubmVsID0gY2hhbkRhdGEuY2hhbm5lbDtcbiAgICAgIGlmIChwYXVzZXMuaW5kZXhPZihjaGFubmVsKSA8IDApIHtcbiAgICAgICAgcmVhZHMucHVzaChjaGFubmVsKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVhZHMucHVzaCh0aGlzLmNoYW5nZSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHNvbG9zOiBzb2xvcyxcbiAgICBtdXRlczogbXV0ZXMsXG4gICAgcmVhZHM6IHJlYWRzXG4gIH07XG59O1xuXG5NaXgucHJvdG90eXBlLmFkbWl4ID0gZnVuY3Rpb24oY2gpIHtcbiAgdGhpcy5zdGF0ZU1hcFtjaGFuSWQoY2gpXSA9IHtcbiAgICBjaGFubmVsOiBjaCxcbiAgICBzdGF0ZToge31cbiAgfTtcbiAgdGhpcy5fY2hhbmdlZCgpO1xufTtcblxuTWl4LnByb3RvdHlwZS51bm1peCA9IGZ1bmN0aW9uKGNoKSB7XG4gIGRlbGV0ZSB0aGlzLnN0YXRlTWFwW2NoYW5JZChjaCldO1xuICB0aGlzLl9jaGFuZ2VkKCk7XG59O1xuXG5NaXgucHJvdG90eXBlLnVubWl4QWxsID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuc3RhdGVNYXAgPSB7fTtcbiAgdGhpcy5fY2hhbmdlZCgpO1xufTtcblxuTWl4LnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbih1cGRhdGVTdGF0ZUxpc3QpIHtcbiAgLy8gW1tjaDEsIHt9XSwgW2NoMiwge3NvbG86IHRydWV9XV07XG4gIHZhciBsZW5ndGggPSB1cGRhdGVTdGF0ZUxpc3QubGVuZ3RoO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGNoID0gdXBkYXRlU3RhdGVMaXN0W2ldWzBdO1xuICAgIHZhciBpZCA9IGNoYW5JZChjaCk7XG4gICAgdmFyIHVwZGF0ZVN0YXRlID0gdXBkYXRlU3RhdGVMaXN0W2ldWzFdO1xuICAgIHZhciBjaGFuRGF0YSA9IHRoaXMuc3RhdGVNYXBbaWRdO1xuICAgIGlmICghY2hhbkRhdGEpIHtcbiAgICAgIGNoYW5EYXRhID0gdGhpcy5zdGF0ZU1hcFtpZF0gPSB7XG4gICAgICAgIGNoYW5uZWw6IGNoLFxuICAgICAgICBzdGF0ZToge31cbiAgICAgIH07XG4gICAgfVxuICAgIGZvciAodmFyIG1vZGUgaW4gdXBkYXRlU3RhdGUpIHtcbiAgICAgIGNoYW5EYXRhLnN0YXRlW21vZGVdID0gdXBkYXRlU3RhdGVbbW9kZV07XG4gICAgfVxuICB9XG4gIHRoaXMuX2NoYW5nZWQoKTtcbn07XG5cbk1peC5wcm90b3R5cGUuc2V0U29sb01vZGUgPSBmdW5jdGlvbihtb2RlKSB7XG4gIGlmIChWQUxJRF9TT0xPX01PREVTLmluZGV4T2YobW9kZSkgPCAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTW9kZSBtdXN0IGJlIG9uZSBvZjogXCIsIFZBTElEX1NPTE9fTU9ERVMuam9pbihcIiwgXCIpKTtcbiAgfVxuICB0aGlzLnNvbG9Nb2RlID0gbW9kZTtcbiAgdGhpcy5fY2hhbmdlZCgpO1xufTtcblxuZnVuY3Rpb24gbWl4KG91dCkge1xuICB2YXIgbSA9IG5ldyBNaXgob3V0KTtcbiAgZ28ocmVnZW5lcmF0b3JSdW50aW1lLm1hcmsoZnVuY3Rpb24gY2FsbGVlJDEkMCgpIHtcbiAgICB2YXIgc3RhdGUsIHJlc3VsdCwgdmFsdWUsIGNoYW5uZWwsIHNvbG9zLCBzdGlsbE9wZW47XG5cbiAgICByZXR1cm4gcmVnZW5lcmF0b3JSdW50aW1lLndyYXAoZnVuY3Rpb24gY2FsbGVlJDEkMCQoY29udGV4dCQyJDApIHtcbiAgICAgIHdoaWxlICgxKSBzd2l0Y2ggKGNvbnRleHQkMiQwLnByZXYgPSBjb250ZXh0JDIkMC5uZXh0KSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIHN0YXRlID0gbS5fZ2V0QWxsU3RhdGUoKTtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaWYgKCF0cnVlKSB7XG4gICAgICAgICAgY29udGV4dCQyJDAubmV4dCA9IDIzO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgY29udGV4dCQyJDAubmV4dCA9IDQ7XG4gICAgICAgIHJldHVybiBhbHRzKHN0YXRlLnJlYWRzKTtcbiAgICAgIGNhc2UgNDpcbiAgICAgICAgcmVzdWx0ID0gY29udGV4dCQyJDAuc2VudDtcbiAgICAgICAgdmFsdWUgPSByZXN1bHQudmFsdWU7XG4gICAgICAgIGNoYW5uZWwgPSByZXN1bHQuY2hhbm5lbDtcblxuICAgICAgICBpZiAoISh2YWx1ZSA9PT0gQ0xPU0VEKSkge1xuICAgICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSAxMTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGRlbGV0ZSBtLnN0YXRlTWFwW2NoYW5JZChjaGFubmVsKV07XG4gICAgICAgIHN0YXRlID0gbS5fZ2V0QWxsU3RhdGUoKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQkMiQwLmFicnVwdChcImNvbnRpbnVlXCIsIDEpO1xuICAgICAgY2FzZSAxMTpcbiAgICAgICAgaWYgKCEoY2hhbm5lbCA9PT0gbS5jaGFuZ2UpKSB7XG4gICAgICAgICAgY29udGV4dCQyJDAubmV4dCA9IDE0O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGUgPSBtLl9nZXRBbGxTdGF0ZSgpO1xuICAgICAgICByZXR1cm4gY29udGV4dCQyJDAuYWJydXB0KFwiY29udGludWVcIiwgMSk7XG4gICAgICBjYXNlIDE0OlxuICAgICAgICBzb2xvcyA9IHN0YXRlLnNvbG9zO1xuXG4gICAgICAgIGlmICghKHNvbG9zLmluZGV4T2YoY2hhbm5lbCkgPiAtMSB8fCBzb2xvcy5sZW5ndGggPT09IDAgJiYgIShzdGF0ZS5tdXRlcy5pbmRleE9mKGNoYW5uZWwpID4gLTEpKSkge1xuICAgICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSAyMTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSAxODtcbiAgICAgICAgcmV0dXJuIHB1dChvdXQsIHZhbHVlKTtcbiAgICAgIGNhc2UgMTg6XG4gICAgICAgIHN0aWxsT3BlbiA9IGNvbnRleHQkMiQwLnNlbnQ7XG5cbiAgICAgICAgaWYgKHN0aWxsT3Blbikge1xuICAgICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSAyMTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjb250ZXh0JDIkMC5hYnJ1cHQoXCJicmVha1wiLCAyMyk7XG4gICAgICBjYXNlIDIxOlxuICAgICAgICBjb250ZXh0JDIkMC5uZXh0ID0gMTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDIzOlxuICAgICAgY2FzZSBcImVuZFwiOlxuICAgICAgICByZXR1cm4gY29udGV4dCQyJDAuc3RvcCgpO1xuICAgICAgfVxuICAgIH0sIGNhbGxlZSQxJDAsIHRoaXMpO1xuICB9KSk7XG4gIHJldHVybiBtO1xufVxuXG5taXguTVVURSA9IFwibXV0ZVwiO1xubWl4LlBBVVNFID0gXCJwYXVzZVwiO1xubWl4LlNPTE8gPSBcInNvbG9cIjtcbnZhciBWQUxJRF9TT0xPX01PREVTID0gW21peC5NVVRFLCBtaXguUEFVU0VdO1xuXG5taXguYWRkID0gZnVuY3Rpb24gYWRtaXgobSwgY2gpIHtcbiAgbS5hZG1peChjaCk7XG59O1xuXG5taXgucmVtb3ZlID0gZnVuY3Rpb24gdW5taXgobSwgY2gpIHtcbiAgbS51bm1peChjaCk7XG59O1xuXG5taXgucmVtb3ZlQWxsID0gZnVuY3Rpb24gdW5taXhBbGwobSkge1xuICBtLnVubWl4QWxsKCk7XG59O1xuXG5taXgudG9nZ2xlID0gZnVuY3Rpb24gdG9nZ2xlKG0sIHVwZGF0ZVN0YXRlTGlzdCkge1xuICBtLnRvZ2dsZSh1cGRhdGVTdGF0ZUxpc3QpO1xufTtcblxubWl4LnNldFNvbG9Nb2RlID0gZnVuY3Rpb24gc2V0U29sb01vZGUobSwgbW9kZSkge1xuICBtLnNldFNvbG9Nb2RlKG1vZGUpO1xufTtcblxuZnVuY3Rpb24gY29uc3RhbnRseU51bGwoKSB7XG4gIHJldHVybiBudWxsO1xufVxuXG52YXIgUHViID0gZnVuY3Rpb24oY2gsIHRvcGljRm4sIGJ1ZmZlckZuKSB7XG4gIHRoaXMuY2ggPSBjaDtcbiAgdGhpcy50b3BpY0ZuID0gdG9waWNGbjtcbiAgdGhpcy5idWZmZXJGbiA9IGJ1ZmZlckZuO1xuICB0aGlzLm11bHRzID0ge307XG59O1xuXG5QdWIucHJvdG90eXBlLl9lbnN1cmVNdWx0ID0gZnVuY3Rpb24odG9waWMpIHtcbiAgdmFyIG0gPSB0aGlzLm11bHRzW3RvcGljXTtcbiAgdmFyIGJ1ZmZlckZuID0gdGhpcy5idWZmZXJGbjtcbiAgaWYgKCFtKSB7XG4gICAgbSA9IHRoaXMubXVsdHNbdG9waWNdID0gbXVsdChjaGFuKGJ1ZmZlckZuKHRvcGljKSkpO1xuICB9XG4gIHJldHVybiBtO1xufTtcblxuUHViLnByb3RvdHlwZS5zdWIgPSBmdW5jdGlvbih0b3BpYywgY2gsIGtlZXBPcGVuKSB7XG4gIHZhciBtID0gdGhpcy5fZW5zdXJlTXVsdCh0b3BpYyk7XG4gIHJldHVybiBtdWx0LnRhcChtLCBjaCwga2VlcE9wZW4pO1xufTtcblxuUHViLnByb3RvdHlwZS51bnN1YiA9IGZ1bmN0aW9uKHRvcGljLCBjaCkge1xuICB2YXIgbSA9IHRoaXMubXVsdHNbdG9waWNdO1xuICBpZiAobSkge1xuICAgIG11bHQudW50YXAobSwgY2gpO1xuICB9XG59O1xuXG5QdWIucHJvdG90eXBlLnVuc3ViQWxsID0gZnVuY3Rpb24odG9waWMpIHtcbiAgaWYgKHRvcGljID09PSB1bmRlZmluZWQpIHtcbiAgICB0aGlzLm11bHRzID0ge307XG4gIH0gZWxzZSB7XG4gICAgZGVsZXRlIHRoaXMubXVsdHNbdG9waWNdO1xuICB9XG59O1xuXG5mdW5jdGlvbiBwdWIoY2gsIHRvcGljRm4sIGJ1ZmZlckZuKSB7XG4gIGJ1ZmZlckZuID0gYnVmZmVyRm4gfHwgY29uc3RhbnRseU51bGw7XG4gIHZhciBwID0gbmV3IFB1YihjaCwgdG9waWNGbiwgYnVmZmVyRm4pO1xuICBnbyhyZWdlbmVyYXRvclJ1bnRpbWUubWFyayhmdW5jdGlvbiBjYWxsZWUkMSQwKCkge1xuICAgIHZhciB2YWx1ZSwgbXVsdHMsIHRvcGljLCBtLCBzdGlsbE9wZW47XG5cbiAgICByZXR1cm4gcmVnZW5lcmF0b3JSdW50aW1lLndyYXAoZnVuY3Rpb24gY2FsbGVlJDEkMCQoY29udGV4dCQyJDApIHtcbiAgICAgIHdoaWxlICgxKSBzd2l0Y2ggKGNvbnRleHQkMiQwLnByZXYgPSBjb250ZXh0JDIkMC5uZXh0KSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIGlmICghdHJ1ZSkge1xuICAgICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSAxNztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSAzO1xuICAgICAgICByZXR1cm4gdGFrZShjaCk7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIHZhbHVlID0gY29udGV4dCQyJDAuc2VudDtcbiAgICAgICAgbXVsdHMgPSBwLm11bHRzO1xuXG4gICAgICAgIGlmICghKHZhbHVlID09PSBDTE9TRUQpKSB7XG4gICAgICAgICAgY29udGV4dCQyJDAubmV4dCA9IDg7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHRvcGljIGluIG11bHRzKSB7XG4gICAgICAgICAgbXVsdHNbdG9waWNdLm11eGNoKCkuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29udGV4dCQyJDAuYWJydXB0KFwiYnJlYWtcIiwgMTcpO1xuICAgICAgY2FzZSA4OlxuICAgICAgICAvLyBUT0RPOiBTb21laG93IGVuc3VyZS9kb2N1bWVudCB0aGF0IHRoaXMgbXVzdCByZXR1cm4gYSBzdHJpbmdcbiAgICAgICAgLy8gKG90aGVyd2lzZSB1c2UgcHJvcGVyIChoYXNoKW1hcHMpXG4gICAgICAgIHRvcGljID0gdG9waWNGbih2YWx1ZSk7XG4gICAgICAgIG0gPSBtdWx0c1t0b3BpY107XG5cbiAgICAgICAgaWYgKCFtKSB7XG4gICAgICAgICAgY29udGV4dCQyJDAubmV4dCA9IDE1O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgY29udGV4dCQyJDAubmV4dCA9IDEzO1xuICAgICAgICByZXR1cm4gcHV0KG0ubXV4Y2goKSwgdmFsdWUpO1xuICAgICAgY2FzZSAxMzpcbiAgICAgICAgc3RpbGxPcGVuID0gY29udGV4dCQyJDAuc2VudDtcbiAgICAgICAgaWYgKCFzdGlsbE9wZW4pIHtcbiAgICAgICAgICBkZWxldGUgbXVsdHNbdG9waWNdO1xuICAgICAgICB9XG4gICAgICBjYXNlIDE1OlxuICAgICAgICBjb250ZXh0JDIkMC5uZXh0ID0gMDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDE3OlxuICAgICAgY2FzZSBcImVuZFwiOlxuICAgICAgICByZXR1cm4gY29udGV4dCQyJDAuc3RvcCgpO1xuICAgICAgfVxuICAgIH0sIGNhbGxlZSQxJDAsIHRoaXMpO1xuICB9KSk7XG4gIHJldHVybiBwO1xufVxuXG5wdWIuc3ViID0gZnVuY3Rpb24gc3ViKHAsIHRvcGljLCBjaCwga2VlcE9wZW4pIHtcbiAgcmV0dXJuIHAuc3ViKHRvcGljLCBjaCwga2VlcE9wZW4pO1xufTtcblxucHViLnVuc3ViID0gZnVuY3Rpb24gdW5zdWIocCwgdG9waWMsIGNoKSB7XG4gIHAudW5zdWIodG9waWMsIGNoKTtcbn07XG5cbnB1Yi51bnN1YkFsbCA9IGZ1bmN0aW9uIHVuc3ViQWxsKHAsIHRvcGljKSB7XG4gIHAudW5zdWJBbGwodG9waWMpO1xufTtcblxuLy8gUG9zc2libGUgXCJmbHVpZFwiIGludGVyZmFjZXM6XG4vLyB0aHJlYWQoXG4vLyAgIFtmcm9tQ29sbCwgWzEsIDIsIDMsIDRdXSxcbi8vICAgW21hcEZyb20sIGluY10sXG4vLyAgIFtpbnRvLCBbXV1cbi8vIClcbi8vIHRocmVhZChcbi8vICAgW2Zyb21Db2xsLCBbMSwgMiwgMywgNF1dLFxuLy8gICBbbWFwRnJvbSwgaW5jLCBfXSxcbi8vICAgW2ludG8sIFtdLCBfXVxuLy8gKVxuLy8gd3JhcCgpXG4vLyAgIC5mcm9tQ29sbChbMSwgMiwgMywgNF0pXG4vLyAgIC5tYXBGcm9tKGluYylcbi8vICAgLmludG8oW10pXG4vLyAgIC51bndyYXAoKTtcbm1vZHVsZS5leHBvcnRzID0ge1xuICBtYXBGcm9tOiBtYXBGcm9tLFxuICBtYXBJbnRvOiBtYXBJbnRvLFxuICBmaWx0ZXJGcm9tOiBmaWx0ZXJGcm9tLFxuICBmaWx0ZXJJbnRvOiBmaWx0ZXJJbnRvLFxuICByZW1vdmVGcm9tOiByZW1vdmVGcm9tLFxuICByZW1vdmVJbnRvOiByZW1vdmVJbnRvLFxuICBtYXBjYXRGcm9tOiBtYXBjYXRGcm9tLFxuICBtYXBjYXRJbnRvOiBtYXBjYXRJbnRvLFxuXG4gIHBpcGU6IHBpcGUsXG4gIHNwbGl0OiBzcGxpdCxcbiAgcmVkdWNlOiByZWR1Y2UsXG4gIG9udG86IG9udG8sXG4gIGZyb21Db2xsOiBmcm9tQ29sbCxcblxuICBtYXA6IG1hcCxcbiAgbWVyZ2U6IG1lcmdlLFxuICBpbnRvOiBpbnRvLFxuICB0YWtlOiB0YWtlTixcbiAgdW5pcXVlOiB1bmlxdWUsXG4gIHBhcnRpdGlvbjogcGFydGl0aW9uLFxuICBwYXJ0aXRpb25CeTogcGFydGl0aW9uQnksXG5cbiAgbXVsdDogbXVsdCxcbiAgbWl4OiBtaXgsXG4gIHB1YjogcHViXG59O1xuIl19