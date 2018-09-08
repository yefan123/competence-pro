const express = require('express')
const router = express.Router()




// router.post('/', checkLogin, middleware)


// 这里的'/'是根据是上一层的路径
// 比如上一次是'/test',这里也是'/test',最终匹配的就是/test/test
router.get('/', checkLogin, (req, res, next) => {
    // res.redirect('/view/index')
    res.redirect('/view/main')
})


// 不需要checkLogin
router.get('/login', (req, res, next) => {
    res.render('login.ejs', {
        msg: null
    })
})

router.get('/index', checkLogin, (req, res, next) => {
    res.render('index.ejs', {
        user: req.session.user
    })

})


router.get('/outer', checkLogin, (req, res, next) => {
    res.render('outer.ejs', {
        user: req.session.user

    })
})

router.get('/main', checkLogin, (req, res, next) => {
    res.render('outer.ejs', {
        user: req.session.user

    })
})


router.get('/people', checkLogin, (req, res, next) => {
    res.render('people.ejs', {
        user: req.session.user
    })
})


router.get('/role', checkLogin, (req, res, next) => {
    res.render('role.ejs', {
        user: req.session.user
    })
})






module.exports = router