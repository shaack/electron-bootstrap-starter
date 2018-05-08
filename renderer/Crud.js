const Events = require("./utils/Events")
const Html = require("./utils/Html")
const Crypto = require("./utils/Crypto")
const storage = require('electron-json-storage')
const path = require('path')
const BootstrapModal = require("./BootstrapModal")

/**
 * Author: Stefan Haack https://shaack.com
 * License: MIT, (c) 2018 all rights reserved
 */
class EditDialog extends BootstrapModal {

    constructor(config, componentName) {
        super(config)
        this.componentName = componentName
        Events.delegate(document.body, "click", ".dialog" + this.componentName + " .btn-delete", (event) => {
            event.preventDefault()
            console.log("delete")
        })
        Events.delegate(document.body, "click", ".dialog" + this.componentName + " .btn-save", (event) => {
            event.preventDefault()
            let values = this.readFormValues()
            if (!values.id) {
                values.id = Crypto.base36Key()
            }
            storage.get(this.componentName, (error, data) => {
                if (error) throw error
                console.log("data", data)
                if (!data) {
                    data = {}
                }
                data[values.id] = values
                console.log("data", data)
                storage.set(this.componentName, data, (error) => {
                    if (error) throw error
                    console.log("hide")
                    this.hide()
                })
            })
        })
    }

    readFormValues() {
        const values = {}
        for (const field in this.fields) {
            values[field] = document.getElementById(Html.toId("input_" + field)).value
        }
        return values
    }

    show(fields, data = {}) {
        let fieldsHTML = ""
        this.fields = fields
        for (const field in fields) {
            const fieldType = fields[field]
            const fieldId = Html.toId("input_" + field)
            const fieldData = data[field] || ""
            fieldsHTML += this.renderFormGroup(fieldId, field, fieldType, fieldData)
        }
        let buttonsHTML = ""
        if (data.id) {
            buttonsHTML += `<button class="btn-light btn btn-delete"><i class="fa fa-trash"></i> Delete</button>`
        }
        buttonsHTML += `<button class="btn-primary btn btn-save">Save</button>`
        super.show(this.componentName, fieldsHTML, buttonsHTML)
        $(".dialog" + this.componentName + " input[type='number']").InputSpinner({
            boostMultiplier: 10
        })
    }

    renderFormGroup(id, name, type, value) {
        let inputHtml = ""
        switch (type) {
            case "Text":
                inputHtml = `<input id="${id}" type="text" class="form-control" value="${value}"/>`
                break
            case "Integer":
                inputHtml = `<input id="${id}" type="number" class="form-control" value="${value}"/>`
                break
            case "Currency":
                inputHtml = `<input id="${id}" type="number" data-decimals="2" class="form-control" value="${value}" step="0.01"/>`
                break
            default:
                console.error(`unknown field type: ${type}`)
        }
        return `<div class="form-group row">
                    <label class="col-sm-4 col-form-label" for="${id}">${name}</label>
                    <div class="col-sm-8">
                        ${inputHtml}
                    </div>
                  </div>`
    }

}

module.exports = class Crud extends (require("./Component")) {

    constructor(componentName, renderer) {
        super(componentName, renderer)
        this.editDialog = new EditDialog({
            dialogCss: "dialog" + componentName
        }, componentName)
        Events.delegate(document.body, "click", "main .btn-add", () => {
            if (this.isActive()) {
                this.showDetails()
            }
        })
    }

    showDetails(key) {
        storage.get(this.componentName, (data) => {
            if (!data) data = {}
            this.editDialog.show(this.config.fields, data)
        })

    }

    getConfig() {
        console.error("implement in child class")
    }

    render() {
        return "<h1>Products</h1>" + this.renderToolbar() + this.renderTable()
    }

    renderToolbar() {
        return '<div class="mb-2"><button type="button" class="btn btn-light btn-add"><i class="fa fa-plus"></i> Add</button></div>'
    }

    renderTable() {
        let theadContent = ""
        for (const listColumnField of this.config.list) {
            theadContent += `<th>${listColumnField}</th>`
        }
        return `<table class="crud"><thead><tr>${theadContent}</tr></thead></table>`
    }

}