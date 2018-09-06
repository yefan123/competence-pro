module.exports = {


    // 因为logout()不需要和db交互, 所以止步于路由层





    findMany: info => new Promise((res, rej) => {
        const options = {
            skip: info.skip || 0,
            limit: info.limit || undefined,
            projection: info.proj || undefined,
            sort: info.sort || undefined
        }
        global.db.collection("type").find(info.where, options).toArray((err, list) => {
            if (err) rej(err);
            else res(list)
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

    findOneAndDelete: ({
        where,
        option = {}
    }) => new Promise((res, rej) => {
        db.collection('type').findOneAndDelete(where, option, (err, result) => {
            if (err) rej(err)
            else res({
                oldOne: result.value
            })
        })
    }),




}