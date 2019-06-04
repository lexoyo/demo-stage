define(["require", "exports", "../Types"], function (require, exports, types) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UI_SET_MODE = 'UI_SET_MODE';
    exports.setMode = (mode) => ({
        type: exports.UI_SET_MODE,
        mode,
    });
    exports.UI_SET_REFRESHING = 'UI_SET_REFRESHING';
    exports.setRefreshing = (refreshing) => ({
        type: exports.UI_SET_REFRESHING,
        refreshing,
    });
    exports.UI_SET_CATCHING_EVENTS = 'UI_SET_CATCHING_EVENTS';
    exports.setCatchingEvents = (catchingEvents) => ({
        type: exports.UI_SET_CATCHING_EVENTS,
        catchingEvents,
    });
    exports.UI_SET_STICKY = 'UI_SET_STICKY';
    exports.setSticky = (sticky) => ({
        type: exports.UI_SET_STICKY,
        sticky,
    });
    exports.UI_SET_ENABLE_STICKY = 'UI_SET_ENABLE_STICKY';
    exports.setEnableSticky = (enableSticky) => ({
        type: exports.UI_SET_ENABLE_STICKY,
        enableSticky,
    });
    /**
     * reducer
     */
    exports.ui = (state = exports.getDefaultState(), action) => {
        switch (action.type) {
            case exports.UI_SET_MODE:
                return Object.assign({}, state, { mode: action.mode });
            case exports.UI_SET_REFRESHING:
                return Object.assign({}, state, { refreshing: action.refreshing });
            case exports.UI_SET_CATCHING_EVENTS:
                return Object.assign({}, state, { catchingEvents: action.catchingEvents });
            case exports.UI_SET_STICKY:
                return Object.assign({}, state, { sticky: action.sticky });
            case exports.UI_SET_ENABLE_STICKY:
                return Object.assign({}, state, { enableSticky: action.enableSticky });
            default:
                return state;
        }
    };
    exports.getDefaultState = () => {
        return {
            mode: types.UiMode.NONE,
            refreshing: false,
            catchingEvents: true,
            sticky: types.EMPTY_STICKY_BOX(),
            enableSticky: true,
        };
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVWlTdGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cy9mbHV4L1VpU3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBRWEsUUFBQSxXQUFXLEdBQUcsYUFBYSxDQUFDO0lBQzVCLFFBQUEsT0FBTyxHQUFHLENBQUMsSUFBa0IsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5QyxJQUFJLEVBQUUsbUJBQVc7UUFDakIsSUFBSTtLQUNMLENBQUMsQ0FBQztJQUVVLFFBQUEsaUJBQWlCLEdBQUcsbUJBQW1CLENBQUM7SUFDeEMsUUFBQSxhQUFhLEdBQUcsQ0FBQyxVQUFtQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3JELElBQUksRUFBRSx5QkFBaUI7UUFDdkIsVUFBVTtLQUNYLENBQUMsQ0FBQztJQUVVLFFBQUEsc0JBQXNCLEdBQUcsd0JBQXdCLENBQUM7SUFDbEQsUUFBQSxpQkFBaUIsR0FBRyxDQUFDLGNBQXVCLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDN0QsSUFBSSxFQUFFLDhCQUFzQjtRQUM1QixjQUFjO0tBQ2YsQ0FBQyxDQUFDO0lBRVUsUUFBQSxhQUFhLEdBQUcsZUFBZSxDQUFDO0lBQ2hDLFFBQUEsU0FBUyxHQUFHLENBQUMsTUFBb0IsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNsRCxJQUFJLEVBQUUscUJBQWE7UUFDbkIsTUFBTTtLQUNQLENBQUMsQ0FBQztJQUVVLFFBQUEsb0JBQW9CLEdBQUcsc0JBQXNCLENBQUM7SUFDOUMsUUFBQSxlQUFlLEdBQUcsQ0FBQyxZQUFxQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3pELElBQUksRUFBRSw0QkFBb0I7UUFDMUIsWUFBWTtLQUNiLENBQUMsQ0FBQztJQUVIOztPQUVHO0lBQ1UsUUFBQSxFQUFFLEdBQUcsQ0FBQyxLQUFLLEdBQUMsdUJBQWUsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ3BELFFBQU8sTUFBTSxDQUFDLElBQUksRUFBRTtZQUNsQixLQUFLLG1CQUFXO2dCQUNkLHlCQUNLLEtBQUssSUFDUixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksSUFDbEI7WUFDSCxLQUFLLHlCQUFpQjtnQkFDcEIseUJBQ0ssS0FBSyxJQUNSLFVBQVUsRUFBRSxNQUFNLENBQUMsVUFBVSxJQUM5QjtZQUNILEtBQUssOEJBQXNCO2dCQUN6Qix5QkFDSyxLQUFLLElBQ1IsY0FBYyxFQUFFLE1BQU0sQ0FBQyxjQUFjLElBQ3RDO1lBQ0gsS0FBSyxxQkFBYTtnQkFDaEIseUJBQ0ssS0FBSyxJQUNSLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxJQUN0QjtZQUNILEtBQUssNEJBQW9CO2dCQUN2Qix5QkFDSyxLQUFLLElBQ1IsWUFBWSxFQUFFLE1BQU0sQ0FBQyxZQUFZLElBQ2xDO1lBQ0g7Z0JBQ0UsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDSCxDQUFDLENBQUM7SUFFVyxRQUFBLGVBQWUsR0FBRyxHQUFHLEVBQUU7UUFDbEMsT0FBTztZQUNMLElBQUksRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUk7WUFDdkIsVUFBVSxFQUFFLEtBQUs7WUFDakIsY0FBYyxFQUFFLElBQUk7WUFDcEIsTUFBTSxFQUFFLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRTtZQUNoQyxZQUFZLEVBQUUsSUFBSTtTQUNuQixDQUFDO0lBQ0osQ0FBQyxDQUFBIn0=