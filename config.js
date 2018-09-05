module.exports = {
    port: 8080,
    session: {
        "secret": "123",
        "key": "assessment",
        // 2 day
        "maxAge": 2 * (24 * 3600) * 1000
        // 还是避免json吧, 既不能注释也不能放表达式
    },
    mongo: {
        url: "mongodb://localhost:27017/assessment",
        db: 'assessment'
    }
}