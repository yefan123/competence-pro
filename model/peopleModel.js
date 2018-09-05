// user集合

const client = global.MongoClient;
const url = global.cfg.mongoUrl;

// 异步编程的思想:
// 此处看似里入口(index.js)好远(两次跳转), 但仍然属于同步流, 执行先于较早定义的异步函数

module.exports = {
        // 用对象取代零碎参数   // 模型层规范
        login: user => new Promise((resolve, reject) => {
                db.collection("people").findOneAndUpdate(user, {$set:{lastLogin:new Date()}}, (err, people) => {
                    if (err) reject(err);
                    // 否则返回null
                    else resolve(people.value)
                });

        }),

    // 因为logout()不需要和db交互, 所以止步于路由层





    findList: (find, projection, limit, skip) => new Promise((resolve, reject) => {
        db.collection("people").find(find).project(projection).toArray((err, list) => {
            if (err) reject(err);
            else resolve(list)
        });

    }),


    findOne: (where, projection, limit, skip) => new Promise((resolve, reject) => {
        db.collection('people').findOne(where, (err, people) => {
            if (err) reject(err);
            else resolve(people)
        })
    }),



    updateOne: (where, update) => new Promise((resolve, reject) => {
        db.collection('people').updateOne(where, update, (err, log) => {
            log.__proto__.toJSON = undefined
            if (err) reject(err);
            else resolve(log)
        })
    }),

    updateMany: (where, update) => new Promise((resolve, reject) => {
        db.collection('people').updateMany(where, update, (err, log) => {
            log.__proto__.toJSON = undefined
            if (err) reject(err)
            else resolve(log)
        })
    }),



    // 增加新的员工记录
    insertOne: people => new Promise((resolve, reject) => {
        db.collection('people').insertOne(people, (err, log) => {
            log.__proto__.toJSON = undefined
            if (err) reject(err)
            else resolve(log)
        })
    }),

    // 删除文档
    deleteOne: where => new Promise((resolve, reject) => {
        db.collection('people').deleteOne(where, (err, log) => {
            log.__proto__.toJSON = undefined
            if (err) reject(err)
            else resolve(log)
        })
    }),

    deleteMany: where => new Promise((resolve, reject) => {
        db.collection('people').deleteMany(where, (err, log) => {
            log.__proto__.toJSON = undefined
            if (err) reject(err)
            else resolve(log)

        })
    }),

    distinct: key => new Promise((resolve, reject) => {
        db.collection('people').distinct(key).then(list => {
            resolve(list)
        })
    })

}