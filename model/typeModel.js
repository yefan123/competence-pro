module.exports = {


    // 因为logout()不需要和db交互, 所以止步于路由层





    find: (find, projection, limit, skip) => new Promise((resolve, reject) => {
        global.db.collection("type").find(find).project(projection).toArray((err, list) => {
            if (err) resolve(err);
            // list may == []
            else resolve(list)
        });

    }),


    findOne: (where, projection, limit, skip) => new Promise((resolve, reject) => {
        db.collection('type').findOne(where, (err, type) => {
            if (err) reject(err);
            else resolve(type)
        })
    }),



    updateOne: (where, update) => new Promise((resolve, reject) => {
        db.collection('type').updateOne(where, update, (err, log) => {
            log.__proto__.toJSON = undefined
            if (err) reject(err);
            resolve(log)
        })
    }),




    insertOne: type => new Promise((resolve, reject) => {
        db.collection('type').insertOne(type, (err, log) => {
            log.__proto__.toJSON = undefined
            if (err) reject(err)
            // console.log(res.result)
            resolve(log)
        })
    }),

    deleteOne: where => new Promise((resolve, reject) => {
        db.collection('type').deleteOne(where, (err, log) => {
            log.__proto__.toJSON = undefined
            if (err) reject(err)
            resolve(log)
        })
    })





}