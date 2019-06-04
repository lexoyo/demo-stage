define(["require", "exports", "./MouseHandlerBase", "../flux/SelectableState", "../flux/MouseState", "../utils/DomMetrics", "../flux/UiState", "../Constants"], function (require, exports, MouseHandlerBase_1, selectableState, mouseState, domMetrics, UiState_1, Constants_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ResizeHandler extends MouseHandlerBase_1.MouseHandlerBase {
        constructor(stageDocument, overlayDocument, store, hooks) {
            super(stageDocument, overlayDocument, store, hooks);
            // direction
            this.cursorData = this.store.getState().mouse.cursorData;
            // keep only risizeable elements
            this.selection = this.selection.filter(s => domMetrics.isResizeable(s.resizeable, this.cursorData));
            // notify the app
            if (!!this.hooks.onStartResize)
                this.hooks.onStartResize(this.selection);
        }
        /**
         * Called by the Stage class when mouse moves
         */
        update(mouseData) {
            super.update(mouseData);
            // set a new size
            this.selection = this.selection.map((selectable) => {
                // handle the width and height computation
                const clientRect = Object.assign({}, selectable.metrics.clientRect);
                const computedStyleRect = Object.assign({}, selectable.metrics.computedStyleRect);
                switch (this.cursorData.x) {
                    case '':
                        break;
                    case 'left':
                        computedStyleRect.width -= mouseData.movementX;
                        clientRect.width -= mouseData.movementX;
                        break;
                    case 'right':
                        computedStyleRect.width += mouseData.movementX;
                        clientRect.width += mouseData.movementX;
                        break;
                    default: throw new Error('unknown direction ' + this.cursorData.x);
                }
                if (this.cursorData.y != '') {
                    if (mouseData.shiftKey && this.cursorData.x != '') {
                        computedStyleRect.height = computedStyleRect.width * selectable.metrics.proportions;
                        clientRect.height = clientRect.width * selectable.metrics.proportions;
                    }
                    else {
                        if (this.cursorData.y === 'top') {
                            computedStyleRect.height -= mouseData.movementY;
                            clientRect.height -= mouseData.movementY;
                        }
                        else {
                            computedStyleRect.height += mouseData.movementY;
                            clientRect.height += mouseData.movementY;
                        }
                    }
                }
                // handle the position change
                if (this.cursorData.x === 'left') {
                    // compute the change
                    computedStyleRect.left += mouseData.movementX;
                    clientRect.left += mouseData.movementX;
                }
                if (this.cursorData.y === 'top') {
                    // compute the change
                    computedStyleRect.top += mouseData.movementY;
                    clientRect.top += mouseData.movementY;
                }
                // handle the case where the resize has not been possible
                // either because the content is too big, or a min-whidth/height has overriden our changes
                if (this.cursorData.x !== '') {
                    //  store initial data
                    const initialWidth = selectable.el.style.width;
                    // move to the final position will take the new parent offset
                    selectable.el.style.width = Math.max(Constants_1.MIN_SIZE, computedStyleRect.width) + 'px';
                    // check for the offset and update the metrics
                    const bb = domMetrics.getBoundingBoxDocument(selectable.el);
                    const delta = clientRect.width - bb.width;
                    computedStyleRect.width -= delta;
                    clientRect.width -= delta;
                    if (this.cursorData.x === 'left') {
                        computedStyleRect.left += delta;
                        clientRect.left += delta;
                    }
                    // restore the initial data
                    selectable.el.style.width = initialWidth;
                }
                // handle the case where the resize has not been possible
                // either because the content is too big, or a min-whidth/height has overriden our changes
                if (this.cursorData.y !== '') {
                    //  store initial data
                    const heightAttr = selectable.useMinHeight ? 'minHeight' : 'height';
                    const initialHeight = selectable.el.style[heightAttr];
                    // move to the final position will take the new parent offset
                    selectable.el.style[heightAttr] = Math.max(Constants_1.MIN_SIZE, computedStyleRect.height) + 'px';
                    // check for the offset and update the metrics
                    const bb = domMetrics.getBoundingBoxDocument(selectable.el);
                    const delta = clientRect.height - bb.height;
                    computedStyleRect.height -= delta;
                    clientRect.height -= delta;
                    if (this.cursorData.y === 'top') {
                        computedStyleRect.top += delta;
                        clientRect.top += delta;
                    }
                    // restore the initial data
                    selectable.el.style[heightAttr] = initialHeight;
                }
                // update bottom and right
                computedStyleRect.right = computedStyleRect.left + computedStyleRect.width;
                clientRect.right = clientRect.left + clientRect.width;
                computedStyleRect.bottom = computedStyleRect.top + computedStyleRect.height;
                clientRect.bottom = clientRect.top + clientRect.height;
                // update the metrics
                return Object.assign({}, selectable, { metrics: Object.assign({}, selectable.metrics, { clientRect,
                        computedStyleRect }) });
            });
            // dispatch all the changes at once
            this.store.dispatch(selectableState.updateSelectables(this.selection));
            // update scroll
            const initialScroll = this.store.getState().mouse.scrollData;
            const bb = {
                top: mouseData.mouseY + initialScroll.y,
                left: mouseData.mouseX + initialScroll.x,
                bottom: mouseData.mouseY + initialScroll.y,
                right: mouseData.mouseX + initialScroll.x,
                height: 0,
                width: 0,
            };
            const scroll = domMetrics.getScrollToShow(this.stageDocument, bb);
            if (scroll.x !== initialScroll.x || scroll.y !== initialScroll.y) {
                this.debounceScroll(scroll);
            }
            // notify the app
            if (this.hooks.onResize)
                this.hooks.onResize(this.selection, bb);
        }
        /**
         * Called by the Stage class when mouse button is released
         */
        release() {
            super.release();
            // reset the state of the mouse
            // this is useful when the resize has not been taken into account (e.g. content too big)
            // and the mouse is not on the edge of the element anymore
            const state = this.store.getState();
            const selectable = domMetrics.getSelectable(this.store, state.mouse.mouseData.target);
            this.store.dispatch(mouseState.setCursorData(domMetrics.getCursorData(state.mouse.mouseData.mouseX, state.mouse.mouseData.mouseY, state.mouse.scrollData, selectable)));
            // update the real metrics after drop
            setTimeout(() => {
                // change UI state while selectables metrics are simply updated
                this.store.dispatch(UiState_1.setRefreshing(true));
                const updatedState = this.store.getState().selectables
                    .map(selectable => {
                    return Object.assign({}, selectable, { metrics: domMetrics.getMetrics(selectable.el) });
                });
                this.store.dispatch(selectableState.updateSelectables(updatedState));
                // change UI state while selectables metrics are simply updated
                this.store.dispatch(UiState_1.setRefreshing(false));
                // notify the app
                if (this.hooks.onResizeEnd)
                    this.hooks.onResizeEnd(this.selection);
            }, 0);
        }
    }
    exports.ResizeHandler = ResizeHandler;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzaXplSGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cy9oYW5kbGVycy9SZXNpemVIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVNBLE1BQWEsYUFBYyxTQUFRLG1DQUFnQjtRQUVqRCxZQUFZLGFBQTJCLEVBQUUsZUFBNkIsRUFBRSxLQUFpQixFQUFFLEtBQVk7WUFDckcsS0FBSyxDQUFDLGFBQWEsRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRXBELFlBQVk7WUFDWixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQztZQUV6RCxnQ0FBZ0M7WUFDaEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUVwRyxpQkFBaUI7WUFDakIsSUFBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhO2dCQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMxRSxDQUFDO1FBRUQ7O1dBRUc7UUFDSCxNQUFNLENBQUMsU0FBb0I7WUFDekIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUV4QixpQkFBaUI7WUFDakIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQTJCLEVBQUUsRUFBRTtnQkFDbEUsMENBQTBDO2dCQUMxQyxNQUFNLFVBQVUscUJBQ1gsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQ2pDLENBQUM7Z0JBQ0YsTUFB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