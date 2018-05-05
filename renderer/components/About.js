module.exports = class About extends (require("../Component")) {
    render() {
        return `
        <h1>electron-bootstrap-starter</h1>
        <p>A starter project to create an electron app with Bootstrap 4.</p>
        <p>License: MIT (c) 2018 <a target="_blank" href="https://shaack.com">shaack.com</a></p>
        <h2>Features</h2>
        <ul>
        <li>Bootstrap 4</li>
        <li>Component architecture</li>
        <li>Simple reactive behaviour (without React, Angular etc.)</li>
        <li>Font-Awesome 5 integration</li>
        <li>CRUD example with JSON storage (coming soon)</li>
        <li>Example settings view (coming soon)</li>
        </ul>
        `
    }
}