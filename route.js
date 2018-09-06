// index.js --> 路由的入口 --> listener
module.exports = function route(app) {

    // 放在session中间件之前, 因为public资源不需要session
    app.use(require('express').static(__dirname + '/public'))

    app.use(session({
        name: cfg.session.key, // 设置 cookie 中保存 session id 的字段名称
        // Required option
        secret: cfg.session.secret, // 通过设置 secret 来计算 hash 值并放在 cookie 中(但每次的值不同)，使产生的 signedCookie 防篡改
        saveUninitialized: false,
        resave: false,
        cookie: {
            // 取消设置http层面的cookie(无法通过document.cookie访问)
            // httpOnly的cookie将http于js安全分离
            httpOnly: false,
            // json文件中无法使用表达式
            maxAge: cfg.session.maxAge // 过期时间，过期后 cookie 中的 session id 自动删除
        },
        store: new mongoStore({ // 将 session 存储到 mongodb
            url: cfg.mongo.url // mongodb 地址
        })
    }))


    // 入口
    app.use('/', require('./router/viewListener'))
    app.use('/view', require('./router/viewListener'))
    app.use('/set', require('./router/setListener'))
    app.use('/addDrop', require('./router/addDropListener'))
    app.use('/data', require('./router/dataListener'))
    app.use('/log', require('./router/logListener'))


}