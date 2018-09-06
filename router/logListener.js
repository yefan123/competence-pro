// outer层面

const sha1 = require('sha1')
const express = require('express')
const router = express.Router()

const peopleModel = require('../model/peopleModel')

// 因为post的body默认是没有格式的
// const bodyParser = require("body-parser").urlencoded({
//     extended: false
// })

const bodyJsonParser = require("body-parser").json()


// 对象想要存储在硬盘上或者传输在http中必须以字符串的形式!!!


router.post('/', bodyJsonParser, middleware)


// 这里的'/'是根据是上一层的路径
// 比如上一次是'/test',这里也是'/test',最终匹配的就是/test/test
router.get('/', middleware)





function middleware(req, res, next) {

    const user = req.session.user

    // login
    if (req.query.login) {

        const {
            usern,
            pass
        } = req.body.user


        peopleModel.login({
            // js的数据类型一定要和mongo中的一致
            // 用户名和密码统一用string吧, 省的以后麻烦
            usern: usern.toLowerCase(),
            pass
        }).then(({
            user
        }) => {
            if (!user) {
                res.json({
                    msg: 'OOPS SORRY BUT COULDNT FIND MATCHED USER !!'
                })
                return
            }
            // 登录成功
            req.session.user = user
            console.log(user.name)
            console.log(req.ip)
            console.log(new Date().toDateString())
            res.json({
                msg: 'ok',
                user
            })
        })



        // logout
    } else if (req.query.logout) {
        req.session.user = null;
        res.render('login.ejs', {
            msg: 'logout successfully'
        })



        // 切换部门
    } else if (req.query.switchBranch) {
        if (req.session.user.level == 'staff') {
            res.status(403).end()
            return
        }
        if (user.level == 'leader' && !user.branchList.includes(req.query.switchBranch)) {
            res.status(403).end()
        }
        peopleModel.updateOne({
            username: user.username,
            branch: user.branch
        }, {
            $set: {
                branch: req.query.switchBranch
            }
        })
        req.session.user.branch = req.query.switchBranch
        res.redirect('/')



        // 切换用户
    } else if (req.query.switchUser) {
        if (req.session.user.level == 'staff') {
            res.status(403).end()
            return
        }
        let newUser = req.body.user
        peopleModel.login({
            username: newUser.username
        }).then(user => {
            if (user) {
                req.session.user = user
                res.json({
                    msg: 'ok'
                })
            }
        })
    }

}






module.exports = router




//    "<%= %>"会将标签转义成html字符,比如尖括号