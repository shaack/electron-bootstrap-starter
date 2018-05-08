module.exports = class Crypto {
    static base36Key() {
        return Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString(36).substr(0, 10)
    }
}