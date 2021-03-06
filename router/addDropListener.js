const express = require('express')
const router = express.Router()

const ObjectID = require('mongodb').ObjectID;
const sha1 = require('sha1')

const middleware = (req, res, next) => {

    const user = req.session.user


    // 添加peo
    if (req.query.addPeo) {
        let {
            name,
            usern,
            pass,
            role_id,
            level
        } = req.body.peo
        usern = usern.toLowerCase()

        try {
            permission.deny.apply(user, ['staff'])
            // 不用检测pass,因为sha1之后是固定长
            validator.lengthRange.apply(name, [2, 50])
            validator.lengthRange.apply(usern, [2, 50])
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
                usern,
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

        try {
            permission.deny.apply(peo, ['boss'])
            permission.deny.apply(user, ['staff'])
        } catch (err) {
            res.json({
                msg: err
            })
            return
        }

        model.peo.findOneAndDelete({
            where: {
                _id: peo._id,
                dept: peo.dept,
                level: peo.level
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

        try {
            permission.allow.apply(user, ['boss'])
            validator.lengthRange.apply(name, [2, 50])
            validator.lengthRange.apply(type, [2, 50])
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

        let {
            name
        } = req.body.role


        try {
            validator.lengthRange.apply(name, [2, 50])
        } catch (err) {
            res.json({
                msg: err
            })
            return
        }


        model.role.insertOne({
            role: {
                _id: new ObjectID().toString(),
                name,
                dept: user.dept,
                tarList: {}
            }
        }).then(({
            role
        }) => {
            res.json({
                msg: 'ok',
                role
            })
        })




    } else if (req.query.dropRole) {
        if (req.session.user.level == 'staff') {
            res.status(403).end()
            return
        }

        let {
            _id
        } = req.body.role

        // // 删除所有的属于role的peo
        // let p1 = peoModel.deleteMany({
        //     role: r.name
        // })

        model.role.findOneAndDelete({
            where: {
                _id,
                dept: user.dept
            }
        }).then(({
            role
        }) => {
            res.json({
                msg: 'ok',
                role
            })
        })

    }
}

router.post('/', checkLogin, bodyJsonParser, middleware)


router.get('/', checkLogin, middleware)



module.exports = router