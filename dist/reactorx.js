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
    var capacity = arguments.length <= 3 || arguments[3] === undefined ? 623 : arguments[3];

    var marked1$0 = [reactor].map(regeneratorRuntime.mark);
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

        return regeneratorRuntime.wrap(function reactor$(context$2$0) {
            while (1) {
                switch (context$2$0.prev = context$2$0.next) {
                    case 0:
                        context$2$0.next = 2;
                        return csp.take(queue);
                    case 2:
                        action = context$2$0.sent;

                        if (actions[action.name]) {
                            context$2$0.next = 5;
                            break;
                        }

                        return context$2$0.abrupt("continue", 8);
                    case 5:
                        args = action.args || [];

                        currentState = actions[action.name].apply(actions, [{ state: currentState, actions: proxy, opts: opts }].concat(_toConsumableArray(args)));

                        if (callback) callback({ state: currentState, actions: proxy });
                    case 8:
                        context$2$0.next = 0;
                        break;
                    case 10:
                    case "end":
                        return context$2$0.stop();
                }
            }
        }, marked1$0[0], this);
    }

    function subscribe(cb) {
        callback = cb;
        csp.go(reactor, [queue]);
        dispatch("reactorxInit");
    }

    function dispatch(name, args) {
        csp.go(regeneratorRuntime.mark(function callee$2$0() {
            return regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
                while (1) {
                    switch (context$3$0.prev = context$3$0.next) {
                        case 0:
                            context$3$0.next = 2;
                            return csp.put(queue, { name: name, args: args });
                        case 2:
                        case "end":
                            return context$3$0.stop();
                    }
                }
            }, callee$2$0, this);
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
//# sourceMappingURL=data:application/json;base64,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eEMsNkJBQUssQ0FBQyxDQUFDO0FBQ1AsNkJBQUssS0FBSztBQUNOLG1DQUFPLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUFBLHFCQUM3QjtpQkFBQTthQUNKLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3hCLENBQUMsQ0FBQyxDQUFBO0tBQ1Q7O0FBRUUsV0FBTztBQUNULGlCQUFTLEVBQVQsU0FBUztBQUNULGVBQU8sRUFBRSxLQUFLO0tBQ2QsQ0FBQTtDQUNEOztBQUVELFNBQVMsY0FBYyxHQUFhOzs7dUNBQVQsT0FBTztBQUFQLGVBQU87OztBQUNqQyxXQUFPLFdBQUEsTUFBTSxFQUFDLE1BQU0sTUFBQSxXQUFDLEVBQUUsU0FBSyxPQUFPLEVBQUMsQ0FBQTtDQUNwQyIsImZpbGUiOiJyZWFjdG9yeC5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciByZWdlbmVyYXRvclJ1bnRpbWUgPSByZXF1aXJlKFwicmVnZW5lcmF0b3IvcnVudGltZVwiKVxudmFyIGNzcCA9IHJlcXVpcmUoXCIuL2pzLWNzcC9jc3BcIilcbi8vIHZhciBjc3AgPSByZXF1aXJlKFwianMtY3NwXCIpXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRjcmVhdGVTdG9yZSxcblx0Y29tYmluZUFjdGlvbnMsXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVN0b3JlKGluaXRpYWxTdGF0ZSwgYWN0aW9ucywgb3B0aW9uYWxzID0ge30sIGNhcGFjaXR5ID0gNjIzKSB7XG4gICAgdmFyIG1hcmtlZDEkMCA9IFtyZWFjdG9yXS5tYXAocmVnZW5lcmF0b3JSdW50aW1lLm1hcmspO1xuICAgIGlmICghaW5pdGlhbFN0YXRlIHx8IE9iamVjdC5rZXlzKGluaXRpYWxTdGF0ZSkubGVuZ3RoID09PSAwKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCdJbml0aWFsIHN0YXRlIG11c3QgYmUgZ2l2ZW4gdG8gdGhlIHN0b3JlJylcblx0fVxuXG4gICAgaWYgKCFhY3Rpb25zIHx8IE9iamVjdC5rZXlzKGFjdGlvbnMpLmxlbmd0aCA9PT0gMCkge1xuXHRcdHRocm93IG5ldyBFcnJvcignQWN0aW9ucyBtdXN0IGJlIGdpdmVuIHRvIHRoZSBzdG9yZScpXG5cdH1cblxuICAgIHZhciBjdXJyZW50U3RhdGUgPSBpbml0aWFsU3RhdGVcblxuICAgIHZhciBhY3Rpb25zID0gYWN0aW9uc1xuICAgIHZhciBwcm94eSA9IHt9XG5cbiAgICBPYmplY3Qua2V5cyhhY3Rpb25zKS5mb3JFYWNoKCBrZXkgPT4ge1xuXHRcdHByb3h5W2tleV0gPSAoLi4uYXJncykgPT4gZGlzcGF0Y2goa2V5LCBhcmdzKVxuXHR9KVxuXG4gICAgYWN0aW9uc1tcInJlYWN0b3J4SW5pdFwiXSA9IF8gPT4gY3VycmVudFN0YXRlXG5cbiAgICB2YXIgb3B0cyA9IG9wdGlvbmFsc1xuXG4gICAgdmFyIGNhbGxiYWNrID0gbnVsbFxuICAgIHZhciBxdWV1ZSA9IGNzcC5jaGFuKGNhcGFjaXR5KVxuXG4gICAgZnVuY3Rpb24gcmVhY3RvcihxdWV1ZSkge1xuICAgICAgICB2YXIgYWN0aW9uLCBhcmdzO1xuXG4gICAgICAgIHJldHVybiByZWdlbmVyYXRvclJ1bnRpbWUud3JhcChmdW5jdGlvbiByZWFjdG9yJChjb250ZXh0JDIkMCkge1xuICAgICAgICAgICAgd2hpbGUgKDEpIHN3aXRjaCAoY29udGV4dCQyJDAucHJldiA9IGNvbnRleHQkMiQwLm5leHQpIHtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICBjb250ZXh0JDIkMC5uZXh0ID0gMjtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3NwLnRha2UocXVldWUpO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIGFjdGlvbiA9IGNvbnRleHQkMiQwLnNlbnQ7XG5cbiAgICAgICAgICAgICAgICBpZiAoYWN0aW9uc1thY3Rpb24ubmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dCQyJDAubmV4dCA9IDU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBjb250ZXh0JDIkMC5hYnJ1cHQoXCJjb250aW51ZVwiLCA4KTtcbiAgICAgICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgICAgICBhcmdzID0gYWN0aW9uLmFyZ3MgfHwgW107XG5cbiAgICAgICAgICAgICAgICBjdXJyZW50U3RhdGUgPSBhY3Rpb25zW2FjdGlvbi5uYW1lXSh7c3RhdGU6IGN1cnJlbnRTdGF0ZSwgYWN0aW9uczogcHJveHksIG9wdHN9LCAuLi5hcmdzKVxuXG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKVxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayh7c3RhdGU6IGN1cnJlbnRTdGF0ZSwgYWN0aW9uczogcHJveHl9KVxuICAgICAgICAgICAgY2FzZSA4OlxuICAgICAgICAgICAgICAgIGNvbnRleHQkMiQwLm5leHQgPSAwO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxMDpcbiAgICAgICAgICAgIGNhc2UgXCJlbmRcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gY29udGV4dCQyJDAuc3RvcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBtYXJrZWQxJDBbMF0sIHRoaXMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN1YnNjcmliZShjYikge1xuXHRcdGNhbGxiYWNrID0gY2Jcblx0XHRjc3AuZ28ocmVhY3RvciwgW3F1ZXVlXSlcblx0XHRkaXNwYXRjaChcInJlYWN0b3J4SW5pdFwiKVxuXHR9XG5cbiAgICBmdW5jdGlvbiBkaXNwYXRjaChuYW1lLCBhcmdzKSB7XG5cdFx0Y3NwLmdvKHJlZ2VuZXJhdG9yUnVudGltZS5tYXJrKGZ1bmN0aW9uIGNhbGxlZSQyJDAoKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVnZW5lcmF0b3JSdW50aW1lLndyYXAoZnVuY3Rpb24gY2FsbGVlJDIkMCQoY29udGV4dCQzJDApIHtcbiAgICAgICAgICAgICAgICB3aGlsZSAoMSkgc3dpdGNoIChjb250ZXh0JDMkMC5wcmV2ID0gY29udGV4dCQzJDAubmV4dCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dCQzJDAubmV4dCA9IDI7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjc3AucHV0KHF1ZXVlLCB7bmFtZSwgYXJnc30pO1xuICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICBjYXNlIFwiZW5kXCI6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb250ZXh0JDMkMC5zdG9wKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgY2FsbGVlJDIkMCwgdGhpcyk7XG4gICAgICAgIH0pKVxuXHR9XG5cbiAgICByZXR1cm4ge1xuXHRcdHN1YnNjcmliZSxcblx0XHRhY3Rpb25zOiBwcm94eVxuXHR9XG59XG5cbmZ1bmN0aW9uIGNvbWJpbmVBY3Rpb25zKC4uLmFjdGlvbnMpIHtcblx0cmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIC4uLmFjdGlvbnMpXG59Il19