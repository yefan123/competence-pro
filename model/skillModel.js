// user集合

const url = global.cfg.mongoUrl;

// 异步编程的思想:
// 此处看似里入口(index.js)好远(两次跳转), 但仍然属于同步流, 执行先于较早定义的异步函数

module.exports = {


    // 因为logout()不需要和db交互, 所以止步于路由层





    find: (find, projection, limit, skip) => new Promise((resolve, reject) => {
        global.db.collection("skill").find(find).project(projection).toArray((err, list) => {
            if (err) reject(err);
            else resolve(list)
        });

    }),


    findOne: (where, projection, limit, skip) => new Promise((resolve, reject) => {
        db.collection('skill').findOne(where, (err, result) => {
            if (err) throw err;
            else resolve(result)
        })
    }),



    updateOne: (where, update) => new Promise((resolve, reject) => {
        db.collection('skill').updateOne(where, update, (err, log) => {
            log.__proto__.toJSON = undefined
            if (err) reject(err);
            else resolve(log)
        })
    }),

    updateMany: (where, update) => new Promise((resolve, reject) => {
        db.collection('skill').updateMany(where, update, (err, log) => {
            log.__proto__.toJSON = undefined
            if (err) reject(err)
            else resolve(log)
        })
    }),



    insertOne: skill => new Promise((resolve, reject) => {
        db.collection('skill').insertOne(skill, (err, log) => {
            log.__proto__.toJSON = undefined
            if (err) reject(err)
            else resolve(log)
        })
    }),

    // 删除文档
    deleteOne: where => new Promise((resolve, reject) => {
        db.collection('skill').deleteOne(where, (err, log) => {
            log.__proto__.toJSON = undefined
            if (err) reject(err)
            else resolve(log)
        })
    }),

    deleteMany: where => new Promise((resolve, reject) => {
        db.collection('skill').deleteMany(where, (err, log) => {
            log.__proto__.toJSON = undefined
            if (err) reject(err)
            else resolve(log)

        })
    })













}