const Koa = require('koa')
const path = require('path')
const fs = require('mz/fs')
const logger = require('koa-logger')
const KoaSend = require('./koa-send')
const escapeStringRegexp = require('escape-string-regexp')
const FileTypeReg = /\.(js|css|html)$/i
let config_path

const App = class {
    constructor(options) {
        config_path = options.config_path
        this.App = new Koa()
        this.App._root = this.App._root || options.server_root
        this.App.use(logger())
        this.App.use(this.Controller)
        this.App.use(this.filterRuleController)
        this.App.use(this.FileReader)
    }
    listen(port, CB = () => { }) {
        this.App.listen(port, CB)
    }
    async filterRuleController(ctx, next) {
        if (!await fs.exists(config_path)) {
            ctx.filterRules = null
            await next()
            return
        }
        let config = require(config_path)

        if (typeof config !== 'object' || Array.isArray(config)) {
            console.warn('配置文件内容错误')
            ctx.filterRules = null
            await next()
            return
        }
        let keys = Object.keys(config)
        let _keys = new Set(keys)
        if (keys.length !== _keys.size) {
            console.warn('配置文件内容有重复')
        }
        ctx.filterRules = config
        await next()
    }
    async Controller(ctx, next) {
        let method = ctx.method
        if (method !== 'GET') {
            ctx.body = '仅支持GET请求'
            return
        }

        if (ctx.url === '/') {
            ctx.url = '/index.html'
        }
        ctx.res.setHeader("Access-Control-Allow-Origin", "*")
        await next()
    }

    async FileReader(ctx, next) {
        let path = await KoaSend(ctx, ctx.url, { root: ctx.app._root })

        let rules = ctx.filterRules
        if (!rules || !FileTypeReg.test(path)) {
            ctx.body = fs.createReadStream(path)
            await next()
            return
        }
        try {
            let file_buf = await fs.readFile(path)
            let file_str = file_buf.toString()
            for (const key in rules) {
                if (rules.hasOwnProperty(key)) {
                    const reg = new RegExp(escapeStringRegexp(key), 'gmi')
                    file_str = file_str.replace(reg, rules[key])
                }
            }
            let buf = Buffer.from(file_str)
            ctx.set('Content-Length', buf.size)
            ctx.body = buf
        } catch (error) {
            ctx.body = error.message
            return
        }
    }
}

module.exports = App
