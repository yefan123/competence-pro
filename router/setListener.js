const express = require('express')
const router = express.Router()

const ObjectID = require('mongodb').ObjectID;
const sha1 = require('sha1')

// 注意和表单parser不同(urlencode)
const bodyJsonParser = require("body-parser").json()


const middleware = (req, res, next) => {

    const user = req.session.user

    if (req.query.setRow) {


        const {
            my_tar,
            real,
            act,
            act_sta,
            act_de,
            comm
        } = req.body.row

        let old = req.body.old

        let {
            _id
        } = req.body.peo

        if (_id !== user._id && user.level == 'staff') {
            res.status(403).end()
            return
        }

        try {
            validator.numberRange.apply(my_tar)
            validator.numberRange.apply(real)
            validator.lengthRange.apply(act, [0, 100])
            validator.lengthRange.apply(act_sta, [0, 100])
            validator.lengthRange.apply(act_de, [0, 100])
            validator.lengthRange.apply(comm, [0, 100])
        } catch (err) {
            res.json({
                msg: err
            })
            return
        }

        model.peo.updateOne({
            where: {
                _id
            },
            up: {
                $pull: {
                    skillList: old
                }
            }
        })

        model.peo.updateOne({
            where: {
                _id
            },
            up: {
                $push: {
                    skillList: {
                        my_tar,
                        real,
                        act,
                        act_sta,
                        act_de,
                        comm
                    }
                }
            }
        })

        res.json({
            msg: 'ok'
        })


    } else if (req.query.setPeo) {

        let {
            _id,
            name,
            usern,
            pass
        } = req.body.peo

        try {
            validator.lengthRange.apply(name, [2, 40])
            validator.lengthRange.apply(usern, [2, 40])
        } catch (err) {
            res.json({
                msg: err
            })
            return
        }

        model.peo.findOneAndUpdate({
            where: {
                _id
            },
            update: {
                $set: {
                    name,
                    usern,
                    pass
                }
            },
            option: {
                returnOriginal: false
            }
        }).then(({
            peo
        }) => {
            if (peo) {
                res.json({
                    msg: 'ok',
                    peo
                })
            } else res.json({
                msg: `oops nothing changed maybe people not existent`
            })
        })





    } else if (req.query.setRole) {
        let {
            _id,
            name,
            dept
        } = req.body.role

        try {
            validator.lengthRange.apply(name, [2, 40])
            validator.lengthRange.apply(usern, [2, 40])
        } catch (err) {
            res.json({
                msg: err
            })
            return
        }

        model.role.findOneAndUpdate({
            where: {
                _id
            },
            update: {
                $set: {
                    name,
                }
            },
            option: {
                returnOriginal: false
            }
        }).then(({
            role
        }) => {
            if (role) {
                res.json({
                    msg: 'ok',
                    role
                })
            } else res.json({
                msg: `oops nothing changed maybe people not existent`
            })
        })
    } else if (req.query.setType) {

    } else if (req.query.setSkill) {

    } else if (req.query.setTarget) {
        let {
            role_id,
            skill_id,
            value
        } = req.bod.param
        // 可以考虑缓存一个_id的list用于检测各种是否存在
        let $set = {}
        $set[`tarList.${skill_id}`] = value
        model.role.updateOne({
            where: {
                _id: role_id
            },
            up: {
                $set
            }
        })
        res.json({
            msg: 'ok'
        })
    }



}

router.post('/', checkLogin, bodyJsonParser, middleware)


router.get('/', checkLogin, middleware)



module.exports = router