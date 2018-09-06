module.exports = {
    server: {
        port: 8080
    },
    session: {
        secret: "123",
        key: "competence",
        // 2 day
        maxAge: 2 * (24 * 3600) * 1000
    },
    mongo: {
        url: "mongodb://localhost:27017/competence",
        port: 27017,
        db: 'competence'
    },
    app: {
        name: 'skill pro',
        version: '3.0.0'
    }
}