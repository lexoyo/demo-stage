define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const MOUSE_SCROLL = 'MOUSE_SCROLL';
    exports.setScroll = (scrollData) => ({
        type: MOUSE_SCROLL,
        scrollData,
    });
    const MOUSE_CURSOR = 'MOUSE_CURSOR';
    exports.setCursorData = (cursorData) => ({
        type: MOUSE_CURSOR,
        cursorData,
    });
    const MOUSE_DATA = 'MOUSE_DATA';
    exports.setMouseData = (mouseData) => ({
        type: MOUSE_DATA,
        mouseData,
    });
    exports.mouse = (state = exports.getDefaultState(), action) => {
        switch (action.type) {
            case MOUSE_SCROLL:
                return Object.assign({}, state, { scrollData: action.scrollData });
            case MOUSE_CURSOR:
                return Object.assign({}, state, { cursorData: action.cursorData });
            case MOUSE_DATA:
                return Object.assign({}, state, { mouseData: action.mouseData });
            default:
                return state;
        }
    };
    exports.getDefaultState = () => {
        return {
            scrollData: { x: 0, y: 0 },
            cursorData: { x: '', y: '', cursorType: '' },
            mouseData: {
                movementX: 0,
                movementY: 0,
                mouseX: 0,
                mouseY: 0,
                shiftKey: false,
                target: null,
            },
        };
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW91c2VTdGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cy9mbHV4L01vdXNlU3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBR0EsTUFBTSxZQUFZLEdBQUcsY0FBYyxDQUFDO0lBQ3ZCLFFBQUEsU0FBUyxHQUFHLENBQUMsVUFBNEIsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMxRCxJQUFJLEVBQUUsWUFBWTtRQUNsQixVQUFVO0tBQ1gsQ0FBQyxDQUFDO0lBRUgsTUFBTSxZQUFZLEdBQUcsY0FBYyxDQUFDO0lBQ3ZCLFFBQUEsYUFBYSxHQUFHLENBQUMsVUFBNEIsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5RCxJQUFJLEVBQUUsWUFBWTtRQUNsQixVQUFVO0tBQ1gsQ0FBQyxDQUFDO0lBRUgsTUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDO0lBQ25CLFFBQUEsWUFBWSxHQUFHLENBQUMsU0FBMEIsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMzRCxJQUFJLEVBQUUsVUFBVTtRQUNoQixTQUFTO0tBQ1YsQ0FBQyxDQUFDO0lBRVUsUUFBQSxLQUFLLEdBQUcsQ0FBQyxRQUF3Qix1QkFBZSxFQUFFLEVBQUUsTUFBVyxFQUFFLEVBQUU7UUFDOUUsUUFBTyxNQUFNLENBQUMsSUFBSSxFQUFFO1lBQ2xCLEtBQUssWUFBWTtnQkFDZix5QkFDSyxLQUFLLElBQ1IsVUFBVSxFQUFFLE1BQU0sQ0FBQyxVQUFVLElBQzdCO1lBQ0osS0FBSyxZQUFZO2dCQUNmLHlCQUNLLEtBQUssSUFDUixVQUFVLEVBQUUsTUFBTSxDQUFDLFVBQVUsSUFDOUI7WUFDSCxLQUFLLFVBQVU7Z0JBQ2IseUJBQ0ssS0FBSyxJQUNSLFNBQVMsRUFBRSxNQUFNLENBQUMsU0FBUyxJQUM1QjtZQUNIO2dCQUNFLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO0lBQ0gsQ0FBQyxDQUFDO0lBRVcsUUFBQSxlQUFlLEdBQUcsR0FBcUIsRUFBRTtRQUNwRCxPQUFPO1lBQ0wsVUFBVSxFQUFFLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFDO1lBQ3hCLFVBQVUsRUFBRSxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFDO1lBQzFDLFNBQVMsRUFBRTtnQkFDVCxTQUFTLEVBQUUsQ0FBQztnQkFDWixTQUFTLEVBQUUsQ0FBQztnQkFDWixNQUFNLEVBQUUsQ0FBQztnQkFDVCxNQUFNLEVBQUUsQ0FBQztnQkFDVCxRQUFRLEVBQUUsS0FBSztnQkFDZixNQUFNLEVBQUUsSUFBSTthQUNiO1NBQ0YsQ0FBQztJQUNKLENBQUMsQ0FBQSJ9