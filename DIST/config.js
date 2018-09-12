module.exports = {
    session: {
        secret: "123",
        key: "competence",
        // 7 day
        maxAge: 7 * (24 * 3600) * 1000
        // 还是避免json吧, 既不能注释也不能放表达式
    },
    server: {
        port: 80,
        ip: '10.88.33.124',
        domain: 'naaslxrgedcom01.bsh.corp.bshg.com',
        username: 'bshg',
        password: 'Supcr5@z'
    },
    mongo: {
        url: "mongodb://geduser:0987poiu@localhost:27017/GED",
        db: 'GED',
        port: 27017
    },
    app: {
        name: 'skill pro',
        version: '3.0.4'
    }
}