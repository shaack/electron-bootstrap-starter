const Events = require("./utils/Events")
const Html = require("./utils/Html")
const Crypto = require("./utils/Crypto")
const storage = require("electron-json-storage")
const path = require("path")
const BootstrapModal = require("./BootstrapModal")
const tablesort = require("tablesort")

class EditDialog extends BootstrapModal {

    constructor(config, componentName, renderer, crudComponent) {
        super(config)
        this.componentName = componentName
        this.crudComponent = crudComponent

        Events.delegate(document.body, "input", ".dialog" + this.componentName + "  .form-control-details", (event) => {
            const fieldName = event.target.getAttribute("data-field")
            const fieldConfig = this.crudComponent.config.fields[fieldName]
            if (fieldConfig.onChange) {
                fieldConfig.onChange(this, event)
            }
        })

        Events.delegate(document.body, "click", ".dialog" + this.componentName + " .btn-delete", (event) => {
            event.preventDefault()
            let values = this.readFormValues()
            storage.get(this.componentName, (error, data) => {
                if (error) throw error
                if (confirm("Delete?")) {
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

    updateFormValue(field, newValue) {
        const fieldElement = document.getElementById(Html.toId("input_" + field))
        if(fieldElement.setValue) {
            fieldElement.setValue(newValue)
        } else {
            fieldElement.value = newValue
        }

    }

    readFormValues() {
        const values = {}
        for (const field in this.fields) {
            values[field] = document.getElementById(Html.toId("input_" + field)).value
        }
        if (document.getElementById("input_id")) {
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
        console.log("fields", fields)
        for (const field in fields) {
            const fieldConfig = fields[field]
            console.log(data, field)
            const fieldData = data[field] || ""
            fieldsHTML += this.renderFormGroup(field, fieldConfig, fieldData)
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

    renderFormGroup(name, fieldConfig, value) {
        let inputHtml = ""
        const fieldId = Html.toId("input_" + name)
        switch (fieldConfig.type) {
            case "text":
                inputHtml = `<input id="${fieldId}" data-field="${name}" type="text" class="form-control form-control-details" value="${value}"/>`
                break
            case "textarea":
                inputHtml = `<textarea id="${fieldId}" data-field="${name}" type="text" class="form-control form-control-details" >${value}</textarea>`
                break
            case "integer":
                inputHtml = `<input id="${fieldId}" data-field="${name}" type="number" class="form-control form-control-details" value="${value}"/>`
                break
            case "currency":
                inputHtml = `<input id="${fieldId}" data-field="${name}" type="number" data-decimals="2" class="form-control form-control-details" value="${value}" step="0.01"/>`
                break
            case "select":
                inputHtml = `<select id="${fieldId}" data-field="${name}" class="form-control form-control-details">${this.renderSelectOptions(fieldConfig.options, value)}</select>`
                break
            default:
                console.error(`unknown field type: ${fieldConfig.type}`)
        }
        return `<div class="form-group row">
                    <label class="col-sm-4 col-form-label" for="${fieldId}">${fieldConfig.label}</label>
                    <div class="col-sm-8">
                        ${inputHtml}
                    </div>
                  </div>`
    }

    renderSelectOptions(options, value) {
        let optionsHtml = "<option value=''></option>"
        let i = 1
        for (const option of options) {
            const selected = (parseInt(value, 10) === i) ? "selected" : ""
            optionsHtml += `<option value="${i}" ${selected}>${option}</option>`
            i++
        }
        return optionsHtml
    }

}

module.exports = class Crud extends (require("./Component")) {

    constructor(componentName, renderer) {
        super(componentName, renderer)
        this.currencyFormat = new Intl.NumberFormat(renderer.locale, {minimumFractionDigits: 2, maximumFractionDigits: 2})
        this.intFormat = new Intl.NumberFormat(renderer.locale)
        let dialogCss = "dialog" + componentName
        if(this.config.dialogCss) {
            dialogCss += " " + this.config.dialogCss
        }
        this.editDialog = new EditDialog({
            dialogCss: dialogCss
        }, componentName, renderer, this)
        Events.delegate(document.body, "click", `main.${this.componentName} .btn-add`, () => {
            if (this.isActive()) {
                this.showDetails()
            }
        })
        Events.delegate(document.body, "click", `main.${this.componentName} table.crud tr.table-row`, (event) => {
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

    onShow() {
        storage.setDataPath(this.renderer.settings.dataStorageFolder)
        super.onShow()
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
            if (this.config.sort === listColumnField) {
                theadContent += `<th data-sort-default="" class="${this.config.fields[listColumnField].type}">${this.config.fields[listColumnField].label}</th>`
            } else {
                theadContent += `<th class="${this.config.fields[listColumnField].type}">${this.config.fields[listColumnField].label}</th>`
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
                    const fieldConfig = this.config.fields[listColumnField]
                    switch (fieldConfig.type) {
                        case "currency":
                            rowHTML += "<td class='currency'>" + this.currencyFormat.format(row[listColumnField]) + "</td>"
                            break
                        case "integer":
                            rowHTML += "<td class='integer'>" + this.intFormat.format(row[listColumnField]) + "</td>"
                            break
                        case "select":
                            rowHTML += "<td class='select'>" + fieldConfig.options[row[listColumnField] - 1] + "</td>"
                            break
                        default:
                            rowHTML += "<td>" + row[listColumnField] + "</td>"
                    }

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