define(["require", "exports", "../flux/MouseState"], function (require, exports, mouseState) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MouseHandlerBase {
        constructor(stageDocument, overlayDocument, store, hooks) {
            this.stageDocument = stageDocument;
            this.overlayDocument = overlayDocument;
            this.store = store;
            this.hooks = hooks;
            /**
             * Debounce mechanism to handle auto scroll
             */
            this.debounceScrollPending = false;
            // store the selection
            this.selection = store.getState().selectables;
            this.selection = this.selection.filter(selectable => selectable.selected);
            // kepp in sync with mouse
            this.unsubsribe = store.subscribe((state, prevState) => this.update(state.mouseData), (state) => state.mouse);
            // listen for scroll
            this.unsubsribeScroll = this.store.subscribe((cur, prev) => this.onScroll(cur, prev), (state) => state.mouse.scrollData);
        }
        update(mouseData) { }
        ;
        release() {
            this.unsubsribeScroll();
            this.unsubsribe();
        }
        ;
        debounceScroll(scrollData) {
            if (!this.debounceScrollPending) {
                setTimeout(() => {
                    this.debounceScrollPending = false;
                    this.store.dispatch(mouseState.setScroll(this.debounceScrollData));
                }, 100);
            }
            this.debounceScrollPending = true;
            this.debounceScrollData = scrollData;
        }
        /**
         *  move the dragged elements back under the mouse
         */
        onScroll(state, prev) {
            const delta = {
                x: state.x - prev.x,
                y: state.y - prev.y,
            };
            const mouseData = this.store.getState().mouse.mouseData;
            // mouse did not move in the viewport, just in the document coordinate
            // the selection need to follow the mouse
            this.update(Object.assign({}, mouseData, { movementX: delta.x, movementY: delta.y }));
        }
    }
    exports.MouseHandlerBase = MouseHandlerBase;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW91c2VIYW5kbGVyQmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cy9oYW5kbGVycy9Nb3VzZUhhbmRsZXJCYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQUtBLE1BQWEsZ0JBQWdCO1FBSTNCLFlBQXNCLGFBQTJCLEVBQVUsZUFBNkIsRUFBWSxLQUFpQixFQUFZLEtBQVk7WUFBdkgsa0JBQWEsR0FBYixhQUFhLENBQWM7WUFBVSxvQkFBZSxHQUFmLGVBQWUsQ0FBYztZQUFZLFVBQUssR0FBTCxLQUFLLENBQVk7WUFBWSxVQUFLLEdBQUwsS0FBSyxDQUFPO1lBd0I3STs7ZUFFRztZQUNLLDBCQUFxQixHQUFHLEtBQUssQ0FBQztZQTFCcEMsc0JBQXNCO1lBQ3RCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLFdBQVcsQ0FBQTtZQUM3QyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRTFFLDBCQUEwQjtZQUMxQixJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQy9CLENBQUMsS0FBdUIsRUFBRSxTQUEyQixFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFDdEYsQ0FBQyxLQUFpQixFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUNuQyxDQUFDO1lBRUYsb0JBQW9CO1lBQ3BCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FDMUMsQ0FBQyxHQUFxQixFQUFFLElBQXNCLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUMzRSxDQUFDLEtBQWtCLEVBQW9CLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FDakUsQ0FBQztRQUNKLENBQUM7UUFDRCxNQUFNLENBQUMsU0FBb0IsSUFBRyxDQUFDO1FBQUEsQ0FBQztRQUNoQyxPQUFPO1lBQ0wsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3BCLENBQUM7UUFBQSxDQUFDO1FBUVEsY0FBYyxDQUFDLFVBQTRCO1lBQ25ELElBQUcsQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUU7Z0JBQzlCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7b0JBQ2QsSUFBSSxDQUFDLHFCQUFxQixHQUFHLEtBQUssQ0FBQztvQkFDbkMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO2dCQUNyRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7YUFDVDtZQUNELElBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUM7WUFDbEMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLFVBQVUsQ0FBQztRQUN2QyxDQUFDO1FBR0Q7O1dBRUc7UUFDSCxRQUFRLENBQUMsS0FBdUIsRUFBRSxJQUFzQjtZQUN0RCxNQUFNLEtBQUssR0FBRztnQkFDWixDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztnQkFDbkIsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7YUFDcEIsQ0FBQTtZQUNELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQztZQUN4RCxzRUFBc0U7WUFDdEUseUNBQXlDO1lBQ3pDLElBQUksQ0FBQyxNQUFNLG1CQUNOLFNBQVMsSUFDWixTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFDbEIsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQ2xCLENBQUE7UUFDSixDQUFDO0tBQ0Y7SUE5REQsNENBOERDIn0=