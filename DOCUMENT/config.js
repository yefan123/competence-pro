module.exports = {
    port: 80,
    session: {
        "secret": "123",
        "key": "assessment",
        // 2 day
        "maxAge": 2 * (24 * 3600) * 1000
        // 还是避免json吧, 既不能注释也不能放表达式
    },
    server:{
    	ip:'10.88.33.124',
    	username:'bshg',
    	password:'Supcr5@z'
    },mongo: {
        url: "mongodb://geduser:0987poiu@localhost:27017/GED",
        db: 'GED'
    }
}