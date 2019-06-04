define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Side;
    (function (Side) {
        Side[Side["LEFT"] = 0] = "LEFT";
        Side[Side["RIGHT"] = 1] = "RIGHT";
        Side[Side["TOP"] = 2] = "TOP";
        Side[Side["BOTTOM"] = 3] = "BOTTOM";
    })(Side = exports.Side || (exports.Side = {}));
    exports.EMPTY_STICKY_BOX = () => ({ top: null, left: null, bottom: null, right: null });
    exports.EMPTY_BOX = () => ({ top: null, left: null, bottom: null, right: null });
    /**
     * @enum = {
     * NONE
     * DRAG
     * RESIZE
     * DRAW
     * } UiMode
     */
    var UiMode;
    (function (UiMode) {
        UiMode[UiMode["NONE"] = 0] = "NONE";
        UiMode[UiMode["DRAG"] = 1] = "DRAG";
        UiMode[UiMode["RESIZE"] = 2] = "RESIZE";
        UiMode[UiMode["DRAW"] = 3] = "DRAW";
        UiMode[UiMode["HIDE"] = 4] = "HIDE";
    })(UiMode = exports.UiMode || (exports.UiMode = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdHMvVHlwZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBZ0dBLElBQVksSUFBaUM7SUFBN0MsV0FBWSxJQUFJO1FBQUcsK0JBQUksQ0FBQTtRQUFFLGlDQUFLLENBQUE7UUFBRSw2QkFBRyxDQUFBO1FBQUUsbUNBQU0sQ0FBQTtJQUFDLENBQUMsRUFBakMsSUFBSSxHQUFKLFlBQUksS0FBSixZQUFJLFFBQTZCO0lBRWhDLFFBQUEsZ0JBQWdCLEdBQWlCLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztJQUM1RixRQUFBLFNBQVMsR0FBYyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7SUFVL0Y7Ozs7Ozs7T0FPRztJQUNILElBQVksTUFNWDtJQU5ELFdBQVksTUFBTTtRQUNoQixtQ0FBSSxDQUFBO1FBQ0osbUNBQUksQ0FBQTtRQUNKLHVDQUFNLENBQUE7UUFDTixtQ0FBSSxDQUFBO1FBQ0osbUNBQUksQ0FBQTtJQUNOLENBQUMsRUFOVyxNQUFNLEdBQU4sY0FBTSxLQUFOLGNBQU0sUUFNakIifQ==