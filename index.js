// 主程序的入口

(function init() {



    global.session = require('express-session');
    global.mongoStore = require('connect-mongo')(session)
    
    global.bodyJsonParser = require("body-parser").json()


    global.cfg = require('./config.js')

    global.app = require('express')()

    global.checkLogin = require('./tool/checkLogin')
    global.validator = require('./tool/validator')

    global.model = {
        peo: require('./model/peopleModel'),
        role: require('./model/roleModel'),
        skill: require('./model/skillModel')
    }





    app.set('views', './view/')
    app.set('view engine', 'ejs')



    const options = {
        useNewUrlParser: true,
        poolSize: 10
    }

    // connection pool
    require('mongodb').MongoClient.connect(cfg.mongo.url, options, function (err, client) {
        if (err) throw err;
        // 全局的连接池?
        global.db = client.db(cfg.mongo.db)
    });



    // 会在参数之间加空格...
    // console.log('Source opened on GitHub:\n', pkg.homepage)

    // 开始路由
    require('./route')(app);

    Date.prototype.toJSON = function () {
        // 返回number
        return this.getTime()
    }

    // 成功申请监听端口以后执行回调
    app.listen(cfg.server.port, function () {
        // sudo node index.js才能在80端口下运行
        console.log(`running @ :
            http://localhost:${cfg.server.port}`)
    })

})();