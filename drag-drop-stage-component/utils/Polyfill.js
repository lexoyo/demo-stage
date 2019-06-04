define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function patchWindow(win) {
        if (!win.document.elementsFromPoint) {
            // console.warn('Polyfill: polyfill document.elementsFromPoint', win);
            win.document.elementsFromPoint = function (x, y) {
                // FIXME: the order is important and the 1st element should be the one on top
                return Array.from(win.document.body.querySelectorAll('*')).filter(function (el) {
                    var pos = el.getBoundingClientRect();
                    return pos.left <= x && x <= pos.right && pos.top <= y && y <= pos.bottom;
                });
            };
        }
    }
    exports.patchWindow = patchWindow;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9seWZpbGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdHMvdXRpbHMvUG9seWZpbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBQUEsU0FBZ0IsV0FBVyxDQUFDLEdBQVc7UUFDckMsSUFBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUU7WUFDbEMsc0VBQXNFO1lBQ3RFLEdBQUcsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEdBQUcsVUFBUyxDQUFDLEVBQUUsQ0FBQztnQkFDNUMsNkVBQTZFO2dCQUM3RSxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBUyxFQUFFO29CQUMzRSxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMscUJBQXFCLEVBQUUsQ0FBQztvQkFDckMsT0FBTyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQztnQkFDNUUsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUE7U0FDRjtJQUNILENBQUM7SUFYRCxrQ0FXQyJ9