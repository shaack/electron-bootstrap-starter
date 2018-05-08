module.exports = class Component {

    constructor(componentName, renderer) {
        this.componentName = componentName
        this.renderer = renderer
        this.config = this.getConfig()
    }

    getConfig() {
        return {} // implment in subclass
    }

    onShow() {
        this.renderer.mainElement.innerHTML = this.render()
    }

    onHide() {

    }

    isActive() {
        return this === this.renderer.components[this.renderer.status.activeComponentName]
    }

    render() {
        return 'render() not implemented in view class'
    }

}