const express = require('express')
const router = express.Router()




// router.post('/', checkLogin, middleware)


router.get('/', checkLogin, (req, res, next) => {
    // res.redirect('/view/index')
    res.redirect('/view/main')
})


// 不需要checkLogin
router.get('/login', (req, res, next) => {
    res.render('login.ejs', {})
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