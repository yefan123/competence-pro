const express = require('express')
const router = express.Router()

const ObjectID = require('mongodb').ObjectID;
const sha1 = require('sha1')

// 注意和表单parser不同(urlencode)
const bodyJsonParser = require("body-parser").json()


const middleware = (req, res, next) => {

    const user = req.session.user

   
        // 添加people
    if (req.query.addPeople) {
        if (user.level == 'staff') return

        let {
            name,
            usern,
            pass,
            role_id,
            level
        } = req.body.people

        try {
            validator.lengthRange.apply(name, [3, 40])
            validator.lengthRange.apply(usern, [3, 40])
            validator.lengthRange.apply(pass, [3, Infinity])
            validator.matchedRegexp.apply(level, [/^(staff|leader)$/])
        } catch (err) {
            res.json({
                msg: err
            })
            return
        }


        // 可以做一个role的存在性检测

        peopleModel.insertOne({
            new: {
                _id: new ObjectID().toString(),
                name,
                usern: usern.toLowerCase(),
                pass_enc: sha1(pass),
                role_id,
                level,
                dept: user.dept,
                last: new Date(),
                skill_l: []
            }
        }).then(({
            res
        }) => {
            refreshBranchList()
            res.json({
                msg: 'ok',
                new: res.ops[0]
            })
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
                res.json({
                    msg: 'ok',
                    log
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


            res.json({
                msg: 'ok',
                peopleDropLog: logList[0],
                aimDropLog: logList[1],
                roleDropLog: logList[2]
            })
        })





    } else if (req.query.addType) {
        if (req.session.user.level !== 'boss') {
            res.status(403).end()
            return
        }
        let {
            name,
            attr
        } = req.body.type

        try {
            validator.lengthRange.apply(name, [2, 40])
            validator.matchedRegexp.apply(attr, [/^(common|specific)$/])
        } catch (err) {
            res.json({
                msg: err
            })
            return
        }

        typeModel.insertOne({
            newOne: t
        }).then(({
            res
        }) => {
            res.json({
                msg: 'ok',
                res: res.result
            })
        })




    } else if (req.query.dropType) {
        if (req.session.user.level !== 'boss') {
            res.status(403).end()
            return
        }
        let t = req.body.type;



        typeModel.findOneAndDelete({
            where: t
        }, {}).then(({
                oldOne
            }) => {
                let $in = oldOne.skillList.map(s => s._id)
                let p0 = peopleModel.updateMany({
                    where: {},
                    update: {
                        $pull: {
                            skillList: {
                                s_id: {
                                    $in
                                }
                            }
                        }
                    }
                })
                let $unset = {}
                oldOne.skillList.forEach(s => {
                    $unset['target.' + s._id] = ''
                });
                let p1 = roleModel.updateMany({
                    where: {},
                    update: {
                        $unset
                    }
                })

                Promise.all([p0, p1]).then(([res1, res2]) => {

                    res.json({
                        msg: 'ok',
                        oldOne,
                        result: {
                            updatePeople: req1.result,
                            updateRole: req2.result
                        }
                    })
                })

            }

        )
    }
}

router.post('/', checkLogin, bodyJsonParser, middleware)


router.get('/', checkLogin, middleware)



module.exports = router