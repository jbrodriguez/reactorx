'use strict';

require('babel-regenerator-runtime');

var _jsCsp = require('js-csp');

var _jsCsp2 = _interopRequireDefault(_jsCsp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

module.exports = {
	createStore: createStore,
	combineActions: combineActions
};

function createStore(initialState, actions) {
	var optionals = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

	var _marked = [reactor].map(regeneratorRuntime.mark);

	var capacity = arguments.length <= 3 || arguments[3] === undefined ? 623 : arguments[3];

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
	var queue = _jsCsp2.default.chan(capacity);

	function reactor(queue) {
		var action, args;
		return regeneratorRuntime.wrap(function reactor$(_context) {
			while (1) switch (_context.prev = _context.next) {
				case 0:
					_context.next = 2;
					return _jsCsp2.default.take(queue);

				case 2:
					action = _context.sent;

					if (actions[action.name]) {
						_context.next = 5;
						break;
					}

					return _context.abrupt('continue', 8);

				case 5:

					// looks like the spread operator doesn't work on undefined or null
					args = action.args || [];

					currentState = actions[action.name].apply(actions, [{ state: currentState, actions: proxy, opts: opts }].concat(_toConsumableArray(args)));

					if (callback) callback({ state: currentState, actions: proxy });

				case 8:
					_context.next = 0;
					break;

				case 10:
				case 'end':
					return _context.stop();
			}
		}, _marked[0], this);
	}

	function subscribe(cb) {
		callback = cb;
		_jsCsp2.default.go(reactor, [queue]);
		dispatch("reactorxInit");
	}

	function dispatch(name, args) {
		_jsCsp2.default.go(regeneratorRuntime.mark(function _callee() {
			return regeneratorRuntime.wrap(function _callee$(_context2) {
				while (1) {
					switch (_context2.prev = _context2.next) {
						case 0:
							_context2.next = 2;
							return _jsCsp2.default.put(queue, { name: name, args: args });

						case 2:
						case 'end':
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
	for (var _len2 = arguments.length, actions = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
		actions[_key2] = arguments[_key2];
	}

	return Object.assign({}, actions);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yZWFjdG9yeC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFHQSxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2hCLFlBQVcsRUFBWCxXQUFXO0FBQ1gsZUFBYyxFQUFkLGNBQWM7Q0FDZCxDQUFBOztBQUVELFNBQVMsV0FBVyxDQUFDLFlBQVksRUFBRSxPQUFPLEVBQWtDO0tBQWhDLFNBQVMseURBQUcsRUFBRTs7Z0JBaUIvQyxPQUFPOztLQWpCMEMsUUFBUSx5REFBRyxHQUFHOztBQUN6RSxLQUFJLFlBQVksR0FBRyxZQUFZLENBQUE7O0FBRS9CLEtBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQTtBQUNyQixLQUFJLEtBQUssR0FBRyxFQUFFLENBQUE7O0FBRWQsT0FBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUUsVUFBQSxHQUFHLEVBQUk7QUFDcEMsT0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHO3FDQUFJLElBQUk7QUFBSixRQUFJOzs7VUFBSyxRQUFRLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztHQUFBLENBQUE7RUFDN0MsQ0FBQyxDQUFBOztBQUVGLFFBQU8sQ0FBQyxjQUFjLENBQUMsR0FBRyxVQUFBLENBQUM7U0FBSSxZQUFZO0VBQUEsQ0FBQTs7QUFFM0MsS0FBSSxJQUFJLEdBQUcsU0FBUyxDQUFBOztBQUVwQixLQUFJLFFBQVEsR0FBRyxJQUFJLENBQUE7QUFDbkIsS0FBSSxLQUFLLEdBQUcsZ0JBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBOztBQUU5QixVQUFVLE9BQU8sQ0FBQyxLQUFLO01BRWYsTUFBTSxFQUtOLElBQUk7Ozs7O1lBTFcsZ0JBQUksSUFBSSxDQUFDLEtBQUssQ0FBQzs7O0FBQTlCLFdBQU07O1NBRVAsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7Ozs7Ozs7Ozs7QUFHbkIsU0FBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRTs7QUFFOUIsaUJBQVksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksT0FBQyxDQUFwQixPQUFPLEdBQWMsRUFBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFKLElBQUksRUFBQyw0QkFBSyxJQUFJLEdBQUMsQ0FBQTs7QUFFekYsU0FBSSxRQUFRLEVBQ1gsUUFBUSxDQUFDLEVBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQTs7Ozs7Ozs7Ozs7RUFFakQ7O0FBRUQsVUFBUyxTQUFTLENBQUMsRUFBRSxFQUFFO0FBQ3RCLFVBQVEsR0FBRyxFQUFFLENBQUE7QUFDYixrQkFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtBQUN4QixVQUFRLENBQUMsY0FBYyxDQUFDLENBQUE7RUFDeEI7O0FBRUQsVUFBUyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRTtBQUM3QixrQkFBSSxFQUFFLHlCQUFDOzs7Ozs7Y0FDQSxnQkFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLEVBQUMsSUFBSSxFQUFKLElBQUksRUFBRSxJQUFJLEVBQUosSUFBSSxFQUFDLENBQUM7Ozs7Ozs7O0dBQ2xDLEVBQUMsQ0FBQTtFQUNGOztBQUVELFFBQU87QUFDTixXQUFTLEVBQVQsU0FBUztBQUNULFNBQU8sRUFBRSxLQUFLO0VBQ2QsQ0FBQTtDQUNEOztBQUVELFNBQVMsY0FBYyxHQUFhO29DQUFULE9BQU87QUFBUCxTQUFPOzs7QUFDakMsUUFBTyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQTtDQUNqQyIsImZpbGUiOiJyZWFjdG9yeC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnYmFiZWwtcmVnZW5lcmF0b3ItcnVudGltZSdcbmltcG9ydCBjc3AgZnJvbSAnanMtY3NwJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0Y3JlYXRlU3RvcmUsXG5cdGNvbWJpbmVBY3Rpb25zLFxufVxuXG5mdW5jdGlvbiBjcmVhdGVTdG9yZShpbml0aWFsU3RhdGUsIGFjdGlvbnMsIG9wdGlvbmFscyA9IHt9LCBjYXBhY2l0eSA9IDYyMykge1xuXHR2YXIgY3VycmVudFN0YXRlID0gaW5pdGlhbFN0YXRlXG5cblx0dmFyIGFjdGlvbnMgPSBhY3Rpb25zXG5cdHZhciBwcm94eSA9IHt9XG5cblx0T2JqZWN0LmtleXMoYWN0aW9ucykuZm9yRWFjaCgga2V5ID0+IHtcblx0XHRwcm94eVtrZXldID0gKC4uLmFyZ3MpID0+IGRpc3BhdGNoKGtleSwgYXJncylcblx0fSlcblxuXHRhY3Rpb25zW1wicmVhY3RvcnhJbml0XCJdID0gXyA9PiBjdXJyZW50U3RhdGVcblxuXHR2YXIgb3B0cyA9IG9wdGlvbmFsc1xuXG5cdHZhciBjYWxsYmFjayA9IG51bGxcblx0dmFyIHF1ZXVlID0gY3NwLmNoYW4oY2FwYWNpdHkpXG5cblx0ZnVuY3Rpb24qIHJlYWN0b3IocXVldWUpIHtcblx0XHRmb3IgKDs7KSB7XG5cdFx0XHRjb25zdCBhY3Rpb24gPSB5aWVsZCBjc3AudGFrZShxdWV1ZSlcblxuXHRcdFx0aWYgKCFhY3Rpb25zW2FjdGlvbi5uYW1lXSkgY29udGludWVcblxuXHRcdFx0Ly8gbG9va3MgbGlrZSB0aGUgc3ByZWFkIG9wZXJhdG9yIGRvZXNuJ3Qgd29yayBvbiB1bmRlZmluZWQgb3IgbnVsbFxuXHRcdFx0Y29uc3QgYXJncyA9IGFjdGlvbi5hcmdzIHx8IFtdXG5cblx0XHRcdGN1cnJlbnRTdGF0ZSA9IGFjdGlvbnNbYWN0aW9uLm5hbWVdKHtzdGF0ZTogY3VycmVudFN0YXRlLCBhY3Rpb25zOiBwcm94eSwgb3B0c30sIC4uLmFyZ3MpXG5cblx0XHRcdGlmIChjYWxsYmFjaylcblx0XHRcdFx0Y2FsbGJhY2soe3N0YXRlOiBjdXJyZW50U3RhdGUsIGFjdGlvbnM6IHByb3h5fSlcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBzdWJzY3JpYmUoY2IpIHtcblx0XHRjYWxsYmFjayA9IGNiXG5cdFx0Y3NwLmdvKHJlYWN0b3IsIFtxdWV1ZV0pXG5cdFx0ZGlzcGF0Y2goXCJyZWFjdG9yeEluaXRcIilcblx0fVxuXG5cdGZ1bmN0aW9uIGRpc3BhdGNoKG5hbWUsIGFyZ3MpIHtcblx0XHRjc3AuZ28oZnVuY3Rpb24qICgpIHtcblx0XHRcdHlpZWxkIGNzcC5wdXQocXVldWUsIHtuYW1lLCBhcmdzfSlcblx0XHR9KVxuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRzdWJzY3JpYmUsXG5cdFx0YWN0aW9uczogcHJveHlcblx0fVxufVxuXG5mdW5jdGlvbiBjb21iaW5lQWN0aW9ucyguLi5hY3Rpb25zKSB7XG5cdHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBhY3Rpb25zKVxufSJdfQ==