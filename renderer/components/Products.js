module.exports = class Products extends (require("../Crud")) {

    getConfig() {
        return {
            sort: "name",
            fields: {
                "name": {label: "Product Name", type: "text"},
                "vat": {label: "Vat", type: "select", options: ["7%", "19%"]},
                "quantity": {label: "Quantity", type: "integer"},
                "price_gross": {label: "Price (gross)", type: "currency"},
                "price_net": {label: "Price (net)", type: "currency"}
            },
            list: ["name", "quantity", "vat", "price_gross", "price_net"]
        }
    }
}