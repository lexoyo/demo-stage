define(["require", "exports", "redux", "./MouseState", "./SelectableState", "./SelectionState", "./UiState"], function (require, exports, redux_1, mouseState, selectableState, SelectionState_1, UiState_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class StageStore {
        constructor() {
            /**
             * the main redux store
             * @type {Store}
             */
            this.store = StageStore.createStore();
        }
        /**
         * Create a redux store with composed reducers
         * @return Store
         */
        static createStore() {
            const reducer = redux_1.combineReducers({
                selectables: (state, action) => selectableState.selectables(SelectionState_1.selection(state, action), action),
                ui: (state, action) => UiState_1.ui(state, action),
                mouse: (state, action) => mouseState.mouse(state, action),
            });
            return redux_1.createStore(reducer, redux_1.applyMiddleware(StageStore.preventDispatchDuringRedraw));
        }
        ;
        // this is unused for now, I used the "refreshing" prop instead, on state.ui
        static preventDispatchDuringRedraw({ getState }) {
            return next => action => {
                if (action.preventDispatch) {
                    console.warn('prevent dispatch', action);
                }
                else {
                    const returnValue = next(action);
                    return returnValue;
                }
                return null;
            };
        }
        /**
         * Subscribe to state changes with the ability to filter by substate
         * @param onChange callback to get the state and the previous state
         * @param select method to select the sub state
         * @return {function()} function to call to unsubscribe
         */
        subscribe(onChange, select = (state) => state) {
            let currentState = select(this.store.getState());
            const handleChange = () => {
                let nextState = select(this.store.getState());
                if (nextState !== currentState) {
                    let prevState = currentState;
                    currentState = nextState;
                    onChange(currentState, prevState);
                }
            };
            return this.store.subscribe(handleChange);
        }
        // clone the object, not deep
        clone(obj) {
            let res;
            if (obj instanceof Array)
                res = obj.slice();
            else if (obj instanceof Object)
                res = Object.assign({}, obj);
            else
                res = obj;
            if (obj === res)
                throw 'not cloned';
            return res;
        }
        dispatch(action, cbk = null) {
            this.store.dispatch(action);
            if (cbk)
                cbk();
            return null;
        }
        getState() {
            return this.store.getState();
        }
        replaceReducer() {
            throw new Error('not implemented');
        }
    }
    exports.StageStore = StageStore;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhZ2VTdG9yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cy9mbHV4L1N0YWdlU3RvcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBT0EsTUFBYSxVQUFVO1FBQXZCO1lBNEJFOzs7ZUFHRztZQUNPLFVBQUssR0FBaUIsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBMkMzRCxDQUFDO1FBMUVDOzs7V0FHRztRQUNPLE1BQU0sQ0FBQyxXQUFXO1lBQzFCLE1BQU0sT0FBTyxHQUFHLHVCQUFlLENBQUM7Z0JBQzlCLFdBQVcsRUFBRSxDQUFDLEtBQTZCLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLDBCQUFTLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxFQUFFLE1BQU0sQ0FBQztnQkFDckgsRUFBRSxFQUFFLENBQUMsS0FBYyxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsWUFBRSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUM7Z0JBQ2pELEtBQUssRUFBRSxDQUFDLEtBQWlCLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUM7YUFDdEUsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxtQkFBVyxDQUFDLE9BQU8sRUFBRSx1QkFBZSxDQUFDLFVBQVUsQ0FBQywyQkFBMkIsQ0FBQyxDQUFpQixDQUFDO1FBQ3ZHLENBQUM7UUFBQSxDQUFDO1FBRUYsNEVBQTRFO1FBQ3BFLE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxFQUFFLFFBQVEsRUFBRTtZQUNyRCxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ3RCLElBQUcsTUFBTSxDQUFDLGVBQWUsRUFBRTtvQkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxNQUFNLENBQUMsQ0FBQTtpQkFDekM7cUJBQ0k7b0JBQ0gsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO29CQUNoQyxPQUFPLFdBQVcsQ0FBQTtpQkFDbkI7Z0JBQ0QsT0FBTyxJQUFJLENBQUM7WUFDZCxDQUFDLENBQUE7UUFDSCxDQUFDO1FBUUQ7Ozs7O1dBS0c7UUFDSCxTQUFTLENBQVcsUUFBc0QsRUFBRSxTQUFPLENBQUMsS0FBVyxFQUFXLEVBQUUsQ0FBRSxLQUFhO1lBQ3pILElBQUksWUFBWSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFFakQsTUFBTSxZQUFZLEdBQUcsR0FBRyxFQUFFO2dCQUN4QixJQUFJLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2dCQUM5QyxJQUFJLFNBQVMsS0FBSyxZQUFZLEVBQUU7b0JBQzlCLElBQUksU0FBUyxHQUFHLFlBQVksQ0FBQztvQkFDN0IsWUFBWSxHQUFHLFNBQVMsQ0FBQztvQkFDekIsUUFBUSxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQztpQkFDbkM7WUFDSCxDQUFDLENBQUE7WUFDRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFDRCw2QkFBNkI7UUFDN0IsS0FBSyxDQUFXLEdBQWE7WUFDM0IsSUFBSSxHQUFRLENBQUM7WUFDYixJQUFHLEdBQUcsWUFBWSxLQUFLO2dCQUFFLEdBQUcsR0FBSSxHQUFrQixDQUFDLEtBQUssRUFBcUIsQ0FBQztpQkFDekUsSUFBRyxHQUFHLFlBQVksTUFBTTtnQkFBRSxHQUFHLEdBQUcsa0JBQzdCLEdBQXFCLENBQ2QsQ0FBQzs7Z0JBQ1gsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUNmLElBQUcsR0FBRyxLQUFLLEdBQUc7Z0JBQUUsTUFBTSxZQUFZLENBQUM7WUFDbkMsT0FBTyxHQUFHLENBQUM7UUFDYixDQUFDO1FBQ0QsUUFBUSxDQUFDLE1BQVcsRUFBRSxNQUFrQixJQUFJO1lBQzFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzVCLElBQUcsR0FBRztnQkFBRSxHQUFHLEVBQUUsQ0FBQztZQUNkLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUNELFFBQVE7WUFDTixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDL0IsQ0FBQztRQUNELGNBQWM7WUFDWixNQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDckMsQ0FBQztLQUNGO0lBM0VELGdDQTJFQyJ9