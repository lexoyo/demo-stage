define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * get the bounding box of an element relative to the document, not the viewport (unlike el.getBoundingClientRect())
     */
    function getBoundingBoxDocument(el) {
        const doc = getDocument(el);
        const scroll = getScroll(doc);
        const box = el.getBoundingClientRect();
        return {
            top: box.top + scroll.y,
            left: box.left + scroll.x,
            bottom: box.bottom + scroll.y,
            right: box.right + scroll.x,
            width: box.width,
            height: box.height,
        };
    }
    exports.getBoundingBoxDocument = getBoundingBoxDocument;
    /**
     * get the bounding box of several elements
     */
    function getBoundingBox(selectables) {
        const box = {
            top: Infinity,
            left: Infinity,
            bottom: -Infinity,
            right: -Infinity,
            width: 0,
            height: 0,
        };
        selectables.forEach(s => {
            box.top = Math.min(box.top, s.metrics.clientRect.top);
            box.left = Math.min(box.left, s.metrics.clientRect.left);
            box.bottom = Math.max(box.bottom, s.metrics.clientRect.bottom);
            box.right = Math.max(box.right, s.metrics.clientRect.right);
        });
        return Object.assign({}, box, { width: box.right - box.left, height: box.bottom - box.top });
    }
    exports.getBoundingBox = getBoundingBox;
    exports.SCROLL_ZONE_SIZE = 0;
    /**
     * get the ideal scroll in order to have boundingBox visible
     * boundingBox is expected to be relative to the document, not the viewport
     */
    function getScrollToShow(doc, boundingBox) {
        const scroll = getScroll(doc);
        const win = getWindow(doc);
        // vertical
        // if(scroll.y > boundingBox.top - SCROLL_ZONE_SIZE) {
        if (scroll.y > boundingBox.top) {
            scroll.y = boundingBox.top - exports.SCROLL_ZONE_SIZE;
        }
        // else if(scroll.y < boundingBox.bottom + SCROLL_ZONE_SIZE - win.innerHeight) {
        else if (scroll.y < boundingBox.bottom - win.innerHeight) {
            scroll.y = boundingBox.bottom + exports.SCROLL_ZONE_SIZE - win.innerHeight;
        }
        // horizontal
        // if(scroll.x > boundingBox.left - SCROLL_ZONE_SIZE) {
        if (scroll.x > boundingBox.left) {
            scroll.x = boundingBox.left - exports.SCROLL_ZONE_SIZE;
        }
        // else if(scroll.x < boundingBox.right + SCROLL_ZONE_SIZE - win.innerWidth) {
        else if (scroll.x < boundingBox.right - win.innerWidth) {
            scroll.x = boundingBox.right + exports.SCROLL_ZONE_SIZE - win.innerWidth;
        }
        return {
            x: Math.max(0, scroll.x),
            y: Math.max(0, scroll.y),
        };
    }
    exports.getScrollToShow = getScrollToShow;
    /**
     * retrieve the document's window
     * @param {HTMLDocument} doc
     * @return {Window}
     */
    function getWindow(doc) {
        return doc['parentWindow'] || doc.defaultView;
    }
    exports.getWindow = getWindow;
    /**
     * retrieve the document which holds this element
     * @param {HTMLElement} el
     * @return {HTMLDocument}
     */
    function getDocument(el) {
        return el.ownerDocument;
    }
    exports.getDocument = getDocument;
    /**
     * @param {HTMLElement} el
     */
    function setMetrics(el, metrics, useMinHeight, useClientRect = false) {
        const doc = getDocument(el);
        const win = getWindow(doc);
        const style = win.getComputedStyle(el);
        const position = style.getPropertyValue('position');
        // handle position
        if (position !== metrics.position) {
            el.style.position = metrics.position;
        }
        // handle DOM metrics
        function updateStyle(objName, propName, styleName) {
            const styleValue = metrics[objName][propName];
            if ((parseInt(style.getPropertyValue(objName + '-' + propName)) || 0) !== styleValue) {
                el.style[styleName] = styleValue + 'px';
            }
        }
        if (useClientRect) {
            const computedStyleRect = fromClientToComputed(metrics);
            if (metrics.position !== 'static') {
                el.style.top = computedStyleRect.top + 'px';
                el.style.left = computedStyleRect.left + 'px';
            }
            el.style.width = computedStyleRect.width + 'px';
            el.style[useMinHeight ? 'minHeight' : 'height'] = computedStyleRect.height + 'px';
        }
        else {
            if (metrics.position !== 'static') {
                updateStyle('computedStyleRect', 'top', 'top');
                updateStyle('computedStyleRect', 'left', 'left');
            }
            updateStyle('computedStyleRect', 'width', 'width');
            updateStyle('computedStyleRect', 'height', useMinHeight ? 'minHeight' : 'height');
            // TODO: expose a hook to decide between height/bottom and width/right
            // just like minHeight and height
            // updateStyle('computedStyleRect', 'bottom', 'bottom');
            // updateStyle('computedStyleRect', 'right', 'right');
        }
        updateStyle('margin', 'top', 'marginTop');
        updateStyle('margin', 'left', 'marginLeft');
        updateStyle('margin', 'bottom', 'marginBottom');
        updateStyle('margin', 'right', 'marginRight');
        updateStyle('padding', 'top', 'paddingTop');
        updateStyle('padding', 'left', 'paddingLeft');
        updateStyle('padding', 'bottom', 'paddingBottom');
        updateStyle('padding', 'right', 'paddingRight');
        updateStyle('border', 'top', 'borderTopWidth');
        updateStyle('border', 'left', 'borderLeftWidth');
        updateStyle('border', 'bottom', 'borderBottomWidth');
        updateStyle('border', 'right', 'borderRightWidth');
    }
    exports.setMetrics = setMetrics;
    /**
     * @param {HTMLElement} el
     * @return {ElementMetrics} the element metrics
     */
    function getMetrics(el) {
        const doc = getDocument(el);
        const win = getWindow(doc);
        const style = win.getComputedStyle(el);
        const clientRect = getBoundingBoxDocument(el);
        return {
            position: style.getPropertyValue('position'),
            proportions: clientRect.height / (clientRect.width || .000000000001),
            computedStyleRect: {
                width: parseInt(style.getPropertyValue('width')) || 0,
                height: parseInt(style.getPropertyValue('height')) || 0,
                left: parseInt(style.getPropertyValue('left')) || 0,
                top: parseInt(style.getPropertyValue('top')) || 0,
                bottom: parseInt(style.getPropertyValue('bottom')) || 0,
                right: parseInt(style.getPropertyValue('right')) || 0,
            },
            border: {
                left: parseInt(style.getPropertyValue('border-left-width')) || 0,
                top: parseInt(style.getPropertyValue('border-top-width')) || 0,
                right: parseInt(style.getPropertyValue('border-right-width')) || 0,
                bottom: parseInt(style.getPropertyValue('border-bottom-width')) || 0,
            },
            padding: {
                left: parseInt(style.getPropertyValue('padding-left')) || 0,
                top: parseInt(style.getPropertyValue('padding-top')) || 0,
                right: parseInt(style.getPropertyValue('padding-right')) || 0,
                bottom: parseInt(style.getPropertyValue('padding-bottom')) || 0,
            },
            margin: {
                left: parseInt(style.getPropertyValue('margin-left')) || 0,
                top: parseInt(style.getPropertyValue('margin-top')) || 0,
                right: parseInt(style.getPropertyValue('margin-right')) || 0,
                bottom: parseInt(style.getPropertyValue('margin-bottom')) || 0,
            },
            clientRect: {
                top: clientRect.top,
                left: clientRect.left,
                bottom: clientRect.bottom,
                right: clientRect.right,
                width: clientRect.width,
                height: clientRect.height,
            },
        };
    }
    exports.getMetrics = getMetrics;
    /**
     * @param {HTMLDocument} doc
     * @return {ScrollData} the scroll state for the document
     */
    function getScroll(doc) {
        const win = getWindow(doc);
        return {
            x: win.scrollX,
            y: win.scrollY,
        };
    }
    exports.getScroll = getScroll;
    function getScrollBarSize() {
        // Create the measurement node
        var scrollDiv = document.createElement("div");
        scrollDiv.style.width = '100px';
        scrollDiv.style.height = '100px';
        scrollDiv.style.overflow = 'scroll';
        scrollDiv.style.position = 'absolute';
        scrollDiv.style.top = '-9999px';
        document.body.appendChild(scrollDiv);
        // Get the scrollbar width
        var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
        // Delete the DIV
        document.body.removeChild(scrollDiv);
        return scrollbarWidth;
    }
    exports.getScrollBarSize = getScrollBarSize;
    /**
     * @param {HTMLDocument} doc
     * @param {ScrollData} scroll, the scroll state for the document
     */
    function setScroll(doc, scroll) {
        const win = getWindow(doc);
        win.scroll(scroll.x, scroll.y);
    }
    exports.setScroll = setScroll;
    const BORDER_SIZE = 10;
    exports.CURSOR_DEFAULT = 'default';
    exports.CURSOR_SELECT = 'pointer';
    exports.CURSOR_MOVE = 'move';
    exports.CURSOR_NW = 'nw-resize';
    exports.CURSOR_NE = 'ne-resize';
    exports.CURSOR_SW = 'sw-resize';
    exports.CURSOR_SE = 'se-resize';
    exports.CURSOR_W = 'w-resize';
    exports.CURSOR_E = 'e-resize';
    exports.CURSOR_N = 'n-resize';
    exports.CURSOR_S = 's-resize';
    // check if the mouse is on the side of the selectable
    // this happens only when the mouse is over the selectable
    function getDirection(clientX, clientY, scrollData, selectable) {
        const bb = selectable.metrics.clientRect;
        const distFromBorder = {
            left: clientX + scrollData.x - bb.left,
            right: bb.width + bb.left - (clientX + scrollData.x),
            top: clientY + scrollData.y - bb.top,
            bottom: bb.height + bb.top - (clientY + scrollData.y),
        };
        // get resize direction
        const direction = { x: '', y: '' };
        if (distFromBorder.left < BORDER_SIZE)
            direction.x = 'left';
        else if (distFromBorder.right < BORDER_SIZE)
            direction.x = 'right';
        if (distFromBorder.top < BORDER_SIZE)
            direction.y = 'top';
        else if (distFromBorder.bottom < BORDER_SIZE)
            direction.y = 'bottom';
        return direction;
    }
    exports.getDirection = getDirection;
    function getResizeCursorClass(direction) {
        if (direction.x === 'left' && direction.y === 'top')
            return exports.CURSOR_NW;
        else if (direction.x === 'right' && direction.y === 'top')
            return exports.CURSOR_NE;
        else if (direction.x === 'left' && direction.y === 'bottom')
            return exports.CURSOR_SW;
        else if (direction.x === 'right' && direction.y === 'bottom')
            return exports.CURSOR_SE;
        else if (direction.x === 'left' && direction.y === '')
            return exports.CURSOR_W;
        else if (direction.x === 'right' && direction.y === '')
            return exports.CURSOR_E;
        else if (direction.x === '' && direction.y === 'top')
            return exports.CURSOR_N;
        else if (direction.x === '' && direction.y === 'bottom')
            return exports.CURSOR_S;
        throw new Error('direction not found');
    }
    exports.getResizeCursorClass = getResizeCursorClass;
    function isResizeable(resizeable, direction) {
        if (typeof resizeable === 'object') {
            return (direction.x !== '' || direction.y !== '') && [
                { x: 'left', y: 'top' },
                { x: 'right', y: 'top' },
                { x: 'left', y: 'bottom' },
                { x: 'right', y: 'bottom' },
            ].reduce((prev, dir) => {
                const res = prev || (((resizeable[dir.x] && direction.x === dir.x) || direction.x === '') &&
                    ((resizeable[dir.y] && direction.y === dir.y) || direction.y === ''));
                return res;
            }, false);
        }
        else {
            return direction.x !== '' || direction.y !== '';
        }
    }
    exports.isResizeable = isResizeable;
    function getCursorData(clientX, clientY, scrollData, selectable) {
        if (selectable) {
            const direction = getDirection(clientX, clientY, scrollData, selectable);
            if (isResizeable(selectable.resizeable, direction)) {
                return {
                    x: direction.x,
                    y: direction.y,
                    cursorType: getResizeCursorClass(direction),
                };
            }
            else if (selectable.draggable) {
                return {
                    x: '',
                    y: '',
                    cursorType: exports.CURSOR_MOVE,
                };
            }
            else if (selectable.selected) {
                return {
                    x: '',
                    y: '',
                    cursorType: exports.CURSOR_SELECT,
                };
            }
            else {
                return {
                    x: '',
                    y: '',
                    cursorType: exports.CURSOR_DEFAULT,
                };
            }
        }
        else {
            return {
                x: '',
                y: '',
                cursorType: exports.CURSOR_DEFAULT,
            };
        }
    }
    exports.getCursorData = getCursorData;
    /**
     * retrive the state for this element
     */
    function getSelectableState(store, el) {
        return store.getState().selectables.find(selectable => selectable.el === el);
    }
    exports.getSelectableState = getSelectableState;
    /**
     * helper to get the states of the selected elements
     */
    function getSelection(store) {
        return store.getState().selectables.filter(selectable => selectable.selected);
    }
    exports.getSelection = getSelection;
    /**
     * returns the state of the first container which is selectable
     * or null if the element and none of its parents are selectable
     */
    function getSelectable(store, element) {
        let el = element;
        let data;
        while (!!el && !(data = getSelectableState(store, el))) {
            el = el.parentElement;
        }
        return data;
    }
    exports.getSelectable = getSelectable;
    /**
     * check if an element has a parent which is selected and draggable
     * @param {HTMLElement} selectable
     */
    function hasASelectedDraggableParent(store, el) {
        const selectableParent = getSelectable(store, el.parentElement);
        if (selectableParent) {
            if (selectableParent.selected && selectableParent.draggable)
                return true;
            else
                return hasASelectedDraggableParent(store, selectableParent.el);
        }
        else {
            return false;
        }
    }
    exports.hasASelectedDraggableParent = hasASelectedDraggableParent;
    /**
     *
     * @param {ElementMetrics} metrics
     * @return {string} get the computedStyleRect that matches metrics.clientRect
     */
    function fromClientToComputed(metrics) {
        return {
            top: Math.round(metrics.clientRect.top + metrics.margin.top),
            left: Math.round(metrics.clientRect.left + metrics.margin.left),
            right: Math.round(metrics.clientRect.right + metrics.margin.left + metrics.padding.left + metrics.padding.right + metrics.border.left + metrics.border.right - (metrics.border.left + metrics.border.right)),
            bottom: Math.round(metrics.clientRect.bottom + metrics.margin.top + metrics.padding.top + metrics.padding.bottom + metrics.border.top + metrics.border.bottom - (metrics.border.top + metrics.border.bottom)),
            width: Math.round(metrics.clientRect.width + metrics.padding.left + metrics.padding.right + metrics.border.left + metrics.border.right - 2 * (metrics.border.left + metrics.border.right)),
            height: Math.round(metrics.clientRect.height + metrics.border.top + metrics.border.bottom + metrics.padding.top + metrics.padding.bottom - 2 * (metrics.border.top + metrics.border.bottom)),
        };
    }
    exports.fromClientToComputed = fromClientToComputed;
    /**
     * find the dropZone elements which are under the mouse
     * the first one in the list is the top most one
     * x and y are relative to the viewport, not the document
     */
    function findDropZonesUnderMouse(doc, store, hooks, x, y) {
        const win = getWindow(doc);
        if (x > win.innerWidth || y > win.innerHeight || x < 0 || y < 0) {
            // FIXME: the drop zone will be the previous one, how to get the drop zone outside the viewport?
            console.info(`Coords out of viewport => the drop zone will not be updated. I can not get the drop zone at coordinates (${x}, ${y}) while the viewport is (${win.innerWidth}, ${win.innerHeight})`);
        }
        const selectables = store.getState().selectables;
        const selection = selectables.filter(s => s.selected);
        // get a list of all dropZone zone under the point (x, y)
        return doc.elementsFromPoint(x, y)
            .filter((el) => {
            const selectable = selectables.find(s => s.el === el);
            return selectable
                && selectable.isDropZone
                && !selection.find(s => s.el === el);
        });
    }
    exports.findDropZonesUnderMouse = findDropZonesUnderMouse;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRG9tTWV0cmljcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cy91dGlscy9Eb21NZXRyaWNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQUdBOztPQUVHO0lBQ0gsU0FBZ0Isc0JBQXNCLENBQUMsRUFBZTtRQUNwRCxNQUFNLEdBQUcsR0FBRyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDNUIsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzlCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQ3ZDLE9BQU87WUFDTCxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQztZQUN2QixJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsQ0FBQztZQUN6QixNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQztZQUM3QixLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQztZQUMzQixLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUs7WUFDaEIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNO1NBQ25CLENBQUE7SUFDSCxDQUFDO0lBWkQsd0RBWUM7SUFFRDs7T0FFRztJQUNILFNBQWdCLGNBQWMsQ0FBQyxXQUF5QztRQUN0RSxNQUFNLEdBQUcsR0FBZTtZQUN0QixHQUFHLEVBQUUsUUFBUTtZQUNiLElBQUksRUFBRSxRQUFRO1lBQ2QsTUFBTSxFQUFFLENBQUMsUUFBUTtZQUNqQixLQUFLLEVBQUUsQ0FBQyxRQUFRO1lBQ2hCLEtBQUssRUFBRSxDQUFDO1lBQ1IsTUFBTSxFQUFFLENBQUM7U0FDVixDQUFBO1FBQ0QsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUN0QixHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENB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LEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUMvRCxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDNU0sTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzdNLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDeEwsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUMzTCxDQUFDO0lBQ0osQ0FBQztJQVRELG9EQVNDO0lBR0Q7Ozs7T0FJRztJQUNILFNBQWdCLHVCQUF1QixDQUFDLEdBQWlCLEVBQUUsS0FBaUIsRUFBRSxLQUFrQixFQUFFLENBQVMsRUFBRSxDQUFTO1FBQ3BILE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMzQixJQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsVUFBVSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsV0FBVyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUM5RCxnR0FBZ0c7WUFDaEcsT0FBTyxDQUFDLElBQUksQ0FBQyw0R0FBNEcsQ0FBQyxLQUFLLENBQUMsNEJBQTRCLEdBQUcsQ0FBQyxVQUFVLEtBQUssR0FBRyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7U0FDcE07UUFFRCxNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsV0FBVyxDQUFDO1FBQ2pELE1BQU0sU0FBUyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFdEQseURBQXlEO1FBQ3pELE9BQU8sR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDakMsTUFBTSxDQUFDLENBQUMsRUFBZSxFQUFFLEVBQUU7WUFDMUIsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDdEQsT0FBTyxVQUFVO21CQUNaLFVBQVUsQ0FBQyxVQUFVO21CQUNyQixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3pDLENBQUMsQ0FBdUIsQ0FBQztJQUMzQixDQUFDO0lBbEJELDBEQWtCQyJ9