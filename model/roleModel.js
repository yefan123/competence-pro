// role表和type表





module.exports = {


    // 因为logout()不需要和db交互, 所以止步于路由层





    find: (find, projection, limit, skip) => new Promise((resolve, reject) => {
        global.db.collection("role").find(find).project(projection).toArray((err, list) => {
            if (err) throw err;
            resolve(list)
        });

    }),


    findOne: (where, projection, limit, skip) => new Promise((resolve, reject) => {
        db.collection('role').findOne(where, (err, result) => {
            if (err) throw err;
            resolve(result)
        })
    }),



    updateOne: (where, update) => new Promise((resolve, reject) => {
        db.collection('role').updateOne(where, update, (err, result) => {
            if (err) reject(err);
            resolve(result)
        })
    }),




    // 增加新的role
    insertOne: role => new Promise((resolve, reject) => {
        db.collection('role').insertOne(role, (err, log) => {
            log.__proto__.toJSON = undefined
            if (err) reject(err)
            else resolve(log)
        })
    }),

    // 删除文档
    deleteOne: where => new Promise((resolve, reject) => {
        db.collection('role').deleteOne(where, (err, log) => {
            if (err) reject(err)
            log.__proto__.toJSON = undefined
            resolve(log)
        })
    }),

    distinct: key => new Promise((resolve, reject) => {
        db.collection('role').distinct(key).then(list => {
            resolve(list)
        })
    })





}