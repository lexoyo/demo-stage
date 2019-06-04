var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "./Types", "./utils/Events", "./utils/DomMetrics"], function (require, exports, Types_1, Events_1, DomMetrics) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Ui {
        constructor(iframe, overlay, store) {
            this.iframe = iframe;
            this.overlay = overlay;
            this.store = store;
            this.boxes = [];
            this.unsubscribeAll = [];
            // listen to events
            this.unsubscribeAll.push(
            // addEvent(win, 'resize', () => this.resizeOverlay()),
            Events_1.addEvent(window, 'resize', () => this.resizeOverlay()), store.subscribe((selectables) => this.update(selectables, this.getScrollData(iframe)), (state) => state.selectables), store.subscribe((state, prevState) => this.onMouseChanged(state, prevState), (state) => state.mouse), store.subscribe((state, prevState) => this.onUiChanged(state, prevState), (state) => state.ui));
            // init iframes
            this.resizeOverlay();
            this.overlay.contentDocument.body.style.overflow = 'auto';
            iframe.contentDocument.body.style.overflow = 'scroll'; // FIXME: this could be a problem if saved with the site, what other solution?
            // add UI styles
            this.overlay.contentDocument.head.innerHTML = `
      <style>
        body {
          overflow: scroll;
          margin: -5px;
        }

        body.dragging-mode .box.not-selected.not-aboutToDrop,
        body.resizing-mode .box.not-selected { display: none; }

        .aboutToDrop, .selected.box, .box:hover {
          border: 1px solid rgba(0, 0, 0, .5);
        }
        .box.aboutToDrop:before,
        .box.selected:before,
        .box:hover:before {
          content: ' ';
          position: absolute;
          z-index: -1;
          top: 1px;
          left: 1px;
          right: 1px;
          bottom: 1px;
          border: 1px solid rgba(255, 255, 255, .3);
        }
        .not-selectable,
        .not-selected .handle { display: none; }

        .handle {
          position: absolute;
          border: 1px solid rgba(0, 0, 0, .5);
          background-color: rgba(255, 255, 255, 1);
          width: 5px;
          height: 5px;
          border-radius: 2.5px;
        }
        .handle-nw { top: -4px; left: -4px; }
        .not-resizeable-nw .handle-nw { display: none; }

        .handle-ne { top: -4px; right: -4px; }
        .not-resizeable-ne .handle-ne { display: none; }

        .handle-sw { bottom: -4px; left: -4px; }
        .not-resizeable-sw .handle-sw { display: none; }

        .handle-se { bottom: -4px; right: -4px; }
        .not-resizeable-se .handle-se { display: none; }

        .region-marker {
          background-color: rgba(0, 0, 0, .1);
          border: 1px solid rgba(255, 255, 255, .5);
          display: flex;
          position: absolute;
          left: 0;
          top: 0;
          min-width: 1px;
          min-height: 1px;
        }

        .stycky-left { border-left-color: red !important; }
        .stycky-top { border-top-color: red !important; }
        .stycky-right { border-right-color: red !important; }
        .stycky-bottom { border-bottom-color: red !important; }
    `;
        }
        static createUi(iframe, store) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve, reject) => {
                    const doc = DomMetrics.getDocument(iframe);
                    const overlay = doc.createElement('iframe');
                    doc.body.appendChild(overlay);
                    if (overlay.contentDocument.readyState === 'complete') {
                        // chrome
                        resolve(new Ui(iframe, overlay, store));
                    }
                    else {
                        // firefox
                        overlay.contentWindow.onload = () => {
                            resolve(new Ui(iframe, overlay, store));
                        };
                    }
                });
            });
        }
        resizeOverlay() {
            this.resize();
            this.update(this.store.getState().selectables, this.getScrollData(this.iframe));
        }
        cleanup() {
            this.unsubscribeAll.forEach(u => u());
            this.overlay.parentElement.removeChild(this.overlay);
            this.overlay = null;
        }
        getScrollData(iframe) {
            return {
                x: iframe.contentWindow.document.scrollingElement.scrollWidth,
                y: iframe.contentWindow.document.scrollingElement.scrollHeight,
            };
        }
        resize() {
            const metrics = DomMetrics.getMetrics(this.iframe);
            const zIndex = this.iframe.contentWindow.getComputedStyle(this.iframe).getPropertyValue('z-index');
            metrics.position = 'absolute';
            DomMetrics.setMetrics(this.overlay, metrics, false, true);
            this.overlay.style.backgroundColor = 'transparent';
            this.overlay.style.zIndex = ((parseInt(zIndex) || 0) + 1).toString();
            this.overlay.style.border = 'none';
        }
        onUiChanged(state, prevState) {
            if (state.catchingEvents !== prevState.catchingEvents || state.mode !== prevState.mode) {
                // this is to give the focus on the UI, and not prevent the user from pressing tab again
                this.overlay.style.pointerEvents = state.catchingEvents ? '' : 'none';
                if (state.mode === Types_1.UiMode.HIDE) {
                    this.overlay.style.top = "-999999px";
                    this.overlay.style.left = "-999999px";
                    this.overlay.style.width = "0";
                    this.overlay.style.height = "0";
                }
                else {
                    this.resizeOverlay();
                }
            }
        }
        onMouseChanged(state, prevState) {
            if (state.scrollData.x !== prevState.scrollData.x || state.scrollData.y !== prevState.scrollData.y) {
                DomMetrics.setScroll(this.overlay.contentDocument, state.scrollData);
                // adjust scroll - sometimes there is a 1px difference because of the border of the UI
                if (this.store.getState().ui.mode !== Types_1.UiMode.HIDE) {
                    DomMetrics.setScroll(this.iframe.contentDocument, state.scrollData);
                    const newScrollData = DomMetrics.getScroll(this.iframe.contentDocument);
                    if (state.scrollData.x !== newScrollData.x || state.scrollData.y !== newScrollData.y) {
                        // there is a delta in scroll
                        DomMetrics.setScroll(this.overlay.contentDocument, newScrollData);
                    }
                }
            }
            if (state.cursorData.cursorType !== prevState.cursorData.cursorType) {
                this.overlay.contentDocument.body.style.cursor = state.cursorData.cursorType;
            }
        }
        update(selectables, scrollData) {
            //  update scroll
            this.overlay.contentDocument.body.style.width = scrollData.x + 'px';
            this.overlay.contentDocument.body.style.height = scrollData.y + 'px';
            // remove the UIs that have no corresponding element in the stage
            this.boxes
                .filter(r => !selectables.find(s => r.selectable.el === s.el))
                .forEach(r => r.ui.parentElement.removeChild(r.ui));
            // remove the boxes
            this.boxes = this.boxes
                .filter(r => selectables.find(s => r.selectable.el === s.el));
            // add the missing boxes
            this.boxes = this.boxes.concat(selectables
                // only the missing ones
                .filter(s => !this.boxes.find(r => r.selectable.el === s.el))
                // create a box object
                .map(s => ({
                selectable: s,
                // append a new div to the overlay
                ui: this.overlay.contentDocument.body.appendChild(this.createBoxUi()),
            })));
            // update the view
            const dropZones = selectables.filter(s => s.dropZone && s.dropZone.parent).map(s => s.dropZone.parent);
            this.boxes
                .map(r => this.updateBox(r, selectables.find(s => s.el === r.selectable.el), dropZones));
        }
        createBoxUi() {
            const box = this.overlay.contentDocument.createElement('div');
            box.innerHTML = `
      <div class='handle handle-nw'></div>
      <div class='handle handle-ne'></div>
      <div class='handle handle-sw'></div>
      <div class='handle handle-se'></div>
    `;
            return box;
        }
        updateBox(box, selectable, dropZones) {
            const sticky = selectable.selected ? this.store.getState().ui.sticky : { top: null, left: null, bottom: null, right: null };
            const aboutToDrop = !!dropZones.find(el => el === selectable.el);
            box.selectable = selectable;
            DomMetrics.setMetrics(box.ui, Object.assign({}, box.selectable.metrics, { position: 'absolute', padding: { top: 0, left: 0, bottom: 0, right: 0 }, margin: { top: 0, left: 0, bottom: 0, right: 0 }, border: { top: 1, left: 1, bottom: 1, right: 1 } }), false, true);
            box.ui.classList.remove(...[
                !box.selectable.selected ? 'selected' : 'not-selected',
                !box.selectable.selectable ? 'selectable' : 'not-selectable',
                !box.selectable.draggable ? 'draggable' : 'not-draggable',
                (!box.selectable.resizeable.top && !box.selectable.resizeable.left) ? 'resizeable-nw' : 'not-resizeable-nw',
                (!box.selectable.resizeable.top && !box.selectable.resizeable.right) ? 'resizeable-ne' : 'not-resizeable-ne',
                (!box.selectable.resizeable.bottom && !box.selectable.resizeable.left) ? 'resizeable-sw' : 'not-resizeable-sw',
                (!box.selectable.resizeable.bottom && !box.selectable.resizeable.right) ? 'resizeable-se' : 'not-resizeable-se',
                !box.selectable.isDropZone ? 'isDropZone' : 'not-isDropZone',
                !sticky.left ? 'stycky-left' : 'not-stycky-left',
                !sticky.top ? 'stycky-top' : 'not-stycky-top',
                !sticky.right ? 'stycky-right' : 'not-stycky-right',
                !sticky.bottom ? 'stycky-bottom' : 'not-stycky-bottom',
                !aboutToDrop ? 'aboutToDrop' : 'not-aboutToDrop',
            ]);
            box.ui.classList.add(...[
                'box',
                box.selectable.selected ? 'selected' : 'not-selected',
                box.selectable.selectable ? 'selectable' : 'not-selectable',
                box.selectable.draggable ? 'draggable' : 'not-draggable',
                (box.selectable.resizeable.top && box.selectable.resizeable.left) ? 'resizeable-nw' : 'not-resizeable-nw',
                (box.selectable.resizeable.top && box.selectable.resizeable.right) ? 'resizeable-ne' : 'not-resizeable-ne',
                (box.selectable.resizeable.bottom && box.selectable.resizeable.left) ? 'resizeable-sw' : 'not-resizeable-sw',
                (box.selectable.resizeable.bottom && box.selectable.resizeable.right) ? 'resizeable-se' : 'not-resizeable-se',
                box.selectable.isDropZone ? 'isDropZone' : 'not-isDropZone',
                sticky.left ? 'stycky-left' : 'not-stycky-left',
                sticky.top ? 'stycky-top' : 'not-stycky-top',
                sticky.right ? 'stycky-right' : 'not-stycky-right',
                sticky.bottom ? 'stycky-bottom' : 'not-stycky-bottom',
                aboutToDrop ? 'aboutToDrop' : 'not-aboutToDrop',
            ]);
            return box;
        }
        /**
         * hide all iframes scroll (useful when you don't want to miss mouse events)
         */
        hideScrolls(hide) {
            // this.iframe.contentDocument.body.style.overflow = hide ? 'hidden' : '';
            this.overlay.contentDocument.body.style.overflow = hide ? 'hidden' : '';
        }
    }
    exports.Ui = Ui;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVWkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdHMvVWkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFVQSxNQUFhLEVBQUU7UUF1QmIsWUFBNEIsTUFBeUIsRUFBUyxPQUEwQixFQUFVLEtBQWlCO1lBQXZGLFdBQU0sR0FBTixNQUFNLENBQW1CO1lBQVMsWUFBTyxHQUFQLE9BQU8sQ0FBbUI7WUFBVSxVQUFLLEdBQUwsS0FBSyxDQUFZO1lBdEJ6RyxVQUFLLEdBQWUsRUFBRSxDQUFDO1lBc0h6QixtQkFBYyxHQUFzQixFQUFFLENBQUM7WUEvRjdDLG1CQUFtQjtZQUNuQixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUk7WUFDdEIsdURBQXVEO1lBQ3ZELGlCQUFRLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsRUFDdEQsS0FBSyxDQUFDLFNBQVMsQ0FDYixDQUFDLFdBQW1DLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsRUFDN0YsQ0FBQyxLQUFZLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQ3BDLEVBQ0QsS0FBSyxDQUFDLFNBQVMsQ0FDYixDQUFDLEtBQWlCLEVBQUUsU0FBcUIsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLEVBQ25GLENBQUMsS0FBVyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUM3QixFQUNELEtBQUssQ0FBQyxTQUFTLENBQ2IsQ0FBQyxLQUFjLEVBQUUsU0FBa0IsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLEVBQzFFLENBQUMsS0FBVyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMs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