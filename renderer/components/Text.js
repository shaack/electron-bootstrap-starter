module.exports = class Crud extends (require("../Component")) {

    render() {
        return `<h1>A Text configured in Settings</h1>${this.renderer.settings.exampleText}`;
    }

}