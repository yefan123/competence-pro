// role表和type表





module.exports = {


    // 因为logout()不需要和db交互, 所以止步于路由层





    findMany: ({
        where,
        projection,
        skip,
        limit,
        sort
    }) => new Promise((res, rej) => {
        const options = {
            skip: skip || 0,
            limit: limit || undefined,
            projection: projection || undefined,
            sort: sort || undefined
        }
        global.db.collection("role").find(where, options).toArray((err, list) => {
            if (err) rej(err);
            else res({
                list
            })
        });

    }),


    findOne: ({
        where,
        proj,
        limit,
        skip
    }) => new Promise((resolve, reject) => {
        db.collection('role').findOne(where, {
            projection: proj,
            limit,
            skip
        }, (err, role) => {
            if (err) throw err;
            resolve({
                role
            })
        })
    }),



    findOneAndUpdate: ({
        where,
        up,
        opt = {}
    }) => new Promise((resolve, reject) => {
        db.collection('role').findOneAndUpdate(where, up, opt, (err, result) => {
            if (err) reject(err);
            resolve({
                role: result.value
            })
        })
    }),




    // 增加新的role
    insertOne: ({
        role
    }) => new Promise((resolve, reject) => {
        db.collection('role').insertOne(role, (err, log) => {
            log.__proto__.toJSON = undefined
            if (err) reject(err)
            else resolve({
                role: log.ops[0]
            })
        })
    }),

    distinct: key => new Promise((resolve, reject) => {
        db.collection('role').distinct(key).then(list => {
            resolve(list)
        })
    }),

    updateMany: info => new Promise((res, rej) => {
        db.collection('role').updateMany(info.where, info.up, (err, log) => {
            log.__proto__.toJSON = undefined
            if (err) rej(err)
            else res(log)
        })
    }),


    findOneAndDelete: ({
        where,
        opt = {}
    }) => new Promise((res, rej) => {
        db.collection('role').findOneAndDelete(where, opt, (err, result) => {
            if (err) rej(err)
            else res({
                role: result.value
            })
        })
    }),






}