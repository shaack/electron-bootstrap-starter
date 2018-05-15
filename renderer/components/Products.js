module.exports = class Products extends (require("../Crud")) {

    getConfig() {
        return {
            sort: "Product Name",
            fields: {
                "Product Name": "Text",
                "Description": "Text",
                "Quantity": "Integer",
                "Price": "Currency"
            },
            list: ["Product Name", "Description", "Quantity", "Price"]
        }
    }
}