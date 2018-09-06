// 处理用户的登录登出


// const sha1 = require('sha1')
const express = require('express')
const router = express.Router()
const ObjectID = require('mongodb').ObjectID
const peopleModel = require('../model/peopleModel')
const roleModel = require('../model/roleModel')
const typeModel = require('../model/typeModel')

// // 因为post的body默认是没有格式的
// const bodyParser = require("body-parser").urlencoded({
//     extended: false
// })


// 对象想要存储在硬盘上或者传输在http中必须以字符串的形式!!!


// router.post('/', bodyParser, middleware)


// 这里的'/'是根据是上一层的路径
// 比如上一次是'/test',这里也是'/test',最终匹配的就是/test/test
router.all('/', checkLogin, middleware)





function middleware(req, res, next) {

    const user = req.session.user

    switch (req.query.get) {
        // myself
        case 'user':
            {
                res.json(user)
                break;
            }
        case 'peoList':
            {
                // 没有peopleListBrief,因为已经部门过滤
                if (user.level == 'staff') return
                model.peo.findMany({
                    where: {
                        dept: user.dept
                    },
                    projection: {
                        _id: 1,
                        name: 1,
                        usern: 1,
                        r_id: 1,
                        skill: 1,
                        level: 1
                    }
                }).then(list => res.json({
                    msg: 'ok',
                    list,
                }))

                break;
            }
            // case 'people':
            //     {
            //         peopleModel.findOne({
            //             _id: ObjectID(req.query._idStr)
            //         }).then(people => {
            //             if (people) {

            //                 res.json(people)
            //             } else res.status(404).end()

            //         })
            //         break;
            //     }
        case 'roleList':
            {
                roleModel.findMany({
                    where: {
                        dept: user.dept
                    }
                }).then(({
                    list
                }) => {
                    res.json({
                        msg: 'ok',
                        list
                    })
                })
                break
            }
        case 'role':
            {
                let role = req.body.role
                roleModel.findOne({
                    role
                }).then(({
                    role
                }) => {
                    if (role) {
                        res.json({
                            msg: 'ok',
                            role
                        })
                    } else {
                        res.json({
                            msg: 'not found'
                        })
                    }
                })
                break
            }
        case 'deptList':
            {
                // 注意,是字符串不是对象
                res.json({
                    list: global.deptList
                })
                break
            }
        case 'typeList':
            {
                model.type.findMany({
                    where: {}
                }).then(list => {
                    res.json({
                        msg: 'ok',
                        list
                    })
                })
                break
            }
        default:
            {
                res.status(404).end()
                break;
            }

    }
}






module.exports = router




//    "<%= %>"会将标签转义成html字符,比如尖括号