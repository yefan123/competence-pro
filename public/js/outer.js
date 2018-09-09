(function init() {

    window.user = JSON.parse(localStorage.getItem('user'))
    window.user.last = new Date(user.last)

    // 全局fetch封装
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
        arrow: document.querySelector('#arrow')
    }

    // data ready 
    window.ready = false




    let promiseList = []

    // 公共:skillList
    let p = window.sendFetch({
        url: '/data?get=skillList'
    })
    p.then(({
        list
    }) => {
        window.skillList = list
        getTypeList()
    })
    promiseList.push(p)



    if (user.level === 'staff') {
        let p0 = sendFetch({
            url: '/data?get=peoList',
            body: {
                peo: {
                    _id: user._id
                }
            }
        })
        p0.then(({
            msg,
            list
        }) => {
            window.peoList = list
        })
        let p1 = sendFetch({
            url: '/data?get=roleList',
            body: {
                role: {
                    _id: user.r_id
                }
            }
        })
        p1.then(({
            msg,
            list
        }) => {
            if (msg == 'ok') {
                window.roleList = list
            }
        })
        promiseList.push(p0)
        promiseList.push(p1)



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

        // 计算每个role的peoList并挂在对象之下
        roleList.forEach(role => {
            role.peoList = window.peoList.filter(peo => peo.role_id == role._id)
        });

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
        alert('permission denied :(')
        return
    }
    if (ready) {
        target.appendChild(dom.arrow)
        inner.location.href = url
        sessionStorage.setItem('cur_page', pageList.indexOf(target))
    }
}


function getTypeList() {
    window.typeList = Array.from(new Set(skillList.map(s => s.type)))
}

function format(o) {
    return Object.entries(o).map(en => (en[0] + ':').padEnd(8, ' ') + en[1]).join('\n')
}