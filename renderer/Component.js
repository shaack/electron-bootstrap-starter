// Parent "abstract" class, extended in component implementations
module.exports = class Component {

    constructor(renderer) {
        this.renderer = renderer
    }

    onShow() {
        this.renderer.mainElement.innerHTML = this.render()
    }

    onHide() {

    }

    render() {
        return 'render() not implemented in view class'
    }

}