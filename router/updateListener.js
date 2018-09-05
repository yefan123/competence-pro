const express = require('express')
const router = express.Router()
const peopleModel = require('../model/peopleModel')
const roleModel = require('../model/roleModel')
const skillModel = require('../model/skillModel')
const typeModel = require('../model/typeModel')
const ObjectID = require('mongodb').ObjectID;
const sha1 = require('sha1')

// 注意和表单parser不同(urlencode)
const bodyJsonParser = require("body-parser").json()


const middleware = (req, res, next) => {

    const user = req.session.user

    if (req.query.updatePeople) {


        const {
            where,
            update
        } = req.body

        // where._id = ObjectID(where._id)
        // 用username替代主键

        if (where.username !== user.username && user.level == 'staff') {
            res.status(403).end()
            return
        }

        let resultPro = peopleModel.updateOne(where, update)
        resultPro.then(log => {
            res.json({
                msg: 'ok',
                log
            })
        })
        resultPro.catch(err => {
            console.log(err)
        })



        // 添加people
    } else if (req.query.addPeople) {
        if (user.level == 'staff') return

        let pp = req.body.people
        let p = {
            name: pp.name || '0',
            username: pp.username || '0',
            password: pp.password || '0',
            role: pp.role,
            branch: pp.branch || user.branch,
            branchList: pp.branchList,
            level: pp.level || 'staff',
            lastLogin: new Date(),
            skill: {},
        }

        p.cryptedPas = sha1(p.password)



        try {
            validator.lengthRange.apply(p.name, [3, 16])
            validator.lengthRange.apply(p.username, [3, 25])
            validator.matchedRegexp.apply(p.username, [/^[0-9a-zA-Z_@#\. ]*$/g])
            validator.lengthRange.apply(p.password, [3, 25])
        } catch (err) {
            res.json({
                msg: err
            })
            return
        }

        p.username = p.username.toLowerCase()

        if (p.level == 'leader') {
            if (user.level !== 'boss') return
            if (p.branchList)
                p.branch = p.branchList[0]
            else return
        } else if (p.level == 'staff') {
            delete p.branchList
        }


        delete p.password

        let p0 = roleModel.findOne({
            name: p.role
        })


        let p1 = peopleModel.findOne({
            username: p.username
        })

        Promise.all([p0, p1]).then(results => {

            if (!results[0]) {
                res.json({
                    msg: `oops the role '${p.role}' seems missing, create a role at the 'target' tab first`
                })
            } else if (results[1]) {
                res.json({
                    msg: `oops the username '${p.username}' has already been taken, try another pls :)`
                })
            } else {

                peopleModel.insertOne(p).then(log => {
                    // refreshBranchList()
                    res.json({
                        msg: 'ok',
                        log
                    })
                })
            }
        })


        // 删除people
    } else if (req.query.dropPeople) {

        let p = req.body.people
        let people = {
            name: p.name,
            username: p.username,
            _id: p._id,
            level: p.level
        }
        people._id = ObjectID(people._id)
        // 同一时间只能操作同一个branch
        people.branch = user.branch

        if (people.level == 'boss') {
            res.json({
                msg: 'permission denied'
            })
            return
        }
        peopleModel.deleteOne(people).then(log => {
            res.json({
                msg: 'ok',
                log
            })
        })



        // add skill
    } else if (req.query.addSkill) {

        let s = req.body.skill


        if (req.session.user.level !== 'boss') {
            res.status(403).end()
            return
        }

        try {
            // validator.matchedRegexp.apply(s.name, [/^[0-9a-zA-Z_@# \/]*$/g])
            validator.lengthRange.apply(s.name, [3, 40])
        } catch (err) {
            res.json({
                msg: err
            })
            return
        }

        let p1 = skillModel.findOne({
            name: s.name
        })

        let p2 = typeModel.findOne({
            name: s.type
        })


        Promise.all([p1, p2]).then(results => {
            if (results[0]) {
                res.json({
                    msg: `ERROR: COMPETENCE NAME '${s.name}' ALREADY EXISTS !
                        TRY ANOTHER ONE PLS :)`
                })
                return
            }
            if (!results[1]) {
                res.json({
                    msg: 'error: type unexisted !'
                })
                return
            }

            // skill的class为type的class(反范式?)
            s.class = results[1].class

            skillModel.insertOne(s).then(log => {
                res.json({
                    msg: 'ok',
                    log
                })
            })
        })




    } else if (req.query.dropSkill) {
        if (req.session.user.level !== 'boss') {
            res.status(403).end()
            return
        }

        let s = req.body.skill



        let $unset = {}
        $unset[`skill.${s.name}`] = ''

        let p1 = peopleModel.updateMany({}, {
            $unset
        })



        let p2 = skillModel.deleteOne(s)
        Promise.all([p1, p2]).then(logList => {
            res.json({
                msg: 'ok',
                valueDropLog: logList[0],
                skillDropLog: logList[1]
            })
        })




        // add role
    } else if (req.query.addRole) {

        if (req.session.user.level == 'staff') {
            res.status(403).end()
            return
        }

        let r = req.body.role



        try {
            // '-'是正则特殊字符
            // validator.matchedRegexp.apply(r.name, [/^[0-9a-zA-Z_\- ]*$/g])
            validator.lengthRange.apply(r.name, [3, 40])
        } catch (err) {
            res.json({
                msg: err
            })
            return
        }


        roleModel.findOne({
            name: r.name
        }).then(role => {
            if (role) {
                res.json({
                    msg: `ERROR: ROLE NAME '${r.name}' ALREADY EXISTS !
                        TRY ANOTHER ONE PLS :)`
                })
                return
            }
            let newRole = {
                name: r.name,
                branch: req.session.user.branch
            }
            roleModel.insertOne(newRole).then(log => {
                refreshBranchList()
                global.refreshRoleList().then(() => {
                    res.json({
                        msg: 'ok',
                        log
                    })
                })
            })
        })




    } else if (req.query.dropRole) {
        if (req.session.user.level == 'staff') {
            res.status(403).end()
            return
        }

        let r = req.body.role

        // 删除所有的属于role的people
        let p1 = peopleModel.deleteMany({
            role: r.name
        })

        // 删除所有的target
        let $unset = {}
        $unset[`target.${r.name}`] = ''
        let p2 = skillModel.updateMany({}, {
            $unset
        })

        let p3 = roleModel.deleteOne({
            name: r.name,
            branch: req.session.user.branch

        })

        Promise.all([p1, p2, p3]).then(logList => {

            global.refreshRoleList().then(() => {

                res.json({
                    msg: 'ok',
                    peopleDropLog: logList[0],
                    aimDropLog: logList[1],
                    roleDropLog: logList[2]
                })
            })
        })





    } else if (req.query.updateTarget) {


        if (req.session.user.level == 'staff') {
            res.status(403).end()
            return
        }

        const {
            where,
            update
        } = req.body

        skillModel.updateOne(where, update).then(() => {
            res.json({
                msg: 'ok'
            })
        })





    } else if (req.query.addType) {
        if (req.session.user.level !== 'boss') {
            res.status(403).end()
            return
        }
        let t = req.body.type
        if (['common', 'specific'].indexOf(t.class) == -1) {
            res.status(500).end()
            return

        }
        typeModel.findOne({
            name: t.name
        }).then(type => {
            if (type) {
                res.json({
                    msg: `ERROR: TYPE NAME '${t.name}' ALREADY EXISTS !
                        TRY ANOTHER PLS :-)`
                })
                return
            } else {
                if (['common', 'specific'].indexOf(t.class) !== -1) {
                    typeModel.insertOne(t).then(log => {
                        global.refreshTypeList().then(() => {
                            res.json({
                                msg: 'ok',
                                log
                            })
                        })
                    })
                }
            }
        })



    } else if (req.query.dropType) {
        if (req.session.user.level !== 'boss') {
            res.status(403).end()
            return
        }
        let t = req.body.type;


        (async function del3() {




            let peopleLog = await new Promise((resolve, reject) => {
                skillModel.find({
                    type: t.name
                }, {
                    name: 1,
                    _id: 0
                }).then(list => {
                    if (list.length == 0) {
                        resolve({
                            modifiedCount: 0
                        })
                        return
                    }
                    let $unset = {}
                    for (let s of list) {
                        $unset[`skill.${s.name}`] = ''
                    }
                    peopleModel.updateMany({}, {
                        $unset
                    }).then(log => resolve(log))
                })
            })
            let skillLog = await skillModel.deleteMany({
                type: t.name
            })
            let typeLog = await typeModel.deleteOne(t)
            await global.refreshTypeList()

            res.json({
                msg: 'ok',
                peopleLog,
                skillLog,
                typeLog
            })
        })();


    }

}

router.post('/', checkLogin, bodyJsonParser, middleware)


router.get('/', checkLogin, middleware)



module.exports = router