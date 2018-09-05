(function init() {

    window.sendAjax = function (method, url, data) {
        return new Promise((resolve, reject) => {

            let ajax = new XMLHttpRequest();
            ajax.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    let data = JSON.parse(this.responseText)
                    resolve(data)
                }
            };
            ajax.open(method, url, true);
            ajax.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            ajax.send(JSON.stringify(data));
        })
    }


    window.innerWindow = window.frames[0]


    window.tabArrow = document.createElement('div')
    tabArrow.classList.add('fas')
    tabArrow.classList.add('fa-sort-down')

    window.dataReady = false



    window.userPro = window.sendAjax('GET', '/data?get=user')
    window.skillListPro = window.sendAjax('GET', '/data?get=skillList')
    window.typeListPro = window.sendAjax('GET', '/data?get=typeList')
    window.roleListPro = window.sendAjax('GET', '/data?get=roleList')

    window.promiseList = []
    promiseList.push(userPro)
    promiseList.push(skillListPro)
    promiseList.push(typeListPro)
    promiseList.push(roleListPro)

    userPro.then(user => {
        window.user = user

        if (user.level === 'staff') {
            openNormalBoard()
        } else if (user.level === 'leader') {
            openLeaderBoard()
        } else if (user.level === 'boss') {
            openBossBoard()
        }
    })

    skillListPro.then(list => {
        window.skillList = list
    })

    typeListPro.then(list => {
        window.typeList = list
    })

    roleListPro.then(list => {
        window.roleList = list
    })

    Promise.all(promiseList).then(results => {

        window.tabList = Array.from(document.querySelectorAll('#menu button'))

        window.dataReady = true
        if (sessionStorage.currentTabIndex)
            window.tabList[parseInt(sessionStorage.getItem('currentTabIndex'))].click()
        else window.tabList[0].click()
    })




})();




function openNormalBoard() {}


function openLeaderBoard() {
    window.peopleListPro = window.sendAjax('GET', '/data?get=peopleList')
    peopleListPro.then(list => {
        window.peopleList = list
    })
    promiseList.push(peopleListPro)
}

function openBossBoard() {
    openLeaderBoard()
}


// 切换页面
function switchInner(url, target, bannedLevels) {
    if (bannedLevels && bannedLevels.includes(parent.user.level)) {
        alert('sorry but only leader could access this tab :(')
        return
    }
    if (dataReady) {
        target.appendChild(tabArrow)
        innerWindow.location.href = url
        sessionStorage.setItem('currentTabIndex', tabList.indexOf(target))
    }
}