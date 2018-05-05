const storage = require('electron-json-storage')
const Events = require("../utils/Events")
const Observe = require("../utils/Observe")
const remote = require('electron').remote

const settingsKey = "settings"
module.exports = class Settings extends (require("../Component")) {

    constructor(renderer) {
        super(renderer)
        this.load(() => {
            Events.delegate(document.body, "click", "main.Settings #exampleStorageFolder", () => {
                console.log("open file Dialog")
            })
            Observe.property(this.renderer.status,
                ["activeComponentName", "exampleText", "dataStorageFolder"], (params) => {
                    this.save()
                })
        })
    }

    render() {
        return `
        <h1>Settings</h1>
        <form>
          <div class="form-group">
            <label for="exampleStorageFolder">Storage Folder</label>
            <input readonly value="${this.renderer.status.dataStorageFolder}" type="text" class="form-control" id="exampleStorageFolder">
            <small class="form-text text-muted">The storage folder used for the CRUD example</small>
          </div>
          <div class="form-group">
            <label for="exampleText">Text</label>
            <input type="text" value="${renderer.status.exampleText}" class="form-control" id="exampleText" aria-describedby="exampleText" placeholder="Enter a text">
            <small class="form-text text-muted">This text will be displayed in the Text view</small>
          </div>
        </form>`
    }

    onHide() {
    }

    load(callback) {
        storage.has(settingsKey, (error, hasKey) => {
            if (error) throw error
            if (hasKey) {
                storage.get(settingsKey, (error, data) => {
                    if (error) throw error
                    Object.assign(this.renderer.status, data) // copy changed values
                    callback(true)
                })
            } else {
                callback(false)
            }
        })
    }

    save(callback) {
        storage.set(settingsKey, this.renderer.status, (error) => {
            if (error) throw error
        }, callback)
    }

}