module.exports = class Html {
    static toId(string) {
        return string.replace(/\W/g, '_')
    }
}