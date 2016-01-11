"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var regeneratorRuntime = require("regenerator/runtime");
var csp = require("./js-csp/csp");
// var csp = require("js-csp")

module.exports = {
	createStore: createStore,
	combineActions: combineActions
};

function createStore(initialState, actions) {
	var optionals = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

	var _marked = [reactor].map(regeneratorRuntime.mark);

	var capacity = arguments.length <= 3 || arguments[3] === undefined ? 623 : arguments[3];

	if (!initialState || Object.keys(initialState).length === 0) {
		throw new Error('Initial state must be given to the store');
	}

	if (!actions || Object.keys(actions).length === 0) {
		throw new Error('Actions must be given to the store');
	}

	var currentState = initialState;

	var actions = actions;
	var proxy = {};

	Object.keys(actions).forEach(function (key) {
		proxy[key] = function () {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			return dispatch(key, args);
		};
	});

	actions["reactorxInit"] = function (_) {
		return currentState;
	};

	var opts = optionals;

	var callback = null;
	var queue = csp.chan(capacity);

	function reactor(queue) {
		var action, args;
		return regeneratorRuntime.wrap(function reactor$(_context) {
			while (1) switch (_context.prev = _context.next) {
				case 0:
					_context.next = 2;
					return csp.take(queue);

				case 2:
					action = _context.sent;

					if (actions[action.name]) {
						_context.next = 5;
						break;
					}

					return _context.abrupt("continue", 8);

				case 5:

					// looks like the spread operator doesn't work on undefined or null
					args = action.args || [];

					currentState = actions[action.name].apply(actions, [{ state: currentState, actions: proxy, opts: opts }].concat(_toConsumableArray(args)));

					if (callback) callback({ state: currentState, actions: proxy });

				case 8:
					_context.next = 0;
					break;

				case 10:
				case "end":
					return _context.stop();
			}
		}, _marked[0], this);
	}

	function subscribe(cb) {
		callback = cb;
		csp.go(reactor, [queue]);
		dispatch("reactorxInit");
	}

	function dispatch(name, args) {
		csp.go(regeneratorRuntime.mark(function _callee() {
			return regeneratorRuntime.wrap(function _callee$(_context2) {
				while (1) {
					switch (_context2.prev = _context2.next) {
						case 0:
							_context2.next = 2;
							return csp.put(queue, { name: name, args: args });

						case 2:
						case "end":
							return _context2.stop();
					}
				}
			}, _callee, this);
		}));
	}

	return {
		subscribe: subscribe,
		actions: proxy
	};
}

function combineActions() {
	var _Object;

	for (var _len2 = arguments.length, actions = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
		actions[_key2] = arguments[_key2];
	}

	return (_Object = Object).assign.apply(_Object, [{}].concat(actions));
}
//# sourceMappingURL=data:application/json;base64,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LElBQUksRUFBQyxDQUFDOzs7Ozs7OztHQUNsQyxFQUFDLENBQUE7RUFDRjs7QUFFRCxRQUFPO0FBQ04sV0FBUyxFQUFULFNBQVM7QUFDVCxTQUFPLEVBQUUsS0FBSztFQUNkLENBQUE7Q0FDRDs7QUFFRCxTQUFTLGNBQWMsR0FBYTs7O29DQUFULE9BQU87QUFBUCxTQUFPOzs7QUFDakMsUUFBTyxXQUFBLE1BQU0sRUFBQyxNQUFNLE1BQUEsV0FBQyxFQUFFLFNBQUssT0FBTyxFQUFDLENBQUE7Q0FDcEMiLCJmaWxlIjoicmVhY3RvcnguanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgcmVnZW5lcmF0b3JSdW50aW1lID0gcmVxdWlyZShcInJlZ2VuZXJhdG9yL3J1bnRpbWVcIilcbnZhciBjc3AgPSByZXF1aXJlKFwiLi9qcy1jc3AvY3NwXCIpXG4vLyB2YXIgY3NwID0gcmVxdWlyZShcImpzLWNzcFwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0Y3JlYXRlU3RvcmUsXG5cdGNvbWJpbmVBY3Rpb25zLFxufVxuXG5mdW5jdGlvbiBjcmVhdGVTdG9yZShpbml0aWFsU3RhdGUsIGFjdGlvbnMsIG9wdGlvbmFscyA9IHt9LCBjYXBhY2l0eSA9IDYyMykge1xuXHRpZiAoIWluaXRpYWxTdGF0ZSB8fCBPYmplY3Qua2V5cyhpbml0aWFsU3RhdGUpLmxlbmd0aCA9PT0gMCkge1xuXHRcdHRocm93IG5ldyBFcnJvcignSW5pdGlhbCBzdGF0ZSBtdXN0IGJlIGdpdmVuIHRvIHRoZSBzdG9yZScpXG5cdH1cblxuXHRpZiAoIWFjdGlvbnMgfHwgT2JqZWN0LmtleXMoYWN0aW9ucykubGVuZ3RoID09PSAwKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCdBY3Rpb25zIG11c3QgYmUgZ2l2ZW4gdG8gdGhlIHN0b3JlJylcblx0fVxuXG5cdHZhciBjdXJyZW50U3RhdGUgPSBpbml0aWFsU3RhdGVcblxuXHR2YXIgYWN0aW9ucyA9IGFjdGlvbnNcblx0dmFyIHByb3h5ID0ge31cblxuXHRPYmplY3Qua2V5cyhhY3Rpb25zKS5mb3JFYWNoKCBrZXkgPT4ge1xuXHRcdHByb3h5W2tleV0gPSAoLi4uYXJncykgPT4gZGlzcGF0Y2goa2V5LCBhcmdzKVxuXHR9KVxuXG5cdGFjdGlvbnNbXCJyZWFjdG9yeEluaXRcIl0gPSBfID0+IGN1cnJlbnRTdGF0ZVxuXG5cdHZhciBvcHRzID0gb3B0aW9uYWxzXG5cblx0dmFyIGNhbGxiYWNrID0gbnVsbFxuXHR2YXIgcXVldWUgPSBjc3AuY2hhbihjYXBhY2l0eSlcblxuXHRmdW5jdGlvbiogcmVhY3RvcihxdWV1ZSkge1xuXHRcdGZvciAoOzspIHtcblx0XHRcdGNvbnN0IGFjdGlvbiA9IHlpZWxkIGNzcC50YWtlKHF1ZXVlKVxuXG5cdFx0XHRpZiAoIWFjdGlvbnNbYWN0aW9uLm5hbWVdKSBjb250aW51ZVxuXG5cdFx0XHQvLyBsb29rcyBsaWtlIHRoZSBzcHJlYWQgb3BlcmF0b3IgZG9lc24ndCB3b3JrIG9uIHVuZGVmaW5lZCBvciBudWxsXG5cdFx0XHRjb25zdCBhcmdzID0gYWN0aW9uLmFyZ3MgfHwgW11cblxuXHRcdFx0Y3VycmVudFN0YXRlID0gYWN0aW9uc1thY3Rpb24ubmFtZV0oe3N0YXRlOiBjdXJyZW50U3RhdGUsIGFjdGlvbnM6IHByb3h5LCBvcHRzfSwgLi4uYXJncylcblxuXHRcdFx0aWYgKGNhbGxiYWNrKVxuXHRcdFx0XHRjYWxsYmFjayh7c3RhdGU6IGN1cnJlbnRTdGF0ZSwgYWN0aW9uczogcHJveHl9KVxuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIHN1YnNjcmliZShjYikge1xuXHRcdGNhbGxiYWNrID0gY2Jcblx0XHRjc3AuZ28ocmVhY3RvciwgW3F1ZXVlXSlcblx0XHRkaXNwYXRjaChcInJlYWN0b3J4SW5pdFwiKVxuXHR9XG5cblx0ZnVuY3Rpb24gZGlzcGF0Y2gobmFtZSwgYXJncykge1xuXHRcdGNzcC5nbyhmdW5jdGlvbiogKCkge1xuXHRcdFx0eWllbGQgY3NwLnB1dChxdWV1ZSwge25hbWUsIGFyZ3N9KVxuXHRcdH0pXG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdHN1YnNjcmliZSxcblx0XHRhY3Rpb25zOiBwcm94eVxuXHR9XG59XG5cbmZ1bmN0aW9uIGNvbWJpbmVBY3Rpb25zKC4uLmFjdGlvbnMpIHtcblx0cmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIC4uLmFjdGlvbnMpXG59Il19