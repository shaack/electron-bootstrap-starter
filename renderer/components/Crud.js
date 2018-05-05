const storage = require('electron-json-storage')

module.exports = class Crud extends (require("../Component")) {
    constructor(renderer) {
        super(renderer)
        this.renderer.status.dataStorageFolder = storage.getDefaultDataPath()
    }

    render() {
        return `CRUD example coming soon`;
    }
}