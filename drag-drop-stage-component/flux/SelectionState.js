define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const SET = 'SELECTION_SET';
    const RESET = 'SELECTION_RESET';
    const TOGGLE = 'SELECTION_TOGGLE';
    const ADD = 'SELECTION_ADD';
    const REMOVE = 'SELECTION_REMOVE';
    exports.set = (selectables) => ({
        type: SET,
        selectables,
    });
    exports.reset = () => ({
        type: RESET,
    });
    exports.toggle = (selectable) => ({
        type: TOGGLE,
        selectable,
    });
    exports.add = (selectable) => ({
        type: ADD,
        selectable,
    });
    exports.remove = (selectable) => ({
        type: REMOVE,
        selectable,
    });
    /**
     * reducer
     */
    exports.selection = (state = [], action) => {
        switch (action.type) {
            case TOGGLE:
                return state.map(selectable => selectable === action.selectable ? Object.assign({}, selectable, { selected: !selectable.selected }) : selectable);
            case REMOVE:
                return state.map(selectable => selectable === action.selectable ? Object.assign({}, selectable, { selected: false }) : selectable);
            case RESET:
                return state.map(selectable => (Object.assign({}, selectable, { selected: false })));
            case ADD:
                return state.map(selectable => selectable === action.selectable ? Object.assign({}, selectable, { selected: true }) : selectable);
            case SET:
                return state.map(selectable => action.selectables.includes(selectable) ? Object.assign({}, selectable, { selected: true }) : Object.assign({}, selectable, { selected: false }));
            default:
                return state;
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VsZWN0aW9uU3RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdHMvZmx1eC9TZWxlY3Rpb25TdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFFQSxNQUFNLEdBQUcsR0FBRyxlQUFlLENBQUM7SUFDNUIsTUFBTSxLQUFLLEdBQUcsaUJBQWlCLENBQUM7SUFDaEMsTUFBTSxNQUFNLEdBQUcsa0JBQWtCLENBQUM7SUFDbEMsTUFBTSxHQUFHLEdBQUcsZUFBZSxDQUFDO0lBQzVCLE1BQU0sTUFBTSxHQUFHLGtCQUFrQixDQUFDO0lBRXJCLFFBQUEsR0FBRyxHQUFHLENBQUMsV0FBbUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMzRCxJQUFJLEVBQUUsR0FBRztRQUNULFdBQVc7S0FDWixDQUFDLENBQUE7SUFDVyxRQUFBLEtBQUssR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQzFCLElBQUksRUFBRSxLQUFLO0tBQ1osQ0FBQyxDQUFBO0lBQ1csUUFBQSxNQUFNLEdBQUcsQ0FBQyxVQUEyQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3RELElBQUksRUFBRSxNQUFNO1FBQ1osVUFBVTtLQUNYLENBQUMsQ0FBQTtJQUNXLFFBQUEsR0FBRyxHQUFHLENBQUMsVUFBMkIsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNuRCxJQUFJLEVBQUUsR0FBRztRQUNULFVBQVU7S0FDWCxDQUFDLENBQUE7SUFDVyxRQUFBLE1BQU0sR0FBRyxDQUFDLFVBQTJCLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDdEQsSUFBSSxFQUFFLE1BQU07UUFDWixVQUFVO0tBQ1gsQ0FBQyxDQUFBO0lBRUY7O09BRUc7SUFDVSxRQUFBLFNBQVMsR0FBRyxDQUFDLFFBQThCLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNwRSxRQUFRLE1BQU0sQ0FBQyxJQUFJLEVBQUU7WUFDbkIsS0FBSyxNQUFNO2dCQUNULE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFVBQVUsS0FBSyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsbUJBQzVELFVBQVUsSUFDYixRQUFRLEVBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxJQUM5QixDQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDbEIsS0FBSyxNQUFNO2dCQUNULE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFVBQVUsS0FBSyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsbUJBQzVELFVBQVUsSUFDYixRQUFRLEVBQUUsS0FBSyxJQUNmLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNsQixLQUFLLEtBQUs7Z0JBQ1IsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsbUJBQzFCLFVBQVUsSUFDYixRQUFRLEVBQUUsS0FBSyxJQUNmLENBQUMsQ0FBQztZQUNOLEtBQUssR0FBRztnQkFDTixPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEtBQUssTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLG1CQUM1RCxVQUFVLElBQ2IsUUFBUSxFQUFFLElBQUksSUFDZCxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDbEIsS0FBSyxHQUFHO2dCQUNOLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsbUJBQ25FLFVBQVUsSUFDYixRQUFRLEVBQUUsSUFBSSxJQUNkLENBQUMsbUJBQ0UsVUFBVSxJQUNiLFFBQVEsRUFBRSxLQUFLLEdBQ2hCLENBQUMsQ0FBQztZQUNMO2dCQUNFLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0gsQ0FBQyxDQUFBIn0=