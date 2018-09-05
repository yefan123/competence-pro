// 主程序的入口

(function init() {



    global.path = require('path')
    global.session = require('express-session');
    global.mongoStore = require('connect-mongo')(session)


    global.cfg = require('./config')
    global.pkg = require('./package')

    global.app = require('express')()

    global.checkLogin = require('./tool/checkLogin')
    global.validator = require('./tool/validator')



    global.mongoClient = require('mongodb').MongoClient;



    global.refreshRoleList = () => new Promise((resolve, reject) => {
        require('./model/roleModel').find({}).then(list => {
            global.roleList = list
            resolve()
        })
    })

    global.refreshTypeList = () => new Promise((resolve, reject) => {
        require('./model/typeModel').find({}).then(list => {
            global.typeList = list
            resolve()
        })
    })

    global.refreshBranchList = () => new Promise((resolve, reject) => {
        require('./model/roleModel').distinct('branch').then(list => {
            global.branchList = list
            resolve()
        })
    })


    app.set('views', './view/')
    app.set('view engine', 'ejs')



    const options = {
        useNewUrlParser: true,
        poolSize: 10
    }

    // connection pool
    mongoClient.connect(cfg.mongo.url, options, function (err, client) {
        if (err) throw err;
        // 全局的连接池?
        global.db = client.db(cfg.mongo.db)
        refreshRoleList()
        refreshTypeList()
        refreshBranchList()
    });



    // 会在参数之间加空格...
    // console.log('Source opened on GitHub:\n', pkg.homepage)

    // 开始路由
    require('./route')(app);


    // 成功申请监听端口以后执行回调
    app.listen(cfg.port, function () {
        // sudo node index.js才能在80端口下运行
        console.log(`running @ :
            http://localhost:${cfg.port}`)
    })

})();