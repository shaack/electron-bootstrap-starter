module.exports = class About extends (require("./View")) {
    render() {
        return `
        <h1>electron-bootstrap-starter</h1>
        <p>A starter project to create an electron app with Bootstrap.</p>
        <p>License: MIT (c) 2018 <a target="_blank" href="https://shaack.com">shaack.com</a></p>
        <h2>Features</h2>
        <ul>
        <li>Bootstrap 4</li>
        <li>In Views separated pages</li>
        <li>Simle reactive behaviour</li>
        <li>Font-Awesome 5 integration</li>
        <li>CRUD example with JSON storage</li>
        <li>Example settings view</li>
        </ul>
        `
    }
}