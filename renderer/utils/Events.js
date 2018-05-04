if (!Element.prototype.matches) {
    Element.prototype.matches =
        Element.prototype.matchesSelector ||
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector ||
        Element.prototype.oMatchesSelector ||
        Element.prototype.webkitMatchesSelector ||
        function (s) {
            let matches = (this.document || this.ownerDocument).querySelectorAll(s);
            let i = matches.length;
            while (--i >= 0 && matches.item(i) !== this) {
            }
            return i > -1;
        };
}

module.exports = class Events {
    static delegate(element, event, selector, handler) {
        element.addEventListener(event, function (event) {
            let target = event.target;
            while (target && target !== this) {
                if (target.matches(selector)) {
                    handler.call(target, event);
                }
                target = target.parentNode;
            }
        });
    }
};