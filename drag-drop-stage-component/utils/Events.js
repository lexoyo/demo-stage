define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * add an event listener and returns an a method to call to remove the listener
     */
    function addEvent(obj, type, listener, options = {}) {
        obj.addEventListener(type, listener, options);
        return () => obj.removeEventListener(type, listener, options);
    }
    exports.addEvent = addEvent;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXZlbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3RzL3V0aWxzL0V2ZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFDQTs7T0FFRztJQUNILFNBQWdCLFFBQVEsQ0FBQyxHQUFnQixFQUFFLElBQVksRUFBRSxRQUF1QixFQUFFLFVBQWUsRUFBRTtRQUNqRyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM5QyxPQUFPLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFIRCw0QkFHQyJ9