const express = require('express')
const router = express.Router()

const ObjectID = require('mongodb').ObjectID;
const sha1 = require('sha1')

// 注意和表单parser不同(urlencode)
const bodyJsonParser = require("body-parser").json()


const middleware = (req, res, next) => {

    const user = req.session.user

    // rowList: pull->push
    if (req.query.setRow) {


        const {
            skill_id,
            my_tar,
            real,
            act,
            act_sta,
            act_de,
            comm
        } = req.body.newRow

        let oldRow = req.body.oldRow

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
            validator.lengthRange.apply(comm, [0, 500])
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
                    rowList: oldRow
                }
            }
        })

        model.peo.updateOne({
            where: {
                _id
            },
            up: {
                $push: {
                    rowList: {
                        skill_id,
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
            pass_old,
            pass_new,
            role_id
        } = req.body.peo
        pass_old = sha1(pass_old)
        pass_new = sha1(pass_new)

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
                _id,
                pass: pass_old
            },
            up: {
                $set: {
                    name: name.toLowerCase(),
                    usern,
                    pass: pass_new,
                    role_id
                }
            },
            opt: {
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
        } = req.body.role

        try {
            validator.lengthRange.apply(name, [2, 40])
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
            up: {
                $set: {
                    name,
                }
            },
            opt: {
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



    } else if (req.query.setSkill) {
        let {
            _id,
            name,
            type,
            desc,
            attr
        } = req.body.skill

        try {
            validator.lengthRange.apply(name, [2, 40])
            validator.lengthRange.apply(desc, [0, 500])
            validator.lengthRange.apply(type, [0, 40])
            validator.matchedRegexp.apply(attr, [/^(common|specific)$/])
        } catch (err) {
            res.json({
                msg: err
            })
            return
        }

        model.skill.findOneAndUpdate({
            where: {
                _id
            },
            up: {
                $set: {
                    name,
                    desc,
                    type,
                    attr
                }
            },
            opt: {
                returnOriginal: false
            }
        }).then(({
            skill
        }) => {
            res.json({
                msg: 'ok',
                skill
            })
        })



    } else if (req.query.setTar) {
        let {
            role_id,
            skill_id,
            value
        } = req.body.param
        // 可以考虑缓存一个_id的list用于检测各种是否存在
        let $set = {}
        $set[`tarList.${skill_id}`] = Number(value)
        model.role.findOneAndUpdate({
            where: {
                _id: role_id
            },
            up: {
                $set
            }
        }).then(() => {
            res.json({
                msg: 'ok'
            })
        }).catch(err => {
            console.log(err)
            res.json({
                msg: err
            })
        })
    }



}

router.post('/', checkLogin, bodyJsonParser, middleware)


router.get('/', checkLogin, middleware)



module.exports = router