const Events = require("./utils/Events")
const Observe = require("./utils/Observe")

exports.Renderer = class Renderer {

    constructor(views) {
        this.delegateNavigation()
        this.initFontAwesome()
        this.views = views
        this.status = {
            viewName: ""
        }
        this.navElement = document.querySelector("nav");
        this.mainElement = document.querySelector("main");
        Observe.property(this.status, "viewName", (params) => {
            // console.log(params);
            if(params.oldValue !== params.newValue) {
                const newNavItem = this.navElement.querySelector("[data-view='" + params.newValue + "']")
                newNavItem.setAttribute("class", "nav-item active")
                if(params.oldValue) {
                    const oldNavItem = this.navElement.querySelector("[data-view='" + params.oldValue + "']")
                    oldNavItem.setAttribute("class", "nav-item")
                }
                this.getView().onShow(this.mainElement);
            }
        })
    }

    getView() {
        if(this.status.viewName) {
            return this.views[this.status.viewName];
        }
    }

    delegateNavigation() {
        this.main = document.querySelector("main")
        // Dispatch navigation clicks, render view
        Events.delegate(document.querySelector("nav"), "click", ".nav-item", (event) => {
            let parentNode = event.target.parentNode
            this.status.viewName = parentNode.getAttribute("data-view")
            if(!this.views[this.status.viewName]) {
                console.error("unknown view", this.status.view)
            }
        })
    }

    initFontAwesome() {
        this.fontawesome = require('@fortawesome/fontawesome')
        this.fontawesome.library.add(require('@fortawesome/fontawesome-free-solid/faFlag'))
    }

}