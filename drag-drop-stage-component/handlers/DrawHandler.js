define(["require", "exports", "./MouseHandlerBase", "../flux/SelectionState", "../utils/DomMetrics"], function (require, exports, MouseHandlerBase_1, selectionState, domMetrics) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class DrawHandler extends MouseHandlerBase_1.MouseHandlerBase {
        constructor(stageDocument, overlayDocument, store, hooks) {
            super(stageDocument, overlayDocument, store, hooks);
            // notify the app
            if (!!this.hooks.onStartDraw)
                this.hooks.onStartDraw();
            const state = store.getState();
            const scrollData = domMetrics.getScroll(this.stageDocument);
            this.initialX = state.mouse.mouseData.mouseX + scrollData.x;
            this.initialY = state.mouse.mouseData.mouseY + scrollData.y;
            // create and attach a div to draw the region
            // FIXME: the region marker should be outside the iframe
            this.regionMarker = overlayDocument.createElement('div');
            this.regionMarker.classList.add('region-marker');
            this.moveRegion({ left: -999, top: -999, right: -999, bottom: -999, width: 0, height: 0 });
            overlayDocument.body.appendChild(this.regionMarker);
        }
        update(mouseData) {
            super.update(mouseData);
            const scrollData = domMetrics.getScroll(this.stageDocument);
            const bb = {
                left: Math.min(this.initialX, (mouseData.mouseX + scrollData.x)),
                top: Math.min(this.initialY, (mouseData.mouseY + scrollData.y)),
                right: Math.max(this.initialX, (mouseData.mouseX + scrollData.x)),
                bottom: Math.max(this.initialY, (mouseData.mouseY + scrollData.y)),
                height: Math.abs(this.initialY - (mouseData.mouseY + scrollData.y)),
                width: Math.abs(this.initialX - (mouseData.mouseX + scrollData.x)),
            };
            // update the drawing
            this.moveRegion(bb);
            // select all elements which intersect with the region
            let newSelection = this.store.getState().selectables
                .filter(selectable => {
                return selectable.selectable &&
                    selectable.draggable && // do not select the background
                    selectable.metrics.clientRect.left < bb.right &&
                    selectable.metrics.clientRect.right > bb.left &&
                    selectable.metrics.clientRect.top < bb.bottom &&
                    selectable.metrics.clientRect.bottom > bb.top;
            });
            // handle removed elements
            this.selection
                .filter(selectable => !newSelection.find(s => selectable.el === s.el))
                .forEach(selectable => {
                this.store.dispatch(selectionState.remove(selectable));
            });
            // handle added elements
            newSelection
                .filter(selectable => !this.selection.find(s => selectable.el === s.el))
                .forEach(selectable => {
                this.store.dispatch(selectionState.add(selectable));
            });
            // store the new selection
            this.selection = newSelection;
            // update scroll
            const initialScroll = this.store.getState().mouse.scrollData;
            const scroll = domMetrics.getScrollToShow(this.stageDocument, bb);
            if (scroll.x !== initialScroll.x || scroll.y !== initialScroll.y) {
                this.debounceScroll(scroll);
            }
            // notify the app
            if (this.hooks.onDraw)
                this.hooks.onDraw(this.selection, bb);
        }
        release() {
            super.release();
            this.regionMarker.parentNode.removeChild(this.regionMarker);
            // notify the app
            if (this.hooks.onDrawEnd)
                this.hooks.onDrawEnd();
            this.selection = [];
        }
        /**
         * display the position marker atthe given positionin the dom
         */
        moveRegion({ left, top, width, height }) {
            this.regionMarker.style.width = width + 'px';
            this.regionMarker.style.height = height + 'px';
            this.regionMarker.style.transform = `translate(${left}px, ${top}px)`; // scale(${width}, ${height})
        }
    }
    exports.DrawHandler = DrawHandler;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRHJhd0hhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdHMvaGFuZGxlcnMvRHJhd0hhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBT0EsTUFBYSxXQUFZLFNBQVEsbUNBQWdCO1FBSy9DLFlBQVksYUFBMkIsRUFBRSxlQUE2QixFQUFFLEtBQWlCLEVBQUUsS0FBWTtZQUNyRyxLQUFLLENBQUMsYUFBYSxFQUFFLGVBQWUsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFcEQsaUJBQWlCO1lBQ2pCLElBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVztnQkFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBRXRELE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUUvQixNQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUM1RCxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQzVELElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFFNUQsNkNBQTZDO1lBQzdDLHdEQUF3RDtZQUN4RCxJQUFJLENBQUMsWUFBWSxHQUFHLGVBQWUsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDekQsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ2pELElBQUksQ0FBQyxVQUFVLENBQUMsRUFBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEdB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