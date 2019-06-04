define(["require", "exports", "./MouseHandlerBase", "../Types", "../flux/SelectableState", "../utils/DomMetrics", "../flux/UiState", "../Constants"], function (require, exports, MouseHandlerBase_1, Types_1, selectableState, domMetrics, UiState_1, Constants_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MoveHandler extends MouseHandlerBase_1.MouseHandlerBase {
        constructor(stageDocument, overlayDocument, store, hooks) {
            super(stageDocument, overlayDocument, store, hooks);
            // keep only draggable elements
            // which are not in a selected element also being dragged
            this.selection = this.selection
                .filter(s => s.draggable)
                .filter(s => !domMetrics.hasASelectedDraggableParent(store, s.el));
            // notify the app
            if (!!this.hooks.onStartDrag)
                this.hooks.onStartDrag(this.selection);
            // FIXME: the region marker should be outside the iframe
            this.positionMarker = this.stageDocument.createElement('div');
            this.positionMarker.classList.add('position-marker');
            this.positionMarker.style.backgroundColor = 'rgba(0, 0, 0, .5)';
            this.positionMarker.style.display = 'inline-block';
            this.positionMarker.style.border = '1px solid rgba(255, 255, 255, .5)';
            this.positionMarker.style.position = 'absolute';
            this.positionMarker.style.minWidth = '1px';
            this.positionMarker.style.minHeight = '1px';
            // update state
            this.selection = this.selection.map(selectable => {
                return Object.assign({}, selectable, { preventMetrics: true, translation: {
                        x: 0,
                        y: 0,
                    } });
            });
            // update store
            this.store.dispatch(selectableState.updateSelectables(this.selection));
        }
        /**
         * Called by the Stage class when mouse moves
         */
        update(mouseData) {
            super.update(mouseData);
            // remove the marker
            if (this.positionMarker.parentNode)
                this.positionMarker.parentNode.removeChild(this.positionMarker);
            if (!this.initialMouse) {
                this.initialMouse = {
                    x: mouseData.mouseX - mouseData.movementX,
                    y: mouseData.mouseY - mouseData.movementY,
                };
                this.initialScroll = Object.assign({}, this.store.getState().mouse.scrollData);
            }
            const currentScroll = Object.assign({}, this.store.getState().mouse.scrollData);
            const deltaScroll = {
                x: currentScroll.x - this.initialScroll.x,
                y: currentScroll.y - this.initialScroll.y,
            };
            // apply constraints (shift) and
            // compute the real movementX and movementY based on the position of the mouse instead of the position of the selection
            const { movementX, movementY } = (() => {
                const translation = this.selection[0].translation;
                const realMovementX = -translation.x + (mouseData.mouseX - this.initialMouse.x);
                const realMovementY = -translation.y + (mouseData.mouseY - this.initialMouse.y);
                if (mouseData.shiftKey && this.selection.length > 0) {
                    const { x, y } = {
                        x: mouseData.mouseX - this.initialMouse.x,
                        y: mouseData.mouseY - this.initialMouse.y,
                    };
                    const angle = Math.atan2(y, x);
                    if (Math.abs(Math.sin(angle)) < Math.abs(Math.cos(angle))) {
                        // stick to x axis
                        return {
                            movementX: realMovementX,
                            movementY: -translation.y,
                        };
                    }
                    else {
                        // stick to y axis
                        return {
                            movementX: -translation.x,
                            movementY: realMovementY,
                        };
                    }
                }
                return {
                    movementX: realMovementX + deltaScroll.x,
                    movementY: realMovementY + deltaScroll.y,
                };
            })();
            // apply constraints (sticky)
            const bb = domMetrics.getBoundingBox(this.selection);
            const hasPositionedElements = this.selection.some(s => s.metrics.position === 'static');
            const sticky = !this.store.getState().ui.enableSticky || hasPositionedElements ? Types_1.EMPTY_BOX()
                : this.store.getState().selectables
                    .filter(s => !s.selected && s.selectable && s.metrics.position !== 'static')
                    .reduce((prev, selectable) => {
                    if (Math.abs(selectable.metrics.clientRect.top - (bb.top + movementY)) < Constants_1.STICK_DISTANCE)
                        prev.top = selectable.metrics.clientRect.top - bb.top;
                    if (Math.abs(selectable.metrics.clientRect.left - (bb.left + movementX)) < Constants_1.STICK_DISTANCE)
                        prev.left = selectable.metrics.clientRect.left - bb.left;
                    if (Math.abs(selectable.metrics.clientRect.bottom - (bb.bottom + movementY)) < Constants_1.STICK_DISTANCE)
                        prev.bottom = selectable.metrics.clientRect.bottom - bb.bottom;
                    if (Math.abs(selectable.metrics.clientRect.right - (bb.right + movementX)) < Constants_1.STICK_DISTANCE)
                        prev.right = selectable.metrics.clientRect.right - bb.right;
                    if (Math.abs(selectable.metrics.clientRect.bottom - (bb.top + movementY)) < Constants_1.STICK_DISTANCE)
                        prev.top = selectable.metrics.clientRect.bottom - bb.top;
                    if (Math.abs(selectable.metrics.clientRect.right - (bb.left + movementX)) < Constants_1.STICK_DISTANCE)
                        prev.left = selectable.metrics.clientRect.right - bb.left;
                    if (Math.abs(selectable.metrics.clientRect.top - (bb.bottom + movementY)) < Constants_1.STICK_DISTANCE)
                        prev.bottom = selectable.metrics.clientRect.top - bb.bottom;
                    if (Math.abs(selectable.metrics.clientRect.left - (bb.right + movementX)) < Constants_1.STICK_DISTANCE)
                        prev.right = selectable.metrics.clientRect.left - bb.right;
                    return prev;
                }, Types_1.EMPTY_BOX());
            const stickyMovementX = (sticky.left === null ? (sticky.right == null ? movementX : sticky.right) : sticky.left);
            const stickyMovementY = (sticky.top === null ? (sticky.bottom == null ? movementY : sticky.bottom) : sticky.top);
            // update elements postition
            this.selection = this.selection
                .map(selectable => this.move(selectable, false, stickyMovementX, stickyMovementY));
            // update the destination of each element
            this.selection = this.selection
                .map(selectable => {
                let dropZones = domMetrics.findDropZonesUnderMouse(this.stageDocument, this.store, this.hooks, mouseData.mouseX, mouseData.mouseY)
                    .filter(dropZone => this.hooks.canDrop(selectable.el, dropZone));
                if (dropZones.length > 0) {
                    switch (selectable.metrics.position) {
                        case 'static':
                            let nearestPosition = this.findNearestPosition(dropZones, mouseData.mouseX, mouseData.mouseY);
                            return this.updateDestinationNonAbsolute(selectable, nearestPosition);
                        default:
                            let dropZoneUnderMouse = dropZones[0]; // the first one is supposed to be the top most one
                            return this.updateDestinationAbsolute(selectable, dropZoneUnderMouse);
                    }
                }
                else
                    return selectable;
            });
            // handle the children which move with the selection
            const children = this.store.getState().selectables
                .filter(s => domMetrics.hasASelectedDraggableParent(this.store, s.el))
                .map(selectable => this.move(selectable, true, movementX, movementY));
            // update store
            this.store.dispatch(selectableState.updateSelectables(this.selection.concat(children)));
            this.store.dispatch(UiState_1.setSticky({
                top: sticky.top !== null,
                left: sticky.left !== null,
                bottom: sticky.bottom !== null,
                right: sticky.right !== null,
            }));
            // update scroll
            const initialScroll = this.store.getState().mouse.scrollData;
            const scroll = domMetrics.getScrollToShow(this.stageDocument, {
                top: bb.top + movementY,
                left: bb.left + movementX,
                bottom: bb.bottom + movementY,
                right: bb.right + movementX,
                width: bb.width,
                height: bb.height,
            });
            if (scroll.x !== initialScroll.x || scroll.y !== initialScroll.y) {
                this.debounceScroll(scroll);
            }
            // notify the app
            if (this.hooks.onDrag)
                this.hooks.onDrag(this.selection, bb);
        }
        /**
         * Called by the Stage class when mouse button is released
         */
        release() {
            super.release();
            this.initialMouse = null;
            this.selection = this.selection.map((selectable) => {
                // move to a different container
                if (selectable.dropZone && selectable.dropZone.parent) {
                    if (selectable.dropZone.nextElementSibling) {
                        // if the target is not allready the sibling of the destination's sibling
                        // and if the destination's sibling is not the target itself
                        // then move to the desired position in the parent
                        if (selectable.dropZone.nextElementSibling !== selectable.el.nextElementSibling && selectable.dropZone.nextElementSibling !== selectable.el) {
                            try {
                                selectable.el.parentNode.removeChild(selectable.el);
                                selectable.dropZone.parent.insertBefore(selectable.el, selectable.dropZone.nextElementSibling);
                            }
                            catch (e) {
                                console.error(e);
                            }
                        }
                    }
                    else {
                        // if the destination parent is not already the target's parent
                        // or if the target is not the last child
                        // then append the target to the parent
                        if (selectable.dropZone.parent !== selectable.el.parentElement || selectable.el.nextElementSibling) {
                            selectable.el.parentNode.removeChild(selectable.el);
                            selectable.dropZone.parent.appendChild(selectable.el);
                        }
                    }
                }
                let metrics = selectable.metrics;
                if (selectable.metrics.position !== 'static') {
                    // check the actual position of the target
                    // and move it to match the provided absolute position
                    // store initial data
                    const initialTop = selectable.el.style.top;
                    const initialLeft = selectable.el.style.left;
                    const initialTransform = selectable.el.style.transform;
                    const initialPosition = selectable.el.style.position;
                    // move to the final position will take the new parent offset
                    selectable.el.style.top = selectable.metrics.computedStyleRect.top + 'px';
                    selectable.el.style.left = selectable.metrics.computedStyleRect.left + 'px';
                    selectable.el.style.transform = '';
                    selectable.el.style.position = '';
                    // check for the offset and update the metrics
                    const bb = domMetrics.getBoundingBoxDocument(selectable.el);
                    const computedStyleRect = {
                        top: selectable.metrics.computedStyleRect.top + (selectable.metrics.clientRect.top - bb.top),
                        left: selectable.metrics.computedStyleRect.left + (selectable.metrics.clientRect.left - bb.left),
                        right: 0,
                        bottom: 0,
                    };
                    // restore the initial data
                    selectable.el.style.top = initialTop;
                    selectable.el.style.left = initialLeft;
                    selectable.el.style.transform = initialTransform;
                    selectable.el.style.position = initialPosition;
                    // update bottom and right
                    computedStyleRect.right = computedStyleRect.left + selectable.metrics.computedStyleRect.width;
                    computedStyleRect.bottom = computedStyleRect.top + selectable.metrics.computedStyleRect.height;
                    // update the store
                    metrics = Object.assign({}, selectable.metrics, { computedStyleRect: Object.assign({}, selectable.metrics.computedStyleRect, computedStyleRect) });
                }
                // update the store with the corrected styles
                return Object.assign({}, selectable, { preventMetrics: false, translation: null, metrics });
            });
            // remove the position marker
            if (this.positionMarker.parentNode)
                this.positionMarker.parentNode.removeChild(this.positionMarker);
            // update store
            this.store.dispatch(selectableState.updateSelectables(this.selection), () => {
                // change UI state while selectables metrics are simply updated
                this.store.dispatch(UiState_1.setRefreshing(true));
                // update to real metrics after drop
                const state = this.store.getState().selectables.map(selectable => {
                    return Object.assign({}, selectable, { metrics: domMetrics.getMetrics(selectable.el) });
                });
                this.store.dispatch(selectableState.updateSelectables(state));
                this.store.dispatch(UiState_1.setRefreshing(false));
                // notify the app
                if (this.hooks.onDrop)
                    this.hooks.onDrop(this.selection);
            });
        }
        /**
         * move an element and update its data in selection
         * when elements are in a container which is moved, the clientRect changes but not the computedStyleRect
         */
        move(selectable, onlyClientRect, movementX, movementY) {
            return Object.assign({}, selectable, { translation: selectable.translation ? {
                    x: selectable.translation.x + movementX,
                    y: selectable.translation.y + movementY,
                } : null, metrics: Object.assign({}, selectable.metrics, { clientRect: Object.assign({}, selectable.metrics.clientRect, { top: selectable.metrics.clientRect.top + movementY, left: selectable.metrics.clientRect.left + movementX, bottom: selectable.metrics.clientRect.bottom + movementY, right: selectable.metrics.clientRect.right + movementX }), computedStyleRect: onlyClientRect ? selectable.metrics.computedStyleRect : Object.assign({}, selectable.metrics.computedStyleRect, { top: selectable.metrics.computedStyleRect.top + movementY, left: selectable.metrics.computedStyleRect.left + movementX, bottom: selectable.metrics.computedStyleRect.bottom + movementY, right: selectable.metrics.computedStyleRect.right + movementX }) }) });
        }
        /**
         * update the destination of the absolutely positioned elements
         */
        updateDestinationAbsolute(selectable, dropZoneUnderMouse) {
            if (dropZoneUnderMouse === null) {
                // FIXME: should fallback on the body?
                console.info('no dropZone under the mouse found, how is it poussible!');
                return selectable;
            }
            else {
                return Object.assign({}, selectable, { dropZone: Object.assign({}, selectable.dropZone, { parent: dropZoneUnderMouse }) });
            }
        }
        /**
         * update the destination of the NOT absolutely positioned elements
         * and display a marker in the flow
         */
        updateDestinationNonAbsolute(selectable, nearestPosition) {
            if (nearestPosition.distance === null) {
                // FIXME: should fallback on the body?
                console.info('no nearest position found, how is it poussible?');
                return selectable;
            }
            else {
                this.markPosition(nearestPosition);
                return Object.assign({}, selectable, { dropZone: nearestPosition });
            }
        }
        /**
         * display the position marker atthe given positionin the dom
         */
        markPosition(position) {
            if (position.nextElementSibling) {
                position.nextElementSibling.parentNode.insertBefore(this.positionMarker, position.nextElementSibling);
            }
            else if (position.parent) {
                position.parent.appendChild(this.positionMarker);
            }
            let bbMarker = domMetrics.getBoundingBoxDocument(this.positionMarker);
            let bbTargetPrev = this.positionMarker.previousElementSibling ? domMetrics.getBoundingBoxDocument(this.positionMarker.previousElementSibling) : null;
            let bbTargetNext = this.positionMarker.nextElementSibling ? domMetrics.getBoundingBoxDocument(this.positionMarker.nextElementSibling) : null;
            if ((!bbTargetPrev || bbMarker.top >= bbTargetPrev.bottom)
                && (!bbTargetNext || bbMarker.bottom <= bbTargetNext.top)) {
                // horizontal
                this.positionMarker.style.width = bbTargetPrev ? bbTargetPrev.width + 'px' : bbTargetNext ? bbTargetNext.width + 'px' : '100%';
                this.positionMarker.style.height = '0';
            }
            else {
                // vertical
                this.positionMarker.style.height = bbTargetPrev ? bbTargetPrev.height + 'px' : bbTargetNext ? bbTargetNext.height + 'px' : '100%';
                this.positionMarker.style.width = '0';
            }
        }
        /**
         * place an empty div (phantom) at each possible place in the dom
         * find the place where it is the nearest from the mouse
         * x and y are coordinates relative to the viewport
         */
        findNearestPosition(dropZones, x, y) {
            // create an empty div to measure distance to the mouse
            let phantom = this.stageDocument.createElement('div');
            phantom.classList.add('phantom');
            // init the result to 'not found'
            let nearestPosition = {
                nextElementSibling: null,
                distance: null,
                parent: null,
            };
            // browse all drop zone and find the nearest point
            dropZones.forEach(dropZone => {
                for (let idx = 0; idx < dropZone.childNodes.length; idx++) {
                    let sibling = dropZone.childNodes[idx];
                    dropZone.insertBefore(phantom, sibling);
                    let distance = this.getDistance(phantom, x, y);
                    if (nearestPosition.distance === null || nearestPosition.distance > distance) {
                        nearestPosition.nextElementSibling = sibling;
                        nearestPosition.parent = dropZone;
                        nearestPosition.distance = distance;
                    }
                    dropZone.removeChild(phantom);
                }
                // test the last position
                dropZone.appendChild(phantom);
                let distance = this.getDistance(phantom, x, y);
                if (nearestPosition.distance === null || nearestPosition.distance > distance) {
                    nearestPosition.nextElementSibling = null;
                    nearestPosition.parent = dropZone;
                    nearestPosition.distance = distance;
                }
                dropZone.removeChild(phantom);
            });
            // the next element can not be our position marker (it happens)
            if (nearestPosition.nextElementSibling === this.positionMarker)
                nearestPosition.nextElementSibling = this.positionMarker.nextElementSibling;
            return nearestPosition;
        }
        /**
         * get the distance from el's center to (x, y)
         * x and y are relative to the viewport
         */
        getDistance(el, x, y) {
            const bb = el.getBoundingClientRect();
            const center = {
                x: bb.left + (bb.width / 2),
                y: bb.top + (bb.height / 2),
            };
            return Math.sqrt(((center.x - x) * (center.x - x)) + ((center.y - y) * (center.y - y)));
        }
    }
    exports.MoveHandler = MoveHandler;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZUhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdHMvaGFuZGxlcnMvTW92ZUhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBUUEsTUFBYSxXQUFZLFNBQVEsbUNBQWdCO1FBSy9DLFlBQVksYUFBMkIsRUFBRSxlQUE2QixFQUFFLEtBQWlCLEVBQUUsS0FBWTtZQUNyRyxLQUFLLENBQUMsYUFBYSxFQUFFLGVBQWUsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFcEQsK0JBQStCO1lBQy9CLHlEQUF5RDtZQUN6RCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTO2lCQUM5QixNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO2lCQUN4QixNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQywyQkFBMkIsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFbkUsaUJBQWlCO1lBQ2pCLElBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVztnQkFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFcEUsd0RBQXdEO1lBQ3hELElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDckQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLG1CQUFtQixDQUFDO1lBQ2hFLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUM7WUFDbkQsSUFBSSxDQUFDLGNBQWMs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