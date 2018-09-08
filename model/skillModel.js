module.exports = {


    // 因为logout()不需要和db交互, 所以止步于路由层





    findMany: info => new Promise((res, rej) => {
        const options = {
            skip: info.skip || 0,
            limit: info.limit || undefined,
            projection: info.proj || undefined,
            sort: info.sort || undefined
        }
        global.db.collection("skill").find(info.where, options).toArray((err, list) => {
            if (err) rej(err);
            else res(list)
        });

    }),


    findOne: (where, projection, limit, skip) => new Promise((resolve, reject) => {
        db.collection('skill').findOne(where, (err, skill) => {
            if (err) reject(err);
            else resolve(skill)
        })
    }),



    updateOne: (where, update) => new Promise((resolve, reject) => {
        db.collection('skill').updateOne(where, update, (err, log) => {
            log.__proto__.toJSON = undefined
            if (err) reject(err);
            resolve(log)
        })
    }),




    insertOne: ({
        skill
    }) => new Promise((resolve, reject) => {
        db.collection('skill').insertOne(skill, (err, log) => {
            log.__proto__.toJSON = undefined
            if (err) reject(err)
            resolve({
                skill: log.ops[0]
            })
        })
    }),

    findOneAndDelete: ({
        where,
        opt = {}
    }) => new Promise((res, rej) => {
        db.collection('skill').findOneAndDelete(where, opt, (err, result) => {
            if (err) rej(err)
            else res({
                skill: result.value
            })
        })
    }),


    findOneAndUpdate: ({
        where,
        up,
        opt = {}
    }) => new Promise((res, rej) => {
        db.collection('skill').findOneAndUpdate(where, up, opt, (err, result) => {
            if (err) rej(err)
            else res({
                skill: result.value
            })
        })
    }),


}