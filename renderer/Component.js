module.exports = class Component {

    constructor(componentName, renderer) {
        this.componentName = componentName
        this.renderer = renderer
        this.config = this.getConfig()
    }

    getConfig() {
        return {} // implement in subclass
    }

    onShow() {
        this.redraw()
    }

    onHide() {

    }

    isActive() {
        return this === this.renderer.components[this.renderer.status.activeComponentName]
    }

    redraw() {
        this.renderer.mainElement.innerHTML = this.render()
    }

    render() {
        return 'render() not implemented in view class'
    }

}