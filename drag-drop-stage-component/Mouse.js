define(["require", "exports", "./Types", "./utils/DomMetrics", "./flux/MouseState", "./flux/SelectionState", "./flux/UiState", "./utils/Events"], function (require, exports, types, DomMetrics, MouseState, SelectionAction, UiState, Events_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MouseMode;
    (function (MouseMode) {
        MouseMode[MouseMode["UP"] = 0] = "UP";
        MouseMode[MouseMode["DOWN"] = 1] = "DOWN";
        MouseMode[MouseMode["DRAGGING"] = 2] = "DRAGGING";
        MouseMode[MouseMode["WAITING_DBL_CLICK_DOWN"] = 3] = "WAITING_DBL_CLICK_DOWN";
        MouseMode[MouseMode["WAITING_DBL_CLICK_DOWN2"] = 4] = "WAITING_DBL_CLICK_DOWN2";
        MouseMode[MouseMode["WAITING_DBL_CLICK_UP"] = 5] = "WAITING_DBL_CLICK_UP";
    })(MouseMode = exports.MouseMode || (exports.MouseMode = {}));
    class Mouse {
        constructor(winStage, winOverlay, store, hooks) {
            this.winStage = winStage;
            this.winOverlay = winOverlay;
            this.store = store;
            this.hooks = hooks;
            this.mouseMode = MouseMode.UP; // public for unit tests
            this.wasMultiSelected = false;
            this.unsubscribeAll = [];
            // events from inside the iframe
            this.unsubscribeAll.push(Events_1.addEvent(this.winOverlay, 'scroll', (e) => this.scroll(e), true), Events_1.addEvent(this.winOverlay.document.body, 'mousedown', (e) => this.down(e), true), Events_1.addEvent(this.winOverlay.document.body, 'mouseup', (e) => this.up(e), true), Events_1.addEvent(this.winOverlay.document.body, 'mousemove', (e) => this.move(e), true), 
            // events from outside of the iframe
            Events_1.addEvent(document.body, 'mouseup', (e) => this.upOut(e), true), Events_1.addEvent(document.body, 'mousemove', (e) => this.moveOut(e), true));
        }
        cleanup() {
            this.unsubscribeAll.forEach(u => u());
        }
        /**
         * safe subscribe to mouse event
         * handle the multiple iframes and the current window
         * @return function to call to unsubscribe
         */
        subscribeMouseEvent(type, cbk) {
            const unsubscribeArray = [
                Events_1.addEvent(this.winOverlay.document.body, type, (e) => cbk(e), true),
                Events_1.addEvent(document.body, type, (e) => cbk(e), true),
            ];
            return () => unsubscribeArray.forEach(u => u());
        }
        //////////////////////////////
        scroll(e) {
            const scroll = DomMetrics.getScroll(this.winOverlay.document);
            this.store.dispatch(MouseState.setScroll(scroll));
        }
        down(e) {
            if (!this.store.getState().ui.catchingEvents)
                return;
            try {
                // in firefox, this is needed to keep recieving events while dragging outside the iframe
                // in chrome this will throw an error
                e.target['setCapture']();
            }
            catch (e) { }
            e.preventDefault(); // prevent default text selection
            const mouseData = this.eventToMouseData(e);
            if (this.mouseMode === MouseMode.WAITING_DBL_CLICK_UP) {
                this.mouseMode = MouseMode.WAITING_DBL_CLICK_DOWN2;
            }
            else {
                this.mouseMode = MouseMode.WAITING_DBL_CLICK_DOWN;
                const id = setTimeout(() => {
                    if (this.mouseMode === MouseMode.WAITING_DBL_CLICK_DOWN) {
                        this.mouseMode = MouseMode.DOWN;
                        this.onDown(mouseData);
                    }
                    else if (this.mouseMode === MouseMode.WAITING_DBL_CLICK_UP) {
                        this.mouseMode = MouseMode.DOWN;
                        this.onDown(mouseData);
                        this.mouseMode = MouseMode.UP;
                        this.onUp(mouseData);
                    }
                }, 300);
                this.clearTimeout = () => {
                    clearTimeout(id);
                    this.clearTimeout = null;
                };
            }
        }
        up(e, offset = null) {
            if (!this.store.getState().ui.catchingEvents)
                return;
            e.preventDefault();
            const mouseData = this.eventToMouseData(e, offset);
            if (this.mouseMode === MouseMode.WAITING_DBL_CLICK_DOWN) {
                this.mouseMode = MouseMode.WAITING_DBL_CLICK_UP;
            }
            else if (this.mouseMode === MouseMode.WAITING_DBL_CLICK_DOWN2) {
                this.clearTimeout();
                this.mouseMode = MouseMode.UP;
                this.onDblClick(mouseData);
            }
            else if (this.mouseMode === MouseMode.DOWN) {
                this.mouseMode = MouseMode.UP;
                this.onUp(mouseData);
            }
            else if (this.mouseMode === MouseMode.DRAGGING) {
                this.mouseMode = MouseMode.UP;
                this.onDrop(mouseData);
            }
        }
        move(e, offset = null) {
            if (!this.store.getState().ui.catchingEvents)
                return;
            e.preventDefault();
            const mouseData = this.eventToMouseData(e, offset);
            switch (this.mouseMode) {
                case MouseMode.WAITING_DBL_CLICK_UP:
                    this.mouseMode = MouseMode.DOWN;
                    this.onDown(mouseData);
                    this.mouseMode = MouseMode.UP;
                    this.onUp(mouseData);
                    this.onMove(mouseData);
                    break;
                case MouseMode.WAITING_DBL_CLICK_DOWN:
                case MouseMode.WAITING_DBL_CLICK_DOWN2:
                    this.mouseMode = MouseMode.DOWN;
                    this.onDown(mouseData);
                // no break; here
                case MouseMode.DOWN:
                    this.mouseMode = MouseMode.DRAGGING;
                    this.onStartDrag(mouseData);
                    break;
                case MouseMode.DRAGGING:
                    this.onDrag(mouseData);
                    break;
                default:
                    this.onMove(mouseData);
            }
        }
        upOut(e) {
            if (this.mouseMode !== MouseMode.UP) {
                const iframe = this.winOverlay.frameElement.getBoundingClientRect();
                this.up(e, iframe);
            }
        }
        moveOut(e) {
            if (this.mouseMode !== MouseMode.UP) {
                const iframe = this.winOverlay.frameElement.getBoundingClientRect();
                this.move(e, iframe);
            }
        }
        eventToMouseData(e, offset = null) {
            const x = e.clientX - (offset ? offset.left : 0);
            const y = e.clientY - (offset ? offset.top : 0);
            return {
                movementX: e.movementX,
                movementY: e.movementY,
                mouseX: x,
                mouseY: y,
                shiftKey: e.shiftKey,
                target: this.winStage.document.elementFromPoint(x, y),
            };
        }
        /////////////////////////////////////
        onDblClick(mouseData) {
            const { target, shiftKey } = mouseData;
            const selectable = DomMetrics.getSelectable(this.store, target);
            this.store.dispatch(SelectionAction.add(selectable));
            if (this.hooks.onEdit)
                this.hooks.onEdit();
        }
        onDown(mouseData) {
            const { target, shiftKey } = mouseData;
            const selectable = DomMetrics.getSelectable(this.store, target);
            if (selectable && selectable.selectable) {
                this.wasMultiSelected = DomMetrics.getSelection(this.store).length > 1 && selectable.selected;
                if (this.wasMultiSelected || shiftKey) {
                    this.store.dispatch(SelectionAction.add(selectable));
                }
                else {
                    this.store.dispatch(SelectionAction.set([selectable]));
                }
            }
            else {
                this.wasMultiSelected = false;
            }
        }
        onUp(mouseData) {
            const { target, shiftKey } = mouseData;
            const selectable = DomMetrics.getSelectable(this.store, target);
            if (selectable && selectable.selectable) {
                if (shiftKey) {
                    if (this.wasMultiSelected && selectable.selected) {
                        this.store.dispatch(SelectionAction.remove(selectable));
                    }
                }
                else {
                    this.store.dispatch(SelectionAction.set([selectable]));
                }
            }
            else if (!shiftKey) {
                this.store.dispatch(SelectionAction.reset());
            }
            this.wasMultiSelected = false;
        }
        onMove(mouseData) {
            const { mouseX, mouseY, target } = mouseData;
            const selectable = DomMetrics.getSelectable(this.store, target);
            this.store.dispatch(MouseState.setCursorData(DomMetrics.getCursorData(mouseX, mouseY, this.store.getState().mouse.scrollData, selectable)));
        }
        onDrag(mouseData) {
            this.store.dispatch(MouseState.setMouseData(mouseData));
        }
        onStartDrag(mouseData) {
            // update mouse data
            this.store.dispatch(MouseState.setMouseData(mouseData));
            // draw or resize or move
            const selectable = DomMetrics.getSelectable(this.store, mouseData.target);
            if (selectable) {
                const direction = this.store.getState().mouse.cursorData;
                // start resize
                if (DomMetrics.isResizeable(selectable.resizeable, direction)) {
                    this.store.dispatch(UiState.setMode(types.UiMode.RESIZE));
                }
                // start drag
                else if (selectable.draggable) {
                    this.store.dispatch(UiState.setMode(types.UiMode.DRAG));
                }
                else {
                    this.store.dispatch(UiState.setMode(types.UiMode.DRAW));
                }
            }
            else {
                this.store.dispatch(UiState.setMode(types.UiMode.DRAW));
            }
        }
        onDrop(mouseData) {
            this.store.dispatch(UiState.setMode(types.UiMode.NONE));
        }
    }
    exports.Mouse = Mouse;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW91c2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdHMvTW91c2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBUUEsSUFBWSxTQU9YO0lBUEQsV0FBWSxTQUFTO1FBQ25CLHFDQUFFLENBQUE7UUFDRix5Q0FBSSxDQUFBO1FBQ0osaURBQVEsQ0FBQTtRQUNSLDZFQUFzQixDQUFBO1FBQ3RCLCtFQUF1QixDQUFBO1FBQ3ZCLHlFQUFvQixDQUFBO0lBQ3RCLENBQUMsRUFQVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQU9wQjtJQUVELE1BQWEsS0FBSztRQUdoQixZQUFvQixRQUFnQixFQUFVLFVBQWtCLEVBQVUsS0FBaUIsRUFBVSxLQUFrQjtZQUFuRyxhQUFRLEdBQVIsUUFBUSxDQUFRO1lBQVUsZUFBVSxHQUFWLFVBQVUsQ0FBUTtZQUFVLFVBQUssR0FBTCxLQUFLLENBQVk7WUFBVSxVQUFLLEdBQUwsS0FBSyxDQUFhO1lBRnZILGNBQVMsR0FBRyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsd0JBQXdCO1lBQzFDLHFCQUFnQixHQUFZLEtBQUssQ0FBQztZQWNsQyxtQkFBYyxHQUFzQixFQUFFLENBQUM7WUFaN0MsZ0NBQWdDO1lBQ2hDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUN0QixpQkFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBWSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUMzRSxpQkFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFZLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQzFGLGlCQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFR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