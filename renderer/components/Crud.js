const storage = require('electron-json-storage')
const path = require('path')

module.exports = class Crud extends (require("../Component")) {
    constructor(renderer) {
        super(renderer)
    }

    render() {
        return `CRUD example coming soon`
    }
}