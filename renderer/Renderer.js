const Events = require("./utils/Events")
const Observe = require("./utils/Observe")

exports.Renderer = class Renderer {

    constructor(components) {
        this.navElement = document.querySelector("nav")
        this.mainElement = document.querySelector("main")
        this.delegateNavigation()
        this.initFontAwesome()
        // the status of the application
        this.status = {
            activeComponentName: "" // the active shown component
        }
        this.loadComponents(components)
        Observe.property(this.status, "activeComponentName", (params) => {
            console.log(params);
            if(params.oldValue !== params.newValue) {
                const newNavItem = this.navElement.querySelector("[data-component='" + params.newValue + "']")
                newNavItem.setAttribute("class", "nav-item active")
                if(params.oldValue) {
                    const oldNavItem = this.navElement.querySelector("[data-component='" + params.oldValue + "']")
                    oldNavItem.setAttribute("class", "nav-item")
                    this.components[params.oldValue].onHide();
                }
                this.mainElement.setAttribute("class", "container-fluid " + this.status.activeComponentName)
                this.getComponent().onShow()
            }
        })
    }

    loadComponents(components) {
        this.components = {};
        for (const componentName of components) {
            const componentClass = require("./components/" + componentName + ".js")
            this.components[componentName] = new componentClass(this);
        }
    }

    getComponent() {
        if(this.status.activeComponentName) {
            return this.components[this.status.activeComponentName]
        }
    }

    delegateNavigation() {
        // Dispatch navigation clicks, render view
        Events.delegate(document.querySelector("nav"), "click", ".nav-item", (event) => {
            let parentNode = event.target.parentNode
            this.status.activeComponentName = parentNode.getAttribute("data-component")
            if(!this.components[this.status.activeComponentName]) {
                console.error("unknown component", this.status.view)
            }
        })
    }

    initFontAwesome() {
        this.fontawesome = require('@fortawesome/fontawesome')
        this.fontawesome.library.add(require('@fortawesome/fontawesome-free-solid/faFlag'))
    }

}