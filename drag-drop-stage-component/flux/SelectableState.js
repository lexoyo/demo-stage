define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const UPDATE = 'SELECTABLE_UPDATE';
    const RESET = 'SELECTABLE_RESET';
    const CREATE = 'SELECTABLE_CREATE';
    const DELETE = 'SELECTABLE_DELETE';
    exports.updateSelectables = (selectables, preventDispatch = false) => ({
        type: UPDATE,
        selectables,
        preventDispatch,
    });
    exports.resetSelectables = () => ({
        type: RESET,
    });
    exports.createSelectable = (selectable) => ({
        type: CREATE,
        selectable,
    });
    exports.deleteSelectable = (selectable) => ({
        type: DELETE,
        selectable,
    });
    exports.selectables = (state = [], action) => {
        switch (action.type) {
            case CREATE:
                return [
                    ...state,
                    action.selectable,
                ];
            case RESET:
                return [];
            case DELETE:
                return state.filter((selectable) => selectable.el !== action.selectable.el);
            case UPDATE:
                return state.map((selectable) => action.selectables.find(s => s.el === selectable.el) || selectable);
            default:
                return state;
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VsZWN0YWJsZVN0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3RzL2ZsdXgvU2VsZWN0YWJsZVN0YXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQUVBLE1BQU0sTUFBTSxHQUFHLG1CQUFtQixDQUFDO0lBQ25DLE1BQU0sS0FBSyxHQUFHLGtCQUFrQixDQUFDO0lBQ2pDLE1BQU0sTUFBTSxHQUFHLG1CQUFtQixDQUFDO0lBQ25DLE1BQU0sTUFBTSxHQUFHLG1CQUFtQixDQUFDO0lBRXRCLFFBQUEsaUJBQWlCLEdBQUcsQ0FBQyxXQUFtQyxFQUFFLGtCQUEyQixLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDM0csSUFBSSxFQUFFLE1BQU07UUFDWixXQUFXO1FBQ1gsZUFBZTtLQUNoQixDQUFDLENBQUM7SUFDVSxRQUFBLGdCQUFnQixHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDckMsSUFBSSxFQUFFLEtBQUs7S0FDWixDQUFDLENBQUM7SUFDVSxRQUFBLGdCQUFnQixHQUFHLENBQUMsVUFBMkIsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNoRSxJQUFJLEVBQUUsTUFBTTtRQUNaLFVBQVU7S0FDWCxDQUFDLENBQUM7SUFDVSxRQUFBLGdCQUFnQixHQUFHLENBQUMsVUFBMkIsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNoRSxJQUFJLEVBQUUsTUFBTTtRQUNaLFVBQVU7S0FDWCxDQUFDLENBQUM7SUFFVSxRQUFBLFdBQVcsR0FBRyxDQUFDLFFBQThCLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUN0RSxRQUFPLE1BQU0sQ0FBQyxJQUFJLEVBQUU7WUFDbEIsS0FBSyxNQUFNO2dCQUNULE9BQU87b0JBQ0wsR0FBRyxLQUFLO29CQUNSLE1BQU0sQ0FBQyxVQUFVO2lCQUNsQixDQUFDO1lBQ0osS0FBSyxLQUFLO2dCQUNSLE9BQU8sRUFBRSxDQUFDO1lBQ1osS0FBSyxNQUFNO2dCQUNULE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFVBQTJCLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUMvRixLQUFLLE1BQU07Z0JBQ1QsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBMkIsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLFVBQVUsQ0FBQyxFQUFFLENBQUMsSUFBSSxVQUFVLENBQUMsQ0FBQztZQUN4SDtnQkFDRSxPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNILENBQUMsQ0FBQyJ9