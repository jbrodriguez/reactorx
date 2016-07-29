'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var csp = require("js-csp");

module.exports = {
	createStore: createStore,
	combineActions: combineActions
};

function createStore(initialState, actions) {
	var optionals = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

	var _marked = [reactor].map(_regenerator2.default.mark);

	var capacity = arguments.length <= 3 || arguments[3] === undefined ? 623 : arguments[3];

	if (!initialState || (0, _keys2.default)(initialState).length === 0) {
		throw new Error('Initial state must be given to the store');
	}

	if (!actions || (0, _keys2.default)(actions).length === 0) {
		throw new Error('Actions must be given to the store');
	}

	var currentState = initialState;

	var actions = actions;
	var proxy = {};

	(0, _keys2.default)(actions).forEach(function (key) {
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
		return _regenerator2.default.wrap(function reactor$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						_context.next = 2;
						return csp.take(queue);

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


						currentState = actions[action.name].apply(actions, [{ state: currentState, actions: proxy, opts: opts }].concat((0, _toConsumableArray3.default)(args)));

						if (callback) callback({ state: currentState, actions: proxy });

					case 8:
						_context.next = 0;
						break;

					case 10:
					case 'end':
						return _context.stop();
				}
			}
		}, _marked[0], this);
	}

	function subscribe(cb) {
		callback = cb;
		csp.go(reactor, [queue]);
		dispatch("reactorxInit");
	}

	function dispatch(name, args) {
		csp.go(_regenerator2.default.mark(function _callee() {
			return _regenerator2.default.wrap(function _callee$(_context2) {
				while (1) {
					switch (_context2.prev = _context2.next) {
						case 0:
							_context2.next = 2;
							return csp.put(queue, { name: name, args: args });

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

	return _assign2.default.apply(Object, [{}].concat(actions));
}