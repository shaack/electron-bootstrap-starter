module.exports = class Crud extends (require("../Component")) {

    constructor(renderer) {
        super(renderer)
        renderer.status.exampleText = "Lorem ipsum dolor sit amet, consectetur adipisicing elit."
    }

    render() {
        return `Text example coming soon`;
    }

}