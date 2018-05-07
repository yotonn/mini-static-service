#!/usr/bin/env node
const program = require('commander')
const resolvePath = require('resolve-path')
const fs = require('fs')
const os = require('os')
const server = require('../libs/index')
const opn = require('opn')
const getIpAddress = () => {
    let ifaces = os.networkInterfaces()
    let ip = ''
    for (let dev in ifaces) {
        ifaces[dev].forEach(function (details) {
            if (ip === '' && details.family === 'IPv4' && !details.internal) {
                ip = details.address
                return
            }
        })
    }
    return ip || "127.0.0.1"
}
program
    .version(require('../package').version)
    .usage('[options] [value ...]')
    .option('-p, --port <string>', 'server port')
    .option('-d, --dir <string>', 'server root dir')
    .option('-c, --config <string>', 'config file path')
    .option('-s, --silent', 'don\'t open browser')
    .parse(process.argv)

program.on('help', function () {
    console.log('--help  print help information')
    console.log('')
    console.log('       -p, --port <string>', 'server port')
    console.log('       -d, --dir <string>', 'server root dir')
    console.log('       -c, --config <string>', 'config file path')

    console.log('       -s, --silent', 'don\'t open browser')
    console.log('')
})

const port = program.port || 3000
const server_root = program.dir ? resolvePath(program.dir) : process.cwd()
const config_path = resolvePath(program.config || 'mini-static-service.js')

const App = new server({
    server_root, config_path
})

App.listen(port, () => {
    console.log(`
        app running at http://${getIpAddress()}:${port}...
        app started at dir ${server_root}
    `)
    opn(`http://${getIpAddress()}:${port}`)
})