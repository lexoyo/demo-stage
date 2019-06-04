define(["require", "exports", "./utils/Events", "./flux/UiState", "./flux/SelectionState", "./Types", "./flux/SelectableState"], function (require, exports, Events_1, UiState_1, SelectionState_1, Types_1, SelectableState_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const MOVE_DISTANCE = 5;
    const SHIFT_MOVE_DISTANCE = 1;
    const ALT_MOVE_DISTANCE = 10;
    class Keyboard {
        constructor(win, store, hooks) {
            this.win = win;
            this.store = store;
            this.hooks = hooks;
            this.unsubscribeAll = [];
            // events from inside the iframe
            this.unsubscribeAll.push(Events_1.addEvent(window, 'keydown', (e) => this.onKeyDown(e)), Events_1.addEvent(win, 'keydown', (e) => this.onKeyDown(e)));
        }
        cleanup() {
            this.unsubscribeAll.forEach(u => u());
        }
        /**
         * handle shortcuts
         */
        onKeyDown(e) {
            const key = e.key;
            const state = this.store.getState();
            const target = e.target;
            if (state.ui.catchingEvents &&
                target.tagName.toLowerCase() !== 'input' &&
                target.tagName.toLowerCase() !== 'textarea' &&
                !target.hasAttribute('contenteditable')) {
                switch (key) {
                    case 'Escape':
                        if (state.ui.mode !== Types_1.UiMode.NONE) {
                            this.store.dispatch(UiState_1.setMode(Types_1.UiMode.NONE));
                            this.store.dispatch(SelectionState_1.reset());
                        }
                        break;
                    case 'Enter':
                        if (this.hooks.onEdit)
                            this.hooks.onEdit();
                        break;
                    // case 'Tab':
                    //   if(this.store.getState().ui.mode === UiMode.HIDE) {
                    //     this.store.dispatch(setMode(UiMode.NONE));
                    //   }
                    //   else {
                    //     this.store.dispatch(setMode(UiMode.HIDE));
                    //   }
                    //   break;
                    case 'ArrowLeft':
                        this.move(-this.getDistance(e), 0);
                        break;
                    case 'ArrowUp':
                        this.move(0, -this.getDistance(e));
                        break;
                    case 'ArrowRight':
                        this.move(this.getDistance(e), 0);
                        break;
                    case 'ArrowDown':
                        this.move(0, this.getDistance(e));
                        break;
                    default:
                        return;
                }
                // only if we catched a shortcut
                e.preventDefault();
                e.stopPropagation();
            }
        }
        getDistance(e) {
            return e.shiftKey ? SHIFT_MOVE_DISTANCE :
                e.altKey ? ALT_MOVE_DISTANCE : MOVE_DISTANCE;
        }
        move(movementX, movementY) {
            this.store.dispatch(SelectableState_1.updateSelectables(this.store.getState().selectables
                .filter(s => s.selected && s.metrics.position !== 'static' && this.hooks.isDraggable(s.el))
                .map(selectable => (Object.assign({}, selectable, { metrics: Object.assign({}, selectable.metrics, { clientRect: Object.assign({}, selectable.metrics.clientRect, { top: selectable.metrics.clientRect.top + movementY, left: selectable.metrics.clientRect.left + movementX, bottom: selectable.metrics.clientRect.bottom + movementY, right: selectable.metrics.clientRect.right + movementX }), computedStyleRect: Object.assign({}, selectable.metrics.computedStyleRect, { top: selectable.metrics.computedStyleRect.top + movementY, left: selectable.metrics.computedStyleRect.left + movementX, bottom: selectable.metrics.computedStyleRect.bottom + movementY, right: selectable.metrics.computedStyleRect.right + movementX }) }) })))));
        }
    }
    exports.Keyboard = Keyboard;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiS2V5Ym9hcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdHMvS2V5Ym9hcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBT0EsTUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFDO0lBQ3hCLE1BQU0sbUJBQW1CLEdBQUcsQ0FBQyxDQUFDO0lBQzlCLE1BQU0saUJBQWlCLEdBQUcsRUFBRSxDQUFDO0lBRTdCLE1BQWEsUUFBUTtRQUNuQixZQUFvQixHQUFXLEVBQVUsS0FBaUIsRUFBVSxLQUFZO1lBQTVELFFBQUcsR0FBSCxHQUFHLENBQVE7WUFBVSxVQUFLLEdBQUwsS0FBSyxDQUFZO1lBQVUsVUFBSyxHQUFMLEtBQUssQ0FBTztZQVF4RSxtQkFBYyxHQUFzQixFQUFFLENBQUM7WUFQN0MsZ0NBQWdDO1lBQ2hDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUN0QixpQkFBUSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFnQixFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ3BFLGlCQUFRLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQWdCLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDbEUsQ0FBQztRQUNKLENBQUM7UUFHRCxPQUFPO1lBQ0wsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFFRDs7V0FFRztRQUNLLFNBQVMsQ0FBQyxDQUFnQjtZQUNoQyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDO1lBQ2xCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDcEMsTUFBTSxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQXFCLENBQUM7WUFF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