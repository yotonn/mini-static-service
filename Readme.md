# mini-static-service

这是一个静态资源服务器，只是添加了一下额外的功能：根据匹配规则替换静态文件里的字段。

## 安装
node > v7.6.0
```js
$ npm install mini-static-service [-g]
```

## 使用

```js
$ mss [options] [value ...]
```

## 选项
- `-p, --port` 启动端口，默认值`3000`
- `-d, --dir` 启动目录，默认`当前目录`
- `-c, --config` 匹配规则的配置文件路径，默认为`当前目录下的mini-static-service.js` 
- `-s, --silent` 不打开浏览器

## 配置文件
```js

// mini-static-service.js
module.exports={
    "rule":`replace value`
    ...
}
```