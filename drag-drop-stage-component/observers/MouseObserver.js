define(["require", "exports", "../utils/DomMetrics"], function (require, exports, DomMetrics) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @class This class listens to the store
     *   and apply the state changes to the view
     */
    class MouseObserver {
        constructor(stageDocument, overlayDocument, store, hooks) {
            this.stageDocument = stageDocument;
            this.overlayDocument = overlayDocument;
            this.hooks = hooks;
            this.unsubscribeAll = [];
            this.unsubscribeAll.push(store.subscribe((state, prevState) => this.onStateChanged(state, prevState), (state) => state.mouse));
        }
        cleanup() {
            this.unsubscribeAll.forEach(u => u());
        }
        /**
         * handle state changes, detect changes of scroll or metrics or selection
         * @param {State} state
         * @param {State} prevState the old state obj
         */
        onStateChanged(state, prevState) {
            if (state.scrollData.x !== prevState.scrollData.x || state.scrollData.y !== prevState.scrollData.y) {
                DomMetrics.setScroll(this.stageDocument, state.scrollData);
            }
            // this is now in Ui.ts
            // if(state.cursorData.cursorType !== prevState.cursorData.cursorType) {
            //   this.doc.body.style.cursor = state.cursorData.cursorType;
            // }
        }
    }
    exports.MouseObserver = MouseObserver;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW91c2VPYnNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cy9vYnNlcnZlcnMvTW91c2VPYnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFJQTs7O09BR0c7SUFDSCxNQUFhLGFBQWE7UUFDeEIsWUFBb0IsYUFBMkIsRUFBVSxlQUE2QixFQUFFLEtBQWlCLEVBQVUsS0FBa0I7WUFBakgsa0JBQWEsR0FBYixhQUFhLENBQWM7WUFBVSxvQkFBZSxHQUFmLGVBQWUsQ0FBYztZQUE2QixVQUFLLEdBQUwsS0FBSyxDQUFhO1lBTzdILG1CQUFjLEdBQXNCLEVBQUUsQ0FBQztZQU43QyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUN0QyxDQUFDLEtBQXVCLEVBQUUsU0FBMkIsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLEVBQy9GLENBQUMsS0FBaUIsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FDbkMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUdELE9BQU87WUFDTCxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSCxjQUFjLENBQUMsS0FBdUIsRUFBRSxTQUEyQjtZQUNqRSxJQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFO2dCQUNqRyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQzVEO1lBQ0QsdUJBQXVCO1lBQ3ZCLHdFQUF3RTtZQUN4RSw4REFBOEQ7WUFDOUQsSUFBSTtRQUNOLENBQUM7S0FDRjtJQTNCRCxzQ0EyQkMifQ==