define(["require", "exports", "../utils/DomMetrics"], function (require, exports, DomMetrics) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @class This class listens to the store
     *   and apply the state changes to the DOM elements
     */
    class SelectablesObserver {
        constructor(stageDocument, overlayDocument, store, hooks) {
            this.stageDocument = stageDocument;
            this.overlayDocument = overlayDocument;
            this.store = store;
            this.hooks = hooks;
            this.isRefreshing = false;
            this.unsubscribeAll = [];
            this.unsubscribeAll.push(store.subscribe((state, prevState) => this.onStateChanged(state, prevState), (state) => state.selectables), store.subscribe((state, prevState) => this.onUiChanged(state), (state) => state.ui));
        }
        onUiChanged(state) {
            this.isRefreshing = state.refreshing;
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
            // select selectables which have changed
            const filterBy = (propName, selectable) => {
                const oldSelectable = prevState.find(old => selectable.el === old.el);
                // FIXME: use JSON.stringify to compare?
                return !oldSelectable || JSON.stringify(oldSelectable[propName]) !== JSON.stringify(selectable[propName]);
                // return !oldSelectable || oldSelectable[propName] !== selectable[propName];
            };
            const removed = prevState.filter(s => !state.find(s2 => s2.el === s.el));
            const metrics = state.filter(selectable => filterBy('metrics', selectable));
            if (removed.length + metrics.length > 0)
                this.onMetrics(metrics, removed);
            const selection = state.filter(selectable => filterBy('selected', selectable));
            if (selection.length > 0)
                this.onSelection(selection);
            // const draggable = state.filter(selectable => filterBy('draggable', selectable));
            // if(draggable.length > 0) this.onDraggable(draggable);
            // const resizeable = state.filter(selectable => filterBy('resizeable', selectable));
            // if(resizeable.length > 0) this.onResizeable(resizeable);
            // const isDropZone = state.filter(selectable => filterBy('isDropZone', selectable));
            // if(isDropZone.length > 0) this.onDropZone(isDropZone);
            const translation = state.filter(selectable => filterBy('translation', selectable));
            if (translation.length > 0)
                this.onTranslation(translation);
        }
        // update elements position and size
        onMetrics(selectables, removed) {
            if (!this.isRefreshing) {
                selectables.forEach(selectable => {
                    // while being dragged, elements are out of the flow, do not apply styles
                    if (!selectable.preventMetrics) {
                        DomMetrics.setMetrics(selectable.el, selectable.metrics, selectable.useMinHeight);
                    }
                });
                // notify the app
                if (this.hooks.onChange)
                    this.hooks.onChange(selectables.concat(removed));
            }
        }
        onSelection(selectables) {
            // notify the app
            if (this.hooks.onSelect)
                this.hooks.onSelect(selectables);
        }
        // onDraggable(selectables: Array<SelectableState>) {}
        // onResizeable(selectables: Array<SelectableState>) {}
        // onDropZone(selectables: Array<SelectableState>) {}
        onTranslation(selectables) {
            selectables.forEach(selectable => {
                if (!!selectable.translation) {
                    selectable.el.style.transform = `translate(${selectable.translation.x}px, ${selectable.translation.y}px)`;
                    selectable.el.style.zIndex = '99999999';
                    if (selectable.metrics.position === 'static') {
                        selectable.el.style.position = 'relative';
                    }
                }
                else {
                    selectable.el.style.transform = '';
                    selectable.el.style.zIndex = '';
                    selectable.el.style.position = '';
                }
            });
        }
    }
    exports.SelectablesObserver = SelectablesObserver;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VsZWN0YWJsZXNPYnNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cy9vYnNlcnZlcnMvU2VsZWN0YWJsZXNPYnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFNQTs7O09BR0c7SUFDSCxNQUFhLG1CQUFtQjtRQUM5QixZQUFvQixhQUEyQixFQUFVLGVBQTZCLEVBQVUsS0FBaUIsRUFBVSxLQUFrQjtZQUF6SCxrQkFBYSxHQUFiLGFBQWEsQ0FBYztZQUFVLG9CQUFlLEdBQWYsZUFBZSxDQUFjO1lBQVUsVUFBSyxHQUFMLEtBQUssQ0FBWTtZQUFVLFVBQUssR0FBTCxLQUFLLENBQWE7WUFhckksaUJBQVksR0FBWSxLQUFLLENBQUM7WUFLOUIsbUJBQWMsR0FBc0IsRUFBRSxDQUFDO1lBakI3QyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FDdEIsS0FBSyxDQUFDLFNBQVMsQ0FDYixDQUFDLEtBQTZCLEVBQUUsU0FBaUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLEVBQzNHLENBQUMsS0FBaUIsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FDekMsRUFDRCxLQUFLLENBQUMsU0FBUyxDQUNiLENBQUMsS0FBb0IsRUFBRSxTQUF3QixFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUMzRSxDQUFDLEtBQWlCLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQ2hDLENBQ0YsQ0FBQztRQUNKLENBQUM7UUFHRCxXQUFXLENBQUMsS0FBb0I7WUFDOUIsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDO1FBQ3ZDLENBQUM7UUFHRCxPQUFPO1lBQ0wsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxD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