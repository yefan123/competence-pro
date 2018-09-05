(function init() {


    window.mainFrame = document.querySelector('.main')
    window.dataGrid = document.querySelector('#grid-data')
    window.roleListAside = document.querySelector('aside#roleList')
    window.roleDetail = document.querySelector('#role-detail')

    window.radarToggler = document.querySelector('#radarToggler')
    window.radarFrame = document.querySelector('#radarFrame')







    window.typeList = parent.typeList


    // let p1 = parent.sendAjax('GET', '/data?get=roleList').then(list => {



    window.roleList = parent.roleList

    if (parent.user.level === 'leader') {
        openLeaderBoard()
    } else if (parent.user.level === 'boss') {
        openBossBoard()
    }






    roleListAside.addEventListener('click', event => {
        let role_name = event.target.getAttribute('data-role')
        if (role_name) {
            let role = roleList.filter(r => r.name == role_name)[0]
            let peopleOfRole = window.parent.peopleList.filter(p => p.role == role_name)
            tableRender(role, typeList)
            refreshRoleInfo(role)
            let lastOne = event.target.parentNode.querySelector('.active')
            if (lastOne) lastOne.classList.remove('active')
            event.target.classList.add('active')
            if (!radarFrame.classList.contains('none'))
                radarToggler.click()

            mainFrame.focus
        }
    })





    mainFrame.focus()







})();

// 可以叠加同一个事件






function refreshRoleInfo(role) {

    roleDetail.querySelector('[data-detail=name] span.right').innerHTML = role.name
    roleDetail.querySelector('[data-detail=number] span.right').innerHTML = role.peopleList.length


}




function openLeaderBoard() {
    roleListAside.classList.remove('hidden')

    mainFrame.style.width = '68%'
    radarFrame.setAttribute('width', '68%')

    mainFrame.style.left = '16%'
    radarFrame.style.left = '16%'

    loadRoleList(window.roleList)
}


function openBossBoard() {
    openLeaderBoard()
}


function loadRoleList() {
    // console.log()
    for (let role of window.roleList) {

        let button = document.createElement('button')
        button.classList.add('fas')
        button.innerHTML = role.name
        button.setAttribute('data-role', role.name)
        roleListAside.appendChild(button)
        role.peopleList = parent.peopleList.filter(p => p.role == role.name)
    }


}


// 渲染表格
function tableRender(role, typeList) {

    dataGrid.innerHTML = ''





    for (let t of typeList) {
        let row = document.createElement('div')
        row.setAttribute('data-type', t.name)
        row.classList.add('row')


        // 行首
        let typeTitle = document.createElement('div')
        typeTitle.classList.add('type_name')
        typeTitle.innerHTML = " " + t.name
        row.appendChild(typeTitle)

        // skill num
        let skill_num = document.createElement('div')
        skill_num.classList.add('skill_num')
        row.appendChild(skill_num)

        // role aim sum
        let role_aim_sum = document.createElement('div')
        role_aim_sum.classList.add('role_aim_sum')
        row.appendChild(role_aim_sum)

        // personal aim sum
        let personal_aim_sum = document.createElement('div')
        personal_aim_sum.classList.add('my_aim_sum')
        row.appendChild(personal_aim_sum)

        // r sum
        let r_sum = document.createElement('div')
        r_sum.classList.add('r_sum')
        r_sum.classList.add('fas')
        row.appendChild(r_sum)




        let r_value_list = []
        let my_aim_value_list = []
        let role_aim_value_list = []

        let skillsOfType = parent.skillList.filter(s => s.type === t.name)
        skillsOfType.forEach(s => {
            role_aim_value_list.push(s.target[role.name])
            for (let p of role.peopleList) {
                if (!p.skill[s.name]) continue
                r_value_list.push(p.skill[s.name].r)
                my_aim_value_list.push(p.skill[s.name].my_aim)

            }
        })


        if (t.class == 'common') {

            r_sum.innerHTML = getAverage(r_value_list)
            personal_aim_sum.innerHTML = getAverage(my_aim_value_list)
            role_aim_sum.innerHTML = getAverage(role_aim_value_list)


        } else if (t.class == 'specific') {
            r_sum.innerHTML = Math.max(...r_value_list)
            personal_aim_sum.innerHTML = Math.max(...my_aim_value_list)
            role_aim_sum.innerHTML = Math.max(...role_aim_value_list)

            row.classList.add('specific_class')

        }




        skill_num.innerHTML = skillsOfType.length




        dataGrid.appendChild(row)
    }

}



function getAverage(list) {
    if (list.length == 0) return 0
    let all = 0
    list.map(x => {
        all += x
    })
    return (all / list.length).toFixed(1)
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
                    name: 'role aim',
                    value: [],
                    lineColor: "blue",
                    fillColor: 'transparent',
                    lineWidth: 2
                }, {
                    name: 'my aim sum',
                    value: [],
                    lineColor: "yellow",
                    fillColor: 'transparent',
                    lineWidth: 2
                }, {
                    name: 'actual sum',
                    value: [],
                    lineColor: "red",
                    fillColor: 'transparent',
                    lineWidth: 2
                }]
            }
            rowList.slice(i, i + segment).forEach(skill => {
                radar.maxValue.push(5)
                radar.description.push(skill.querySelector('.type_name').parentNode.getAttribute('data-type'))
                radar.inner[0].value.push(skill.querySelector('.role_aim_sum').innerHTML - 0 || 0)
                radar.inner[1].value.push(skill.querySelector('.my_aim_sum').innerHTML - 0 || 0)
                radar.inner[2].value.push(skill.querySelector('.r_sum').innerHTML - 0 || 0)
            })
            radarList.push(radar)
        }

        radarFrame.contentWindow.initAll(radarList)

    }
}