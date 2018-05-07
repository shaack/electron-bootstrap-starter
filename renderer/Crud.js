const storage = require('electron-json-storage')
const path = require('path')

module.exports = class Crud extends (require("./Component")) {

    constructor(renderer) {
        super(renderer)
        this.config = this.getConfig();
    }

    getConfig() {
        console.error("implement in child class")
    }

    render() {
        return "<h1>Products</h1>" + this.renderToolbar() + this.renderTable()
    }

    renderToolbar() {
        return '<div class="mb-2"><button type="button" class="btn btn-light"><i class="fa fa-plus"></i> Add</button></div>';
    }

    renderTable() {
        let theadContent = "";
        for (const listColumnField of this.config.list) {
            theadContent += `<th>${listColumnField}</th>`;
        }
        return `<table class="crud"><thead><tr>${theadContent}</tr></thead></table>`;
    }

}