'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.createStore = createStore;

var _jsCsp = require('js-csp');

var _jsCsp2 = _interopRequireDefault(_jsCsp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('babel-regenerator-runtime');

// export {
// 	createStore,
// 	// loadActions,
// }

function createStore(initialState, actions, optionals) {
	var _marked = [reactor].map(regeneratorRuntime.mark);

	var currentState = initialState;

	var actionFunc = {};
	var actionName = {};

	actions.forEach(function (action) {
		actionName[action.type] = action.type;
		actionFunc[action.type] = action.fn;
	});

	actionName["reactorxInit"] = "reactorxInit";
	actionFunc["reactorxInit"] = function (_) {
		return currentState;
	};

	var callback = null;

	var queue = _jsCsp2.default.chan(623);

	var optionals = optionals;

	function reactor(queue) {
		var action;
		return regeneratorRuntime.wrap(function reactor$(_context) {
			while (1) switch (_context.prev = _context.next) {
				case 0:
					_context.next = 2;
					return _jsCsp2.default.take(queue);

				case 2:
					action = _context.sent;

					if (actionFunc[action.type]) {
						_context.next = 5;
						break;
					}

					return _context.abrupt('continue', 7);

				case 5:

					currentState = actionFunc[action.type]({ state: currentState, actions: actionName, dispatch: dispatch }, optionals, action.params);
					callback({ state: currentState, actions: actionName, dispatch: dispatch });

				case 7:
					_context.next = 0;
					break;

				case 9:
				case 'end':
					return _context.stop();
			}
		}, _marked[0], this);
	}

	function subscribe(cb) {
		callback = cb;
		_jsCsp2.default.go(reactor, [queue]);
		dispatch("reactorxInit");
		// callback({state: currentState, actions: actionName, dispatch})
	}

	function dispatch(type, params) {
		_jsCsp2.default.go(regeneratorRuntime.mark(function _callee() {
			return regeneratorRuntime.wrap(function _callee$(_context2) {
				while (1) {
					switch (_context2.prev = _context2.next) {
						case 0:
							_context2.next = 2;
							return _jsCsp2.default.put(queue, { type: type, params: params });

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
		dispatch: dispatch,
		actions: actionName
	};
}

// function loadActions(folder) {
// 	var actionModules = require.context('./actions/', true, /\.js$/)

// 	let actions = []

// 	console.log("keys: ", actionModules.keys())

// 	actionModules.keys().forEach( module => {
// 		console.log('module: ', module)
// 		let normal = require("path").join("./actions/", __dirname, module)
// 		console.log('normal: ', normal)
// 		let testing = './actions/actions'
// 		let resolved = actionModules.resolve(module)
// 		console.log('resolved: ', resolved)
// 		actions = actions.concat(resolved)
// 	})

// 	return actions

// 	// var fs = require('fs')
// 	// let normalizedPath = require("path").join(__dirname, folder);

// 	// let actions = []

// 	// console.log('fs: ', fs)
// 	// console.log('normalizedPath: ', normalizedPath)

// 	// fs.readdirSync(normalizedPath).forEach(function(file) {
// 	// 	actions = actions.concat(require(folder + file))
// 	// })

// 	// return actions
// }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yZWFjdG9yeC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztRQVNnQixXQUFXLEdBQVgsV0FBVzs7Ozs7Ozs7QUFUM0IsT0FBTyxDQUFDLDJCQUEyQixDQUFDLENBQUE7Ozs7Ozs7QUFTN0IsU0FBUyxXQUFXLENBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUU7Z0JBb0JuRCxPQUFPOztBQW5CakIsS0FBSSxZQUFZLEdBQUcsWUFBWSxDQUFBOztBQUUvQixLQUFJLFVBQVUsR0FBRyxFQUFFLENBQUE7QUFDbkIsS0FBSSxVQUFVLEdBQUcsRUFBRSxDQUFBOztBQUVuQixRQUFPLENBQUMsT0FBTyxDQUFFLFVBQUEsTUFBTSxFQUFJO0FBQzFCLFlBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQTtBQUNyQyxZQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUE7RUFDbkMsQ0FBQyxDQUFBOztBQUVGLFdBQVUsQ0FBQyxjQUFjLENBQUMsR0FBRyxjQUFjLENBQUE7QUFDM0MsV0FBVSxDQUFDLGNBQWMsQ0FBQyxHQUFHLFVBQUEsQ0FBQztTQUFJLFlBQVk7RUFBQSxDQUFBOztBQUU5QyxLQUFJLFFBQVEsR0FBRyxJQUFJLENBQUE7O0FBRW5CLEtBQUksS0FBSyxHQUFHLGdCQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTs7QUFFekIsS0FBSSxTQUFTLEdBQUcsU0FBUyxDQUFBOztBQUV6QixVQUFVLE9BQU8sQ0FBQyxLQUFLO01BRWpCLE1BQU07Ozs7O1lBQVMsZ0JBQUksSUFBSSxDQUFDLEtBQUssQ0FBQzs7O0FBQTlCLFdBQU07O1NBRUwsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7Ozs7Ozs7OztBQUU1QixpQkFBWSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFSLFFBQVEsRUFBQyxFQUFHLFNBQVMsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDdkgsYUFBUSxDQUFDLEVBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBUixRQUFRLEVBQUMsQ0FBQyxDQUFBOzs7Ozs7Ozs7OztFQUUvRDs7QUFFRCxVQUFTLFNBQVMsQ0FBQyxFQUFFLEVBQUU7QUFDdEIsVUFBUSxHQUFHLEVBQUUsQ0FBQTtBQUNiLGtCQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0FBQ3hCLFVBQVEsQ0FBQyxjQUFjLENBQUM7O0FBQUEsRUFFeEI7O0FBRUQsVUFBUyxRQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRTtBQUMvQixrQkFBSSxFQUFFLHlCQUFDOzs7Ozs7Y0FDQSxnQkFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLEVBQUMsSUFBSSxFQUFKLElBQUksRUFBRSxNQUFNLEVBQU4sTUFBTSxFQUFDLENBQUM7Ozs7Ozs7O0dBQ3BDLEVBQUMsQ0FBQTtFQUNGOztBQUVELFFBQU87QUFDTixXQUFTLEVBQVQsU0FBUztBQUNULFVBQVEsRUFBUixRQUFRO0FBQ1IsU0FBTyxFQUFFLFVBQVU7RUFDbkIsQ0FBQTtDQUNEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBIiwiZmlsZSI6InJlYWN0b3J4LmpzIiwic291cmNlc0NvbnRlbnQiOlsicmVxdWlyZSgnYmFiZWwtcmVnZW5lcmF0b3ItcnVudGltZScpXG5cbmltcG9ydCBjc3AgZnJvbSAnanMtY3NwJ1xuXG4vLyBleHBvcnQge1xuLy8gXHRjcmVhdGVTdG9yZSxcbi8vIFx0Ly8gbG9hZEFjdGlvbnMsXG4vLyB9XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdG9yZShpbml0aWFsU3RhdGUsIGFjdGlvbnMsIG9wdGlvbmFscykge1xuXHR2YXIgY3VycmVudFN0YXRlID0gaW5pdGlhbFN0YXRlXG5cblx0dmFyIGFjdGlvbkZ1bmMgPSB7fVxuXHR2YXIgYWN0aW9uTmFtZSA9IHt9XG5cblx0YWN0aW9ucy5mb3JFYWNoKCBhY3Rpb24gPT4ge1xuXHRcdGFjdGlvbk5hbWVbYWN0aW9uLnR5cGVdID0gYWN0aW9uLnR5cGVcblx0XHRhY3Rpb25GdW5jW2FjdGlvbi50eXBlXSA9IGFjdGlvbi5mblxuXHR9KVxuXG5cdGFjdGlvbk5hbWVbXCJyZWFjdG9yeEluaXRcIl0gPSBcInJlYWN0b3J4SW5pdFwiXG5cdGFjdGlvbkZ1bmNbXCJyZWFjdG9yeEluaXRcIl0gPSBfID0+IGN1cnJlbnRTdGF0ZVxuXG5cdHZhciBjYWxsYmFjayA9IG51bGxcblxuXHR2YXIgcXVldWUgPSBjc3AuY2hhbig2MjMpXG5cblx0dmFyIG9wdGlvbmFscyA9IG9wdGlvbmFsc1xuXG5cdGZ1bmN0aW9uKiByZWFjdG9yKHF1ZXVlKSB7XG5cdFx0Zm9yICg7Oykge1xuXHRcdFx0dmFyIGFjdGlvbiA9IHlpZWxkIGNzcC50YWtlKHF1ZXVlKVxuXG5cdFx0XHRpZiAoIWFjdGlvbkZ1bmNbYWN0aW9uLnR5cGVdKSBjb250aW51ZVxuXG5cdFx0XHRjdXJyZW50U3RhdGUgPSBhY3Rpb25GdW5jW2FjdGlvbi50eXBlXSh7c3RhdGU6IGN1cnJlbnRTdGF0ZSwgYWN0aW9uczogYWN0aW9uTmFtZSwgZGlzcGF0Y2h9LCAgb3B0aW9uYWxzLCBhY3Rpb24ucGFyYW1zKVxuXHRcdFx0Y2FsbGJhY2soe3N0YXRlOiBjdXJyZW50U3RhdGUsIGFjdGlvbnM6IGFjdGlvbk5hbWUsIGRpc3BhdGNofSlcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBzdWJzY3JpYmUoY2IpIHtcblx0XHRjYWxsYmFjayA9IGNiXG5cdFx0Y3NwLmdvKHJlYWN0b3IsIFtxdWV1ZV0pXG5cdFx0ZGlzcGF0Y2goXCJyZWFjdG9yeEluaXRcIilcblx0XHQvLyBjYWxsYmFjayh7c3RhdGU6IGN1cnJlbnRTdGF0ZSwgYWN0aW9uczogYWN0aW9uTmFtZSwgZGlzcGF0Y2h9KVxuXHR9XG5cblx0ZnVuY3Rpb24gZGlzcGF0Y2godHlwZSwgcGFyYW1zKSB7XG5cdFx0Y3NwLmdvKGZ1bmN0aW9uKiAoKSB7XG5cdFx0XHR5aWVsZCBjc3AucHV0KHF1ZXVlLCB7dHlwZSwgcGFyYW1zfSlcblx0XHR9KVxuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRzdWJzY3JpYmUsXG5cdFx0ZGlzcGF0Y2gsXG5cdFx0YWN0aW9uczogYWN0aW9uTmFtZVxuXHR9XG59XG5cbi8vIGZ1bmN0aW9uIGxvYWRBY3Rpb25zKGZvbGRlcikge1xuLy8gXHR2YXIgYWN0aW9uTW9kdWxlcyA9IHJlcXVpcmUuY29udGV4dCgnLi9hY3Rpb25zLycsIHRydWUsIC9cXC5qcyQvKVxuXG4vLyBcdGxldCBhY3Rpb25zID0gW11cblxuLy8gXHRjb25zb2xlLmxvZyhcImtleXM6IFwiLCBhY3Rpb25Nb2R1bGVzLmtleXMoKSlcblxuLy8gXHRhY3Rpb25Nb2R1bGVzLmtleXMoKS5mb3JFYWNoKCBtb2R1bGUgPT4ge1xuLy8gXHRcdGNvbnNvbGUubG9nKCdtb2R1bGU6ICcsIG1vZHVsZSlcbi8vIFx0XHRsZXQgbm9ybWFsID0gcmVxdWlyZShcInBhdGhcIikuam9pbihcIi4vYWN0aW9ucy9cIiwgX19kaXJuYW1lLCBtb2R1bGUpXG4vLyBcdFx0Y29uc29sZS5sb2coJ25vcm1hbDogJywgbm9ybWFsKVxuLy8gXHRcdGxldCB0ZXN0aW5nID0gJy4vYWN0aW9ucy9hY3Rpb25zJ1xuLy8gXHRcdGxldCByZXNvbHZlZCA9IGFjdGlvbk1vZHVsZXMucmVzb2x2ZShtb2R1bGUpXG4vLyBcdFx0Y29uc29sZS5sb2coJ3Jlc29sdmVkOiAnLCByZXNvbHZlZClcbi8vIFx0XHRhY3Rpb25zID0gYWN0aW9ucy5jb25jYXQocmVzb2x2ZWQpXG4vLyBcdH0pXG5cbi8vIFx0cmV0dXJuIGFjdGlvbnNcblxuLy8gXHQvLyB2YXIgZnMgPSByZXF1aXJlKCdmcycpXG4vLyBcdC8vIGxldCBub3JtYWxpemVkUGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpLmpvaW4oX19kaXJuYW1lLCBmb2xkZXIpO1xuXG4vLyBcdC8vIGxldCBhY3Rpb25zID0gW11cblxuLy8gXHQvLyBjb25zb2xlLmxvZygnZnM6ICcsIGZzKVxuLy8gXHQvLyBjb25zb2xlLmxvZygnbm9ybWFsaXplZFBhdGg6ICcsIG5vcm1hbGl6ZWRQYXRoKVxuXG4vLyBcdC8vIGZzLnJlYWRkaXJTeW5jKG5vcm1hbGl6ZWRQYXRoKS5mb3JFYWNoKGZ1bmN0aW9uKGZpbGUpIHtcbi8vIFx0Ly8gXHRhY3Rpb25zID0gYWN0aW9ucy5jb25jYXQocmVxdWlyZShmb2xkZXIgKyBmaWxlKSlcbi8vIFx0Ly8gfSlcblxuLy8gXHQvLyByZXR1cm4gYWN0aW9uc1xuLy8gfVxuIl19