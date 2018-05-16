module.exports = class Products extends (require("../Crud")) {

    getConfig() {
        return {
            sort: "name",
            fields: {
                "name": {label: "Product Name", type: "text"},
                "vat": {label: "Vat", type: "select", options: ["7%", "19%"], onChange: this.changeVat.bind(this)},
                "quantity": {label: "Quantity", type: "integer"},
                "price_net": {label: "Price (net)", type: "currency", onChange: this.changePriceNet.bind(this)},
                "price_gross": {label: "Price (gross)", type: "currency", onChange: this.changePriceGross.bind(this)},
            },
            list: ["name", "quantity", "vat", "price_net", "price_gross"]
        }
    }

    changeVat(dialog, event) {
        const values = dialog.readFormValues()
        let vat = this.getVat(values["vat"])
        if (values["price_net"]) {
            dialog.updateFormValue("price_gross", parseFloat(values["price_net"]) * (1 + vat))
        }
    }

    changePriceGross(dialog, event) {
        const values = dialog.readFormValues()
        let vat = this.getVat(values["vat"])
        dialog.updateFormValue("price_net", parseFloat(values["price_gross"]) / (1 + vat))
    }

    changePriceNet(dialog, event) {
        const values = dialog.readFormValues()
        let vat = this.getVat(values["vat"])
        dialog.updateFormValue("price_gross", parseFloat(values["price_net"]) * (1 + vat))
    }

    getVat(vatValue) {
        let vat = 0.0
        if (parseInt(vatValue, 10) === 1) {
            vat = 0.07
        } else if (parseInt(vatValue, 10) === 2) {
            vat = 0.19
        }
        return vat
    }
}