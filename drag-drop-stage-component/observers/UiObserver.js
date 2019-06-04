define(["require", "exports", "../Types", "../handlers/ResizeHandler", "../handlers/DrawHandler", "../handlers/MoveHandler"], function (require, exports, types, ResizeHandler_1, DrawHandler_1, MoveHandler_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @class This class listens to the store
     *   and apply the state changes to the DOM elements
     */
    class UiObserver {
        constructor(stageDocument, overlayDocument, store, hooks) {
            this.stageDocument = stageDocument;
            this.overlayDocument = overlayDocument;
            this.store = store;
            this.hooks = hooks;
            this.unsubscribeAll = [];
            this.handler = null;
            this.unsubscribeAll.push(store.subscribe((state, prevState) => this.onUiStateChanged(state, prevState), (state) => state.ui));
        }
        cleanup() {
            this.unsubscribeAll.forEach(u => u());
        }
        /**
         * handle state changes, detect changes of scroll or metrics or selection
         * @param {State} state
         * @param {State} prevState the old state obj
         */
        onUiStateChanged(state, prevState) {
            if (prevState.mode !== state.mode) {
                if (this.handler) {
                    this.handler.release();
                    this.handler = null;
                }
                // add css class and style
                this.overlayDocument.body.classList.remove(...[
                    state.mode !== types.UiMode.DRAG ? 'dragging-mode' : 'not-dragging-mode',
                    state.mode !== types.UiMode.RESIZE ? 'resizing-mode' : 'not-resizing-mode',
                    state.mode !== types.UiMode.DRAW ? 'drawing-mode' : 'not-drawing-mode',
                ]);
                this.overlayDocument.body.classList.add(...[
                    state.mode === types.UiMode.DRAG ? 'dragging-mode' : 'not-dragging-mode',
                    state.mode === types.UiMode.RESIZE ? 'resizing-mode' : 'not-resizing-mode',
                    state.mode === types.UiMode.DRAW ? 'drawing-mode' : 'not-drawing-mode',
                ]);
                // manage handlers
                switch (state.mode) {
                    case types.UiMode.NONE:
                        break;
                    case types.UiMode.DRAG:
                        this.handler = new MoveHandler_1.MoveHandler(this.stageDocument, this.overlayDocument, this.store, this.hooks);
                        break;
                    case types.UiMode.RESIZE:
                        this.handler = new ResizeHandler_1.ResizeHandler(this.stageDocument, this.overlayDocument, this.store, this.hooks);
                        break;
                    case types.UiMode.DRAW:
                        this.handler = new DrawHandler_1.DrawHandler(this.stageDocument, this.overlayDocument, this.store, this.hooks);
                        break;
                }
            }
        }
    }
    exports.UiObserver = UiObserver;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVWlPYnNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cy9vYnNlcnZlcnMvVWlPYnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFPQTs7O09BR0c7SUFDSCxNQUFhLFVBQVU7UUFFckIsWUFBb0IsYUFBMkIsRUFBVSxlQUE2QixFQUFVLEtBQWlCLEVBQVUsS0FBa0I7WUFBekgsa0JBQWEsR0FBYixhQUFhLENBQWM7WUFBVSxvQkFBZSxHQUFmLGVBQWUsQ0FBYztZQUFVLFVBQUssR0FBTCxLQUFLLENBQVk7WUFBVSxVQUFLLEdBQUwsS0FBSyxDQUFhO1lBUXJJLG1CQUFjLEdBQXNCLEVBQUUsQ0FBQztZQVA3QyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUNwQixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUN0QyxDQUFDLEtBQW9CLEVBQUUsU0FBd0IsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsRUFDM0YsQ0FBQyxLQUFpQixFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUNoQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBR0QsT0FBTztZQUNMLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBRUQ7Ozs7V0FJRztRQUNILGdCQUFnQixDQUFDLEtBQW9CLEVBQUUsU0FBd0I7WUFDN0QsSUFBRyxTQUFTLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxJQUFJLEVBQUU7Z0JBQ2hDLElBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRTtvQkFDZixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUN2QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztpQkFDckI7Z0JBQ0QsMEJBQTBCO2dCQUMxQixJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUc7b0JBQzVDLEtBQUssQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsbUJBQW1CO29CQUN4RSxLQUFLLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLG1CQUFtQjtvQkFDMUUsS0FBSyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxrQkFBa0I7aUJBQ3ZFLENBQUMsQ0FBQztnQkFDSCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUc7b0JBQ3pDLEtBQUssQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsbUJBQW1CO29CQUN4RSxLQUFLLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLG1CQUFtQjtvQkFDMUUsS0FBSyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxrQkFBa0I7aUJBQ3ZFLENBQUMsQ0FBQztnQkFDSCxrQkFBa0I7Z0JBQ2xCLFFBQU8sS0FBSyxDQUFDLElBQUksRUFBQztvQkFDaEIsS0FBSyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUk7d0JBQ3BCLE1BQU07b0JBQ1IsS0FBSyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUk7d0JBQ3BCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSx5QkFBVyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDakcsTUFBTTtvQkFDUixLQUFLLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTTt3QkFDdEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLDZCQUFhLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUNuRyxNQUFNO29CQUNSLEtBQUssS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJO3dCQUNwQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUkseUJBQVcsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQ2pHLE1BQU07aUJBQ1Q7YUFDRjtRQUNILENBQUM7S0FDRjtJQXJERCxnQ0FxREMifQ==