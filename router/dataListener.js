// 处理用户的登录登出


// const sha1 = require('sha1')
const express = require('express')
const router = express.Router()
const ObjectID = require('mongodb').ObjectID
const peopleModel = require('../model/peopleModel')
const skillModel = require('../model/skillModel')
const roleModel = require('../model/roleModel')

// // 因为post的body默认是没有格式的
// const bodyParser = require("body-parser").urlencoded({
//     extended: false
// })


// 对象想要存储在硬盘上或者传输在http中必须以字符串的形式!!!


// router.post('/', bodyParser, middleware)


// 这里的'/'是根据是上一层的路径
// 比如上一次是'/test',这里也是'/test',最终匹配的就是/test/test
router.all('/', middleware)





function middleware(req, res, next) {

    switch (req.query.get) {
        // myself
        case 'user':
            {
                res.json(req.session.user)
                break;
            }
        case 'peopleList':
            {
                if (req.session.user.level !== 'staff')
                    peopleModel.findList({
                        branch: req.session.user.branch
                    }, {
                        _id: 1,
                        name: 1,
                        username: 1,
                        role: 1,
                        skill: 1,
                        level: 1
                    }).then(list => res.json(list))


                break;
            }
        case 'people':
            {
                peopleModel.findOne({
                    _id: ObjectID(req.query._idStr)
                }).then(people => {
                    if (people) {

                        res.json(people)
                    } else res.status(404).end()

                })
                break;
            }
        case 'skillList':
            {
                let project = {
                    class: 1,
                    name: 1,
                    desc: 1,
                    target: 1,
                    type: 1,
                    _id: 0
                }
                if (req.session.user.level == 'staff') {
                    let token = `target.${req.session.user.role}`
                    project[token] = 1
                }


                skillModel.find({}, project).then(list => {
                    res.json(list)
                })



                break;

            }
        case 'roleList':
            {
                res.json(global.roleList.filter(r => r.branch == req.session.user.branch))
                break
            }
        case 'typeList':
            {
                res.json(global.typeList)
                break
            }
        case 'branchList':
            {
                // 注意,是字符串不是对象
                res.json(global.branchList)
                break
            }
        default:
            break;

    }
}






module.exports = router




//    "<%= %>"会将标签转义成html字符,比如尖括号