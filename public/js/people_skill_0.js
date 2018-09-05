(function init() {

    window.currentPeo = undefined


    window.mainFrame = document.querySelector('.main')
    window.dataGrid = document.querySelector('#grid-data')
    window.editor = document.querySelector('#editor')
    window.peopleListAside = document.querySelector('aside#peopleList')
    window.peopleDetail = document.querySelector('#people-detail')

    window.radarToggler = document.querySelector('#radarToggler')
    window.submitButton = document.querySelector('#submit')
    window.addNewBtn = document.querySelector('#people-detail [data-detail=add]')
    window.updateEditor = document.querySelector('#updateEditor')
    window.addEditor = document.querySelector('#addEditor')
    window.radarFrame = document.querySelector('#radarFrame')




    dataGrid.addEventListener('click', event => {
        let ta = event.target
        let skillName = ta.parentNode.getAttribute('data-skill')

        window.currentSkill = parent.skillList.find(s => s.name == skillName)
        peopleDetail.querySelector('#skill_desc').innerHTML = `${currentSkill.name}:<br>${currentSkill.desc}`

        if (!ta.classList.contains('revisable')) return
        // 当前待修改的字段

        let init = {
            my_aim: ta.parentNode.querySelector('.my_aim').innerHTML,
            r: ta.parentNode.querySelector('.r').innerHTML,
            a: ta.parentNode.querySelector('.a').innerHTML,
            detail: ta.parentNode.querySelector('.detail').innerHTML,
            c: ta.parentNode.querySelector('.c').innerHTML
        }

        if (!ta.classList.contains('revisable')) return

        if (ta.classList.contains('detail')) {
            init.focus = '.detail'
        } else if (ta.classList.contains('r')) {
            init.focus = '.r'
        } else if (ta.classList.contains('my_aim')) {
            init.focus = '.my_aim'
        } else if (ta.classList.contains('a')) {
            init.focus = '.a'
        } else if (ta.classList.contains('s')) {
            init.focus = '.s'
        } else if (ta.classList.contains('c')) {
            init.focus = '.c'
        }

        openEditor('update', init)



    })




    editor.addEventListener('keydown', e => {
        // if (e.key === 'Enter') currentEditor.querySelector('.submit').click()
        if (e.key === 'Escape') currentEditor.querySelector('.cancel').click()
    })

    updateEditor.addEventListener('click', event => {
        // 阻止事件冒泡
        event.stopPropagation();
    })
    addEditor.addEventListener('click', event => {
        event.stopPropagation();
    })




    peopleListAside.addEventListener('click', event => {
        let people_id = event.target.getAttribute('data-people_id')
        if (people_id) {
            // 同一个对象(面向对象)
            parent.sendAjax('GET', '/data?get=people&_idStr=' + people_id).then(p => {

                window.currentPeo = p;
                window.parent.peopleList.filter(p => p._id == people_id)[0] = p
                tableRender(window.currentPeo, parent.skillList)
                refreshPeopleInfo()
                let lastOne = event.target.parentNode.querySelector('.active')
                if (lastOne) lastOne.classList.remove('active')
                event.target.classList.add('active')
                if (!radarFrame.classList.contains('none'))
                    radarToggler.click()

                mainFrame.focus()
            })
        }
    })





    mainFrame.addEventListener('scroll', event => {
        head.style.top = mainFrame.scrollTop + 'px'
    })


    mainFrame.focus()







})();

// 可以叠加同一个事件






function openEditor(mode, param) {
    editor.style.display = 'flex'
    updateEditor.style.display = 'none'
    addEditor.style.display = 'none'
    if (mode === 'update') {
        window.currentEditor = updateEditor
        updateEditor.style.display = 'block'
        updateEditor.querySelector('.loading').innerHTML = ''
        updateEditor.querySelector('.my_aim').value = param.my_aim
        updateEditor.querySelector('.r').value = param.r
        updateEditor.querySelector('.a').value = param.a
        updateEditor.querySelector('.detail').value = param.detail
        updateEditor.querySelector('.c').value = param.c
        updateEditor.querySelector('.skill').value = window.currentSkill.name
        updateEditor.querySelector(param.focus).focus()


    } else if (mode === 'add') {
        window.currentEditor = addEditor
        addEditor.style.display = 'block'
        addEditor.querySelector('.loading').innerHTML = ''
        addEditor.querySelector('.branch').value = parent.user.branch
        addEditor.querySelector('.name').focus()
    }
}






// 更新右侧边栏
function refreshPeopleInfo() {

    peopleDetail.querySelector('[data-detail=name] ').innerHTML = currentPeo.name
    peopleDetail.querySelector('[data-detail=username] ').innerHTML = currentPeo.username
    peopleDetail.querySelector('[data-detail=branch] ').innerHTML = parent.user.branch
    peopleDetail.querySelector('[data-detail=role] ').innerHTML = currentPeo.role || '( leader )'


}






// 基于people和skill
function sendUpdate() {


    let param = {
        where: {
            // _id: currentPeo._id,
            username: currentPeo.username
        },
        update: {
            $set: {

            }
        }
    }


    let skillName = currentSkill.name
    param.update.$set[`skill.${skillName}.my_aim`] = updateEditor.querySelector('.my_aim').value - 0
    param.update.$set[`skill.${skillName}.r`] = updateEditor.querySelector('.r').value - 0
    param.update.$set[`skill.${skillName}.a`] = updateEditor.querySelector('.a').value
    param.update.$set[`skill.${skillName}.s`] = updateEditor.querySelector('.s').value
    param.update.$set[`skill.${skillName}.detail`] = updateEditor.querySelector('.detail').value
    param.update.$set[`skill.${skillName}.c`] = updateEditor.querySelector('.c').value


    updateEditor.querySelector('.loading').innerHTML = 'loading...'

    parent.sendAjax('POST', '/update?updatePeople=1', param).then(data => {
        if (data.msg == 'ok') {
            editor.click()
            if (parent.user.level == 'staff') location.reload()
            else peopleListAside.querySelector(`button[data-people_id="${currentPeo._id}"]`).click()
        }

    })
}



// 添加新用户
function sendAdd() {
    let people = {
        name: addEditor.querySelector('.name').value,
        username: addEditor.querySelector('.username').value,
        password: addEditor.querySelector('.password').value,
        branch: addEditor.querySelector('.branch').value,
        role: addEditor.querySelector('.role').value,
    }
    addEditor.querySelector('.loading').innerHTML = 'waiting...'
    parent.sendAjax('POST', '/update?addPeople=1', {
        people
    }).then(res => {
        if (res.msg === 'ok') {
            alert(`new staff '${people.name}' added successfully
                username: ${people.username}
                password: ${people.password}`)
            parent.location.reload()
        } else {
            alert(res.msg)
            addEditor.querySelector('.loading').innerHTML = ''
        }
    })
}



// update语句可以顺便改变类型




// 删除员工
function dropPeople(people) {
    if (!currentPeo) {
        alert('choose one people first')
        return
    }
    if (people.level == 'boss') {
        alert('sorry but root account cannot be deleted :(')
        return
    }
    if (!confirm(`CAUTION THIS OPERATION IS IRREVERSIBLE !!
        R U SURE TO DELETE ${people.level.toUpperCase()} '${people.name}' ANYWAY ??`)) return

    parent.sendAjax('POST', '/update?dropPeople=1', {
        people
    }).then(res => {
        if (res.msg === 'ok' && res.log.deletedCount == 1) {

            alert(`${people.level} ${people.name} droped forever .`)
            // 可优化
            parent.location.reload()
        }
    })



}




function openNormalBoard() {
    // 普通员工界面
    // getPeopleAndRender(undefined)

    document.querySelector('#dropPeople').remove()

    parent.sendAjax('GET', '/data?get=people&_idStr=' + parent.user._id).then(myself => {
        window.currentPeo = myself
        tableRender(currentPeo, parent.skillList)
        refreshPeopleInfo()
    })


    mainFrame.style.width = '80%'
    radarFrame.setAttribute('width', '80%')

    mainFrame.style.left = '1%'
    radarFrame.style.left = '1%'

    document.querySelector('#switchUserBtn').remove()

}
// the js function can never be too much


function openLeaderBoard() {
    document.querySelectorAll('aside.hidden').forEach(e => {
        e.classList.remove('hidden')
    });

    mainFrame.style.width = '68%'
    radarFrame.setAttribute('width', '68%')

    mainFrame.style.left = '16%'
    radarFrame.style.left = '16%'

    loadPeopleList(window.parent.peopleList)
}


function openBossBoard() {
    openLeaderBoard()
}


function loadPeopleList(peopleList) {
    for (let p of peopleList) {
        let button = document.createElement('button')
        button.classList.add('fas')
        button.innerHTML = p.name
        if (p.level !== 'staff') {
            button.classList.add('leader')
        }
        button.setAttribute('data-people_id', p._id)
        peopleListAside.appendChild(button)
    }


}


// 渲染表格
function tableRender(people, skillList) {

    dataGrid.innerHTML = ''





    for (let s of skillList) {
        let row = document.createElement('div')
        row.setAttribute('data-skill', s.name)
        row.classList.add('row')
        if (s.class == 'specific') row.classList.add('specific_class')


        // 行首
        let skill = document.createElement('div')
        skill.classList.add('skill-name')
        skill.innerHTML = s.name
        row.appendChild(skill)



        // role-target
        let role_aim = document.createElement('div')
        role_aim.classList.add('role_aim')
        role_aim.innerHTML = s.target[people.role]
        row.appendChild(role_aim)

        // my-aim
        let my_aim = document.createElement('div')
        my_aim.classList.add('my_aim')
        my_aim.classList.add('revisable')
        row.appendChild(my_aim)

        // r data
        let r = document.createElement('div')
        r.classList.add('revisable')
        r.classList.add('r')
        r.classList.add('fas')
        row.appendChild(r)

        // action
        let a = document.createElement('div')
        a.classList.add('a')
        a.classList.add('revisable')
        row.appendChild(a)

        // action status
        let status = document.createElement('div')
        status.classList.add('s')
        status.classList.add('revisable')
        row.appendChild(status)

        // actions detail
        let detail = document.createElement('div')
        detail.classList.add('detail')
        detail.classList.add('revisable')
        row.appendChild(detail)


        // comment
        let c = document.createElement('div')
        c.classList.add('c')
        c.classList.add('revisable')
        row.appendChild(c)




        if (people.skill[s.name]) {
            r.innerHTML = people.skill[s.name].r
            my_aim.innerHTML = people.skill[s.name].my_aim
            a.innerHTML = people.skill[s.name].a || ''
            status.innerHTML = people.skill[s.name].s || ''
            c.innerHTML = people.skill[s.name].c || ''
            detail.innerHTML = people.skill[s.name].detail || ''
        }



        dataGrid.appendChild(row)
    }

}




function toggleRadar(segment = 7) {
    mainFrame.classList.toggle('none')
    if (radarFrame.classList.toggle('none')) {
        mainFrame.focus()
    } else {

        let rowList = Array.from(dataGrid.querySelectorAll('.row'))
        let radarList = []
        for (let i = 0; i < rowList.length; i += segment) {
            let radar = {
                maxValue: [],
                description: [],
                inner: [{
                    name: 'role target',
                    value: [],
                    lineColor: "blue",
                    fillColor: 'transparent',
                    lineWidth: 2
                }, {
                    name: 'my target',
                    value: [],
                    lineColor: "yellow",
                    fillColor: 'transparent',
                    lineWidth: 2
                }, {
                    name: 'r',
                    value: [],
                    lineColor: "red",
                    fillColor: 'transparent',
                    lineWidth: 2
                }]
            }
            rowList.slice(i, i + segment).forEach(skill => {
                radar.maxValue.push(5)
                radar.description.push(skill.querySelector('.skill-name').innerHTML)
                radar.inner[0].value.push(skill.querySelector('.role_aim').innerHTML - 0 || 0)
                radar.inner[1].value.push(skill.querySelector('.my_aim').innerHTML - 0 || 0)
                radar.inner[2].value.push(skill.querySelector('.r').innerHTML - 0 || 0)
            })
            radarList.push(radar)
        }

        // 可以直接和radarFrame传递对象(无需序列化)
        // console.log(radarList)
        radarFrame.contentWindow.initAll(radarList)

    }
}

// 临时切换用户
function switchUser(user) {
    if (!user) {
        alert('choose one user first')
        return
    }

    parent.sendAjax('POST', '/log?switchUser=1', {
        user
    }).then(res => {
        if (res.msg == 'ok') {
            parent.location.reload()
        }
    })
}