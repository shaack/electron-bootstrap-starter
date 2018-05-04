// Parent "abstract" class, extend in view implementations
module.exports = class View {

    constructor() {
    }

    onShow(mainElement) {
        mainElement.innerHTML = this.render();
    }

    onHide() {

    }

    render() {
        return 'render() not implemented in view class';
    }

}