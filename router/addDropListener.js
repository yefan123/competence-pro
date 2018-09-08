const express = require('express')
const router = express.Router()

const ObjectID = require('mongodb').ObjectID;
const sha1 = require('sha1')

// 注意和表单parser不同(urlencode)
const bodyJsonParser = require("body-parser").json()


const middleware = (req, res, next) => {

    const user = req.session.user


    // 添加peo
    if (req.query.addPeo) {
        if (user.level == 'staff') return

        let {
            name,
            usern,
            pass,
            role_id,
            level
        } = req.body.peo

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

        model.peo.insertOne({
            what: {
                _id: new ObjectID().toString(),
                name,
                usern: usern.toLowerCase(),
                pass: sha1(pass),
                role_id,
                level,
                dept: user.dept,
                last: new Date(),
                rowList: []
            }
        }).then(({
            log
        }) => {
            res.json({
                msg: 'ok',
                peo: log.ops[0]
            })
        })


        // 删除peo
    } else if (req.query.dropPeo) {

        let peo = req.body.peo

        // great operation
        peo.dept = user.dept

        if (peo.level == 'boss') {
            res.json({
                msg: 'permission denied'
            })
            return
        }
        model.peo.findOneAndDelete({
            where: {
                _id: peo._id,
                dept: peo.dept
            }
        }).then(({
            peo
        }) => {
            res.json({
                msg: 'ok',
                peo
            })
        })



        // add skill
    } else if (req.query.addSkill) {

        let {
            name,
            type,
            desc,
            attr
        } = req.body.skill


        if (req.session.user.level !== 'boss') {
            res.status(403).end()
            return
        }

        try {
            validator.lengthRange.apply(name, [3, 40])
            validator.lengthRange.apply(type, [3, 40])
            validator.lengthRange.apply(desc, [0, 500])
            validator.matchedRegexp.apply(attr, [/^(common|specific)$/])
        } catch (err) {
            res.json({
                msg: err
            })
            return
        }

        model.skill.insertOne({
            skill: {
                _id: new ObjectID().toString(),
                name,
                type,
                desc,
                attr
            }
        }).then(({
            skill
        }) => {
            res.json({
                msg: 'ok',
                skill
            })
        })



    } else if (req.query.dropSkill) {
        if (req.session.user.level !== 'boss') {
            res.status(403).end()
            return
        }

        let {
            _id
        } = req.body.skill


        model.peo.updateMany({
            where: {},
            up: {
                $pull: {
                    rowList: {
                        skill_id: _id
                    }
                }
            }
        })

        let $unset = {}
        $unset[`tarList.${_id}`] = ''
        model.role.updateMany({
            where: {},
            up: {
                $unset
            }
        })

        model.skill.findOneAndDelete({
            where: {
                _id
            },
        }).then(({
            skill
        }) => {
            res.json({
                msg: 'ok',
                skill
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

        // 删除所有的属于role的peo
        let p1 = peoModel.deleteMany({
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
                peoDropLog: logList[0],
                aimDropLog: logList[1],
                roleDropLog: logList[2]
            })
        })




    }
}

router.post('/', checkLogin, bodyJsonParser, middleware)


router.get('/', checkLogin, middleware)



module.exports = router