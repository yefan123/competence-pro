// user集合

const client = global.MongoClient;
const url = global.cfg.mongoUrl;

// 异步编程的思想:
// 此处看似里入口(index.js)好远(两次跳转), 但仍然属于同步流, 执行先于较早定义的异步函数

module.exports = {
    login: user => new Promise((res, rej) => {
        // 更新并返回更新前的数据
        db.collection("people").findOneAndUpdate(user, {
            $set: {
                last: new Date()
            }
        }, {
            returnOriginal: true
        }, (err, result) => {
            if (err) rej(err);
            // 否则返回null
            else res({
                user: result.value
            })
        });

    }),


    // 因为logout()不需要和db交互, 所以止步于路由层





    findMany: info => new Promise((res, rej) => {
        const options = {
            skip: info.skip || 0,
            limit: info.limit || undefined,
            proj: info.proj || undefined,
            sort: info.sort || undefined
        }
        global.db.collection("people").find(info.where, options).toArray((err, list) => {
            if (err) rej(err);
            else res(list)
        });

    }),


    findOne: (where, proj, limit, skip) => new Promise((resolve, reject) => {
        db.collection('people').findOne(where, (err, people) => {
            if (err) reject(err);
            else resolve(people)
        })
    }),



    updateOne: ({
        where,
        up
    }) => new Promise((resolve, reject) => {
        db.collection('people').updateOne(where, up, (err, log) => {
            log.__proto__.toJSON = undefined
            if (err) reject(err);
            else resolve(log)
        })
    }),

    updateMany: ({where, up}) => new Promise((resolve, reject) => {
        db.collection('people').updateMany(where, up, (err, log) => {
            log.__proto__.toJSON = undefined
            if (err) reject(err)
            else resolve(log)
        })
    }),



    // 增加新的员工记录
    insertOne: ({
        what
    }) => new Promise((resolve, reject) => {
        db.collection('people').insertOne(what, (err, log) => {
            log.__proto__.toJSON = undefined
            if (err) reject(err)
            else resolve({
                log
            })
        })
    }),

    distinct: key => new Promise((resolve, reject) => {
        db.collection('people').distinct(key).then(list => {
            resolve(list)
        })
    }),

    findOneAndUpdate: ({
        where,
        up,
        opt
    }) => new Promise((res, rej) => {
        db.collection('people').findOneAndUpdate(where, up, opt, (err, result) => {
            if (err) rej(err)
            else res({
                peo: result.value
            })
        })
    }),

    findOneAndDelete: ({
        where
    }) => new Promise((res, rej) => {
        db.collection('people').findOneAndDelete(where, {}, (err, result) => {
            if (err) rej(err)
            else res({
                peo: result.value
            })
        })
    }),

}