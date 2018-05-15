const Events = require("./utils/Events")
const Html = require("./utils/Html")
const Crypto = require("./utils/Crypto")
const storage = require('electron-json-storage')
const path = require('path')
const BootstrapModal = require("./BootstrapModal")
const tablesort = require('tablesort')

class EditDialog extends BootstrapModal {

    constructor(config, componentName, renderer) {
        super(config)
        this.componentName = componentName
        Events.delegate(document.body, "click", ".dialog" + this.componentName + " .btn-delete", (event) => {
            event.preventDefault()
            let values = this.readFormValues()
            storage.get(this.componentName, (error, data) => {
                if (error) throw error
                if(confirm("Delete?")) {
                    delete data[values.id]
                    storage.set(this.componentName, data, (error) => {
                        if (error) throw error
                        renderer.getComponent().redraw()
                        this.hide()
                    })
                }
            })
        })
        Events.delegate(document.body, "click", ".dialog" + this.componentName + " .btn-save", (event) => {
            event.preventDefault()
            let values = this.readFormValues()
            if (!values.id) {
                values.id = Crypto.base36Key()
            }
            storage.get(this.componentName, (error, data) => {
                if (error) throw error
                if (!data) {
                    data = {}
                }
                data[values.id] = values
                storage.set(this.componentName, data, (error) => {
                    if (error) throw error
                    renderer.getComponent().redraw()
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
        if(document.getElementById("input_id")) {
            values["id"] = document.getElementById("input_id").value
        }
        return values
    }

    show(fields, id = null) {
        let data = {}
        if (id) {
            storage.get(this.componentName, (error, allData) => {
                if (error) throw error
                if (allData) data = allData[id]
                this.renderForm(fields, data)
            })
        } else {
            this.renderForm(fields, data)
        }
    }

    renderForm(fields, data) {
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
            buttonsHTML += `<input type="hidden" id="input_id" value="${data.id}"/>`
            buttonsHTML += `<button class="btn-light btn btn-delete"><i class="fa fa-trash"></i> Delete</button>`
        }
        buttonsHTML += `<button class="btn-primary btn btn-save">Save</button>`
        super.show(this.componentName, fieldsHTML, buttonsHTML)
        $(".dialog" + this.componentName + " input[type='number']").InputSpinner({
            boostMultiplier: 10
        })
    }

    renderFormGroup(htmlId, name, type, value) {
        let inputHtml = ""
        switch (type) {
            case "Text":
                inputHtml = `<input id="${htmlId}" type="text" class="form-control" value="${value}"/>`
                break
            case "Integer":
                inputHtml = `<input id="${htmlId}" type="number" class="form-control" value="${value}"/>`
                break
            case "Currency":
                inputHtml = `<input id="${htmlId}" type="number" data-decimals="2" class="form-control" value="${value}" step="0.01"/>`
                break
            default:
                console.error(`unknown field type: ${type}`)
        }
        return `<div class="form-group row">
                    <label class="col-sm-4 col-form-label" for="${htmlId}">${name}</label>
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
        }, componentName, renderer)
        Events.delegate(document.body, "click", "main .btn-add", () => {
            if (this.isActive()) {
                this.showDetails()
            }
        })
        Events.delegate(document.body, "click", "main table.crud tr.table-row", (event) => {
            const id = event.target.parentNode.getAttribute("data-id")
            if (id) {
                this.showDetails(id)
            }
        })
    }

    showDetails(id = null) {
        this.editDialog.show(this.config.fields, id)
    }

    getConfig() {
        console.error("implement in child class")
    }

    render() {
        return "<h1>Products</h1>" + this.renderToolbar() + this.renderTable()
    }

    redraw() {
        super.redraw()
    }

    renderToolbar() {
        return '<div class="mb-2"><button type="button" class="btn btn-light btn-add"><i class="fa fa-plus"></i> Add</button></div>'
    }

    renderTable() {
        let theadContent = ""
        for (const listColumnField of this.config.list) {
            if (this.config.sort === listColumnField) {
                theadContent += `<th data-sort-default="">${listColumnField}</th>`
            } else {
                theadContent += `<th>${listColumnField}</th>`
            }
        }
        storage.get(this.componentName, (error, data) => {
            if (error) throw error
            const tbody = document.body.querySelector("main." + this.componentName + " tbody")
            let tbodyHtml = ""
            for (const rowId in data) {
                const row = data[rowId]
                let rowHTML = ""
                for (const listColumnField of this.config.list) {
                    rowHTML += "<td>" + row[listColumnField] + "</td>"
                }
                tbodyHtml += `<tr class="table-row" data-id="${rowId}">${rowHTML}</tr>`
            }
            tbody.innerHTML = tbodyHtml
            const table = document.body.querySelector("main." + this.componentName + " table")
            this.tablesort = tablesort(table)
        })
        return `<table class="crud"><thead><tr>${theadContent}</tr></thead><tbody></tbody></table>`
    }

}