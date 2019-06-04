define(["require", "exports", "./Types", "./utils/Polyfill", "./utils/DomMetrics", "./Keyboard", "./Mouse", "./flux/SelectionState", "./flux/UiState", "./observers/SelectablesObserver", "./observers/MouseObserver", "./observers/UiObserver", "./flux/StageStore", "./flux/SelectableState", "./utils/Events", "./flux/MouseState", "./Ui"], function (require, exports, types, Polyfill, DomMetrics, Keyboard_1, Mouse_1, selectionState, UiAction, SelectablesObserver_1, MouseObserver_1, UiObserver_1, StageStore_1, SelectableState_1, Events_1, MouseState_1, Ui_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * This class is the entry point of the library
     * @see https://github.com/lexoyo/stage
     * @class Stage
     */
    class Stage {
        /**
         * Init the useful classes,
         * add styles to the iframe for the UI,
         * listen to mouse events in the iframe and outside
         * @constructor
         */
        constructor(iframe, elements, options = {}) {
            this.unsubscribeAll = [];
            this.waitingListeners = [];
            // expose for client app
            window['Stage'] = Stage;
            // store the params
            this.iframe = iframe;
            this.contentWindow = this.iframe.contentWindow;
            this.contentDocument = this.iframe.contentDocument;
            this.hooks = Object.assign({}, options, { isSelectable: options.isSelectable || (el => el.classList.contains('selectable')), isDraggable: options.isDraggable || (el => el.classList.contains('draggable')), isDropZone: options.isDropZone || ((el) => el.classList.contains('droppable')), isResizeable: options.isResizeable || ((el) => el.classList.contains('resizeable')), useMinHeight: options.useMinHeight || ((el) => true), canDrop: options.canDrop || ((el, dropZone) => true) });
            // polyfill the iframe
            Polyfill.patchWindow(this.contentWindow);
            // create the store and populate it
            this.store = new StageStore_1.StageStore();
            this.reset(elements);
            // add a UI over the iframe
            Ui_1.Ui.createUi(iframe, this.store)
                .then((ui) => {
                this.ui = ui;
                // state observers
                const selectablesObserver = new SelectablesObserver_1.SelectablesObserver(this.contentDocument, this.ui.overlay.contentDocument, this.store, this.hooks);
                const uiObserver = new UiObserver_1.UiObserver(this.contentDocument, this.ui.overlay.contentDocument, this.store, this.hooks);
                const mouseObserver = new MouseObserver_1.MouseObserver(this.contentDocument, this.ui.overlay.contentDocument, this.store, this.hooks);
                // controllers
                this.mouse = new Mouse_1.Mouse(this.contentWindow, this.ui.overlay.contentWindow, this.store, this.hooks);
                const keyboard = new Keyboard_1.Keyboard(this.ui.overlay.contentWindow, this.store, this.hooks);
                this.unsubscribeAll.push(() => selectablesObserver.cleanup(), () => uiObserver.cleanup(), () => mouseObserver.cleanup(), () => this.mouse.cleanup(), () => keyboard.cleanup(), 
                // window resize
                Events_1.addEvent(window, 'resize', (e) => this.redraw()));
                // finish init
                this.waitingListeners.forEach(l => l());
                this.waitingListeners = [];
            });
        }
        /**
         * to be called before deleting the stage
         */
        cleanup() {
            this.unsubscribeAll.forEach(u => u());
            this.ui.cleanup();
            this.ui = null;
        }
        /**
         * enable/disable catching events
         */
        get catchingEvents() {
            return this.store.getState().ui.catchingEvents;
        }
        set catchingEvents(val) {
            this.store.dispatch(UiAction.setCatchingEvents(val));
        }
        /**
         * enable/disable catching events
         */
        get visible() {
            return this.store.getState().ui.mode !== types.UiMode.HIDE;
        }
        set visible(val) {
            // dispatch UI mode change
            this.store.dispatch(UiAction.setMode(val ? types.UiMode.NONE : types.UiMode.HIDE));
            // scroll may have changed
            this.setScroll({
                x: this.iframe.contentWindow.scrollX,
                y: this.iframe.contentWindow.scrollY,
            });
        }
        /**
         * enable/disable sticky
         */
        get enableSticky() {
            return this.store.getState().ui.enableSticky;
        }
        set enableSticky(val) {
            // dispatch UI mode change
            this.store.dispatch(UiAction.setEnableSticky(val));
        }
        /**
         * force resize of UI
         */
        resizeWindow() {
            this.ui.resizeOverlay();
        }
        /**
         * safe subscribe to mouse event
         * handle the multiple iframes and the current window
         * @return function to call to unsubscribe
         */
        subscribeMouseEvent(type, cbk) {
            let unsub;
            if (!this.mouse) {
                this.waitingListeners.push(() => {
                    unsub = this.subscribeMouseEvent(type, cbk);
                });
                return () => unsub();
            }
            return this.mouse.subscribeMouseEvent(type, cbk);
        }
        /**
         * hide all iframes scroll (useful when you don't want to miss mouse events)
         */
        hideScrolls(hide) {
            this.ui.hideScrolls(hide);
        }
        ///////////////////////////////////////////////////
        // Elements and metrics
        ///////////////////////////////////////////////////
        /**
         * recalculate all the metrics
         */
        redraw() {
            if (!this.store.getState().ui.refreshing) {
                this.store.dispatch(UiAction.setRefreshing(true));
                this.store.dispatch(SelectableState_1.updateSelectables(this.store.getState().selectables.map(selectable => {
                    return Object.assign({}, selectable, { metrics: DomMetrics.getMetrics(selectable.el) });
                })));
                this.store.dispatch(UiAction.setRefreshing(false));
            }
        }
        reset(elements) {
            this.store.dispatch(UiAction.setRefreshing(true));
            this.store.dispatch(SelectableState_1.resetSelectables());
            Array.from(elements).forEach(el => this.addElement(el, false));
            this.store.dispatch(UiAction.setRefreshing(false));
        }
        /**
         * get/set the states of the selected elements
         */
        getSelection() {
            return DomMetrics.getSelection(this.store);
        }
        /**
         * get/set the states of the selected elements
         */
        setSelection(elements) {
            this.store.dispatch(selectionState.set(elements.map(el => this.getState(el))));
        }
        /**
         * get/set the state for an element
         */
        getState(el) {
            return DomMetrics.getSelectable(this.store, el);
        }
        /**
         * get/set the state for an element
         */
        setState(el, subState) {
            const state = this.getState(el);
            this.store.dispatch(SelectableState_1.updateSelectables([Object.assign({}, state, subState)]));
        }
        /**
         * Add an element to the store
         */
        addElement(el, preventDispatch = true) {
            if (preventDispatch) {
                // do not apply style change to this element
                this.store.dispatch(UiAction.setRefreshing(true));
            }
            // create an element in the store
            this.store.dispatch(SelectableState_1.createSelectable({
                el,
                selected: false,
                selectable: this.hooks.isSelectable(el),
                draggable: this.hooks.isDraggable(el),
                resizeable: this.getElementResizeable(el),
                isDropZone: this.hooks.isDropZone(el),
                useMinHeight: this.hooks.useMinHeight(el),
                metrics: DomMetrics.getMetrics(el),
            }));
            if (preventDispatch) {
                this.store.dispatch(UiAction.setRefreshing(false));
            }
            else {
                // compute all metrics again because this element might affect others
                this.redraw();
            }
        }
        getElementResizeable(el) {
            const boolOrObj = this.hooks.isResizeable(el);
            return typeof boolOrObj === 'object' ? boolOrObj : {
                top: boolOrObj,
                left: boolOrObj,
                bottom: boolOrObj,
                right: boolOrObj,
            };
        }
        /**
         * Remove an element from the store
         */
        removeElement(el) {
            this.store.dispatch(SelectableState_1.deleteSelectable(this.store.getState().selectables.find(s => s.el === el)));
            // compute all metrics again because this element might affect others
            this.redraw();
        }
        /**
         * get the best drop zone at a given position
         * if the `el` param is provided, filter possible drop zones with the `canDrop` hook
         */
        getDropZone(x, y, el = null) {
            const dropZones = DomMetrics.findDropZonesUnderMouse(this.contentDocument, this.store, this.hooks, x, y);
            if (!!el)
                return dropZones.filter(dropZone => this.hooks.canDrop(el, dropZone))[0];
            else
                return dropZones[0];
        }
        ///////////////////////////////////////////////////
        // Scroll
        ///////////////////////////////////////////////////
        /**
         * scroll so that the elements are visible
         */
        show(elements) {
            const state = this.store.getState();
            const bb = DomMetrics.getBoundingBox(elements.map(el => state.selectables.find(s => s.el === el)));
            const initialScroll = state.mouse.scrollData;
            const scroll = DomMetrics.getScrollToShow(this.contentDocument, bb);
            if (scroll.x !== initialScroll.x || scroll.y !== initialScroll.y) {
                this.store.dispatch(MouseState_1.setScroll(scroll));
            }
        }
        /**
         * scroll so that the elements are centered
         */
        center(elements) {
            const state = this.store.getState();
            const bb = DomMetrics.getBoundingBox(elements
                .map(el => state.selectables.find(s => s.el === el))
                .filter(s => !!s));
            const initialScroll = state.mouse.scrollData;
            const scrollSize = {
                x: this.contentWindow.innerWidth,
                y: this.contentWindow.innerHeight,
            };
            const scroll = {
                x: Math.max(0, Math.round(bb.left + (bb.width / 2) - (scrollSize.x / 2))),
                y: Math.max(0, Math.round(bb.top + (bb.height / 2) - (scrollSize.y / 2))),
            };
            if (scroll.x !== initialScroll.x || scroll.y !== initialScroll.y) {
                this.store.dispatch(MouseState_1.setScroll(scroll));
            }
        }
        /**
         * get/set the stage scroll data
         */
        setScroll(scroll) {
            const initialScroll = this.store.getState().mouse.scrollData;
            if (scroll.x !== initialScroll.x || scroll.y !== initialScroll.y) {
                this.store.dispatch(MouseState_1.setScroll(scroll));
            }
        }
        /**
         * get/set the stage scroll data
         */
        getScroll() {
            return this.store.getState().mouse.scrollData;
        }
    }
    exports.Stage = Stage;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBZ0JBOzs7O09BSUc7SUFDSCxNQUFhLEtBQUs7UUFVaEI7Ozs7O1dBS0c7UUFDSCxZQUFZLE1BQXlCLEVBQUUsUUFBZ0MsRUFBRSxVQUFxQixFQUFFO1lBWHRGLG1CQUFjLEdBQXNCLEVBQUUsQ0FBQztZQXNIakQscUJBQWdCLEdBQXNCLEVBQUUsQ0FBQztZQTFHdkMsd0JBQXdCO1lBQ3hCLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxLQUFLLENBQUM7WUFFeEIsbUJBQW1CO1lBQ25CLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUM7WUFDL0MsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQztZQUNuRCxJQUFJLENBQUMsS0FBSyxxQkFDTCxPQUFPLElBQ1YsWUFBWSxFQUFFLE9BQU8sQ0FBQyxZQUFZLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQ2pGLFdBQVcsRUFBRSxPQUFPLENBQUMsV0FBVyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUM5RSxVQUFVLEVBQUUsT0FBTyxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUM5RSxZQUFZLEVBQUUsT0FBTyxDQUFDLFlBQVksSUFBSSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUNuRixZQUFZLEVBQUUsT0FBTyxDQUFDLFlBQVksSUFBSSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFDcEQsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUNyRCxDQUFBO1lBRUQsc0JBQXNCO1lBQ3RCLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRXpDLG1DQUFtQztZQUNuQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO1lBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFckIsMkJBQTJCO1lBQzNCLE9BQUUsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7aUJBQzlCLElBQUksQ0FBQyxDQUFDLEVBQU0sRUFBRSxFQUFFO2dCQUNmLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO2dCQUViLGtCQUFrQjtnQkFDbEIsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLHlDQUFtQixDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNuSSxNQUFNLFVBQVUsR0FBRyxJQUFJLHVCQUFVLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2pILE1BQU0sYUFBYSxHQUFHLElBQUksNkJBQWEsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFdkgsY0FBYztnQkFDZCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksYUFBSyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNsRyxNQUFNLFFBQVEsR0FBRyxJQUFJLG1CQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUVyRixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FDdEIsR0FBRyxFQUFFLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLEVBQ25DLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsRUFDMUIsR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxFQUM3QixHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUMxQixHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFO2dCQUV4QixnQkFBZ0I7Z0JBQ2hCLGlCQUFRLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQWEsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQzdELENBQUM7Z0JBRUYsY0FBYztnQkFDZCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDeEMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztZQUM3QixDQUFDLENBQUMsQ0FBQTtRQUNKLENBQUM7UUFHRDs7V0FFRztRQUNILE9BQU87WUFDTCxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNsQixJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQztRQUNqQixDQUFDO1FBRUQ7O1dBRUc7UUFDSCxJQUFJLGNBQWM7WUFDaEIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUM7UUFDakQsQ0FBQztRQUNELElBQUksY0FBYyxDQUFDLEdBQVk7WUFDN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUNEOztXQUVHO1FBQ0gsSUFBSSxPQUFPO1lBQ1QsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDN0QsQ0FBQztRQUNELElBQUksT0FBTyxDQUFDLEdBQVk7WUFDdEIsMEJBQTBCO1lBQzFCLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ25GLDBCQUEwQjtZQUMxQixJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUNiLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxPQUFPO2dCQUNwQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsT0FBTzthQUNyQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBQ0Q7O1dBRUc7UUFDSCxJQUFJLFlBQVk7WUFDZCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQztRQUMvQyxDQUFDO1FBQ0QsSUFBSSxZQUFZLENBQUMsR0FBWTtZQUMzQiwwQkFBMEI7WUFDMUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3JELENBQUM7UUFDRDs7V0FFRztRQUNILFlBQVk7WUFDVixJQUFJLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFHRDs7OztXQUlHO1FBQ0gsbUJBQW1CLENBQUMsSUFBWSxFQUFFLEdBQWdCO1lBQ2hELElBQUksS0FBSyxDQUFDO1lBQ1YsSUFBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ2QsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7b0JBQzlCLEtBQUssR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFBO2dCQUM3QyxDQUFDLENBQUMsQ0FBQztnQkFDSCxPQUFPLEdBQUcsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ3RCO1lBQ0QsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBR0Q7O1dBRUc7UUFDSCxXQUFXLENBQUMsSUFBYTtZQUN2QixJQUFJLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM1QixDQUFDO1FBRUQsbURBQW1EO1FBQ25ELHVCQUF1QjtRQUN2QixtREFBbUQ7UUFFbkQ7O1dBRUc7UUFDSCxNQUFNO1lBQ0osSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRTtnQkFDeEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNsRCxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxtQ0FBaUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUU7b0JBQ3ZGLHlCQUNLLFVBQVUsSUFDYixPQUFPLEVBQUUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLElBQzlDO2dCQUNILENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDTCxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7YUFDcEQ7UUFDSCxDQUFDO1FBRUQsS0FBSyxDQUFDLFFBQWdDO1lBQ3BDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNsRCxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxrQ0FBZ0IsRUFBRSxDQUFDLENBQUM7WUFDeEMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQy9ELElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBRUQ7O1dBRUc7UUFDSCxZQUFZO1lBQ1YsT0FBTyxVQUFVLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBRUQ7O1dBRUc7UUFDSCxZQUFZLENBQUMsUUFBNEI7WUFDdkMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqRixDQUFDO1FBRUQ7O1dBRUc7UUFDSCxRQUFRLENBQUMsRUFBZTtZQUN0QixPQUFPLFVBQVUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBRUQ7O1dBRUc7UUFDSCxRQUFRLENBQUMsRUFBZSxFQUFFLFFBUXpCO1lBQ0MsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNoQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxtQ0FBaUIsQ0FBQyxtQkFDakMsS0FBSyxFQUNMLFFBQVEsRUFDWCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFFRDs7V0FFRztRQUNILFVBQVUsQ0FBQyxFQUFlLEVBQUUsZUFBZSxHQUFHLElBQUk7WUFDaEQsSUFBRyxlQUFlLEVBQUU7Z0JBQ2xCLDRDQUE0QztnQkFDNUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBQ25EO1lBRUQsaUNBQWlDO1lBQ2pDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGtDQUFnQixDQUFDO2dCQUNuQyxFQUFFO2dCQUNGLFFBQVEsRUFBRSxLQUFLO2dCQUNmLFVBQVUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZDLFNBQVMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3JDLFVBQVUsRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsRUFBRSxDQUFDO2dCQUN6QyxVQUFVLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO2dCQUNyQyxZQUFZLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDO2dCQUN6QyxPQUFPLEVBQUUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7YUFDbkMsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFHLGVBQWUsRUFBRTtnQkFDbEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2FBQ3BEO2lCQUNJO2dCQUNILHFFQUFxRTtnQkFDckUsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2FBQ2Y7UUFDSCxDQUFDO1FBRVMsb0JBQW9CLENBQUMsRUFBZTtZQUM1QyxNQUFNLFNBQVMsR0FBOEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDekUsT0FBTyxPQUFPLFNBQVMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pELEdBQUcsRUFBRSxTQUFvQjtnQkFDekIsSUFBSSxFQUFFLFNBQW9CO2dCQUMxQixNQUFNLEVBQUUsU0FBb0I7Z0JBQzVCLEtBQUssRUFBRSxTQUFvQjthQUM1QixDQUFBO1FBQ0gsQ0FBQztRQUVEOztXQUVHO1FBQ0gsYUFBYSxDQUFDLEVBQWU7WUFDM0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsa0NBQWdCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEcscUVBQXFFO1lBQ3JFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNoQixDQUFDO1FBR0Q7OztXQUdHO1FBQ0gsV0FBVyxDQUFDLENBQVMsRUFBRSxDQUFTLEVBQUUsS0FBaUIsSUFBSTtZQUNyRCxNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3pHLElBQUcsQ0FBQyxDQUFDLEVBQUU7Z0JBQUUsT0FBTyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O2dCQUM3RSxPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzQixDQUFDO1FBRUQsbURBQW1EO1FBQ25ELFNBQVM7UUFDVCxtREFBbUQ7UUFFbkQ7O1dBRUc7UUFDSCxJQUFJLENBQUMsUUFBNEI7WUFDL0IsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNwQyxNQUFNLEVBQUUsR0FBRyxVQUFVLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25HLE1BQU0sYUFBYSxHQUFxQixLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQztZQUMvRCxNQUFNLE1BQU0sR0FBcUIsVUFBVSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3RGLElBQUcsTUFBTSxDQUFDLENBQUMsS0FBSyxhQUFhLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLEtBQUssYUFBYSxDQUFDLENBQUMsRUFBRTtnQkFDL0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsc0JBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2FBQ3hDO1FBQ0gsQ0FBQztRQUdEOztXQUVHO1FBQ0gsTUFBTSxDQUFDLFFBQTRCO1lBQ2pDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDcEMsTUFBTSxFQUFFLEdBQUcsVUFBVSxDQUFDLGNBQWMsQ0FDbEMsUUFBUTtpQkFDUCxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7aUJBQ25ELE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDbEIsQ0FBQztZQUNGLE1BQU0sYUFBYSxHQUFxQixLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQztZQUMvRCxNQUFNLFVBQVUsR0FBRztnQkFDakIsQ0FBQyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVTtnQkFDaEMsQ0FBQyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVzthQUNsQyxDQUFDO1lBQ0YsTUFBTSxNQUFNLEdBQXFCO2dCQUMvQixDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRSxDQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEdBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDeEUsQ0FBQztZQUNGLElBQUcsTUFBTSxDQUFDLENBQUMsS0FBSyxhQUFhLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLEtBQUssYUFBYSxDQUFDLENBQUMsRUFBRTtnQkFDL0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsc0JBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2FBQ3hDO1FBQ0gsQ0FBQztRQUdEOztXQUVHO1FBQ0gsU0FBUyxDQUFDLE1BQXdCO1lBQ2hDLE1BQU0sYUFBYSxHQUFxQixJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUM7WUFDL0UsSUFBRyxNQUFNLENBQUMsQ0FBQyxLQUFLLGFBQWEsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsS0FBSyxhQUFhLENBQUMsQ0FBQyxFQUFFO2dCQUMvRCxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxzQkFBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7YUFDeEM7UUFDSCxDQUFDO1FBR0Q7O1dBRUc7UUFDSCxTQUFTO1lBQ1AsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUM7UUFDaEQsQ0FBQztLQUNGO0lBL1VELHNCQStVQyJ9