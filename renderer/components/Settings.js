const storage = require('electron-json-storage')
const Events = require("../utils/Events")
const remote = require('electron').remote

const fileName = "user.json"
const settingsKey = "settings"
module.exports = class Settings extends (require("../Component")) {

    constructor(renderer) {
        super(renderer)
        // todo set default storge folder
        Events.delegate(document.body, "click", "main.settings #exampleStorageFolder", () => {
            console.log("open file Dialog");
        });
    }

    render() {
        return `
        <h1>Settings</h1>
        <form>
          <div class="form-group">
            <label for="exampleStorageFolder">Storage Folder</label>
            <input readonly type="text" class="form-control" id="exampleStorageFolder">
            <small class="form-text text-muted">The storage folder used for the CRUD example</small>
          </div>
          <div class="form-group">
            <label for="exampleText">Text</label>
            <input type="text" class="form-control" id="exampleText" aria-describedby="exampleText" placeholder="Enter a text">
            <small class="form-text text-muted">This text will be displayed in the Text view</small>
          </div>
        </form>`;
    }

    load(callback) {
        storage.has(settingsKey, (error, hasKey) => {
            if (error) throw error
            if (hasKey) {
                storage.get(settingsKey, (error, data) => {
                    if (error) throw error
                    this.properties = data
                    callback(true);
                })
            } else {
                callback(false);
            }
        })
    }

    save() {
        storage.set(settingsKey, this.properties, (error) => {
            if (error) throw error
        })
    }

}