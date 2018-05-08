/**
 * Author: Stefan Haack https://shaack.com
 * License: MIT, (c) 2018 all rights reserved
 */
module.exports = class Html {
    static toId(string) {
        return string.replace(/\W/g, '_')
    }
}