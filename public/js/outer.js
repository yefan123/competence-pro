(function init() {

    window.user = JSON.parse(localStorage.getItem('user'))
    window.user.last = new Date(user.last)


    window.sendFetch = ({
        url,
        body
    }) => fetch(url, {
        body: JSON.stringify(body),
        // 统一统一
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json())


    window.inner = window.frames[0]


    window.dom = {
        arrow: document.createElement('div')
    }
    dom.arrow.classList.add('fas')
    dom.arrow.classList.add('fa-sort-down')

    // data ready 
    window.ready = false




    let promiseList = []

    // 公共
    let p = window.sendFetch({
        url: '/data?get=typeList'
    })
    p.then(({
        list
    }) => {
        window.typeList = list
    })
    promiseList.push(p)


    if (user.level === 'staff') {
        let p = fetch('/data?get=role', {
            body: JSON.stringify({
                role: {
                    _id: user.r_id
                }
            }),
            headers: {
                'content-type': 'application/json'
            },
            method: 'POST',
            credentials: 'include'
        }).then(res => res.json())
        promiseList.push(p)
        p.then(({
            msg,
            role
        }) => {
            if (msg == 'ok') {
                window.role = role
            }
        })

    } else if (user.level === 'leader') {
        let p0 = sendFetch({
            url: '/data?get=peoList'
        })
        p0.then(({
            list
        }) => {
            window.peoList = list
        })
        let p1 = sendFetch({
            url: '/data?get=roleList'
        })
        p1.then(({
            list
        }) => {
            window.roleList = list
        })
        promiseList.push(p0)
        promiseList.push(p1)
    } else if (user.level === 'boss') {
        let p0 = sendFetch({
            url: '/data?get=peoList'
        })
        p0.then(({
            list
        }) => {
            window.peoList = list
        })
        let p1 = sendFetch({
            url: '/data?get=roleList'
        })
        p1.then(({
            list
        }) => {
            window.roleList = list
        })
        let p2 = sendFetch({
            url: '/data?get=deptList'
        })
        p2.then(({
            list
        }) => {
            window.deptList = list
        })
        promiseList.push(p0)
        promiseList.push(p1)
        promiseList.push(p2)
    }





    Promise.all(promiseList).then(results => {

        window.pageList = Array.from(document.querySelectorAll('#menu button'))

        window.ready = true
        if (sessionStorage.cur_page)
            window.pageList[parseInt(sessionStorage.getItem('cur_page'))].click()
        else window.pageList[0].click()
    })




})();





// 切换页面
function switchInner(url, target, bannedLevels) {
    if (bannedLevels && bannedLevels.includes(user.level)) {
        alert('sorry but only leader could access this tab :(')
        return
    }
    if (ready) {
        target.appendChild(dom.arrow)
        inner.location.href = url
        sessionStorage.setItem('cur_page', pageList.indexOf(target))
    }
}