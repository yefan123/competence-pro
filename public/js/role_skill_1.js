(function init() {


    window.mainFrame = document.querySelector('.main')
    window.dataGrid = document.querySelector('#grid-data')
    // window.editor = document.querySelector('#editor')
    window.roleListAside = document.querySelector('aside#roleListAside')
    window.roleDetail = document.querySelector('#role-detail')

    window.radarToggler = document.querySelector('#radarToggler')
    window.iframe = document.querySelector('#radarFrame')











    roleListAside.addEventListener('click', event => {
        let role_name = event.target.getAttribute('data-role')
        if (role_name) {
            // 同一个对象(面向对象)
            // role对象是一个数组
            let peopleOfRole = window.parent.peopleList.filter(p => p.role == role_name)
            tableRender(role_name, peopleOfRole, parent.skillList)
            refreshRoleInfo(role_name, peopleOfRole)
            let lastOne = event.target.parentNode.querySelector('.invertColor')
            if (lastOne) lastOne.classList.remove('invertColor')
            event.target.classList.add('invertColor')
            if (!iframe.classList.contains('none'))
                radarToggler.click()

            mainFrame.focus
        }
    })





    // parent.sendAjax('GET', '/data?get=roleList').then(list => {
    window.roleList = parent.roleList

    if (parent.user.level === 'leader') {
        openLeaderBoard()
    } else if (parent.user.level === 'boss') {
        openBossBoard()
    }







    mainFrame.focus()







})();

// 可以叠加同一个事件








function refreshRoleInfo(role_name, peopleOfRole) {

    roleDetail.querySelector('[data-detail=name] span.right').innerHTML = role_name
    roleDetail.querySelector('[data-detail=number] span.right').innerHTML = peopleOfRole.length


}











function openLeaderBoard() {
    document.querySelectorAll('aside.hidden').forEach(e => {
        e.classList.remove('hidden')
    });

    mainFrame.style.width = '68%'
    iframe.setAttribute('width', '68%')

    mainFrame.style.left = '16%'
    iframe.style.left = '16%'

    loadRoleList(window.roleList)
}


function openBossBoard() {
    openLeaderBoard()
}


function loadRoleList(roleList) {
    for (let role of roleList) {

        let button = document.createElement('button')
        button.classList.add('fas')
        button.innerHTML = role.name
        button.setAttribute('data-role', role.name)
        roleListAside.appendChild(button)
        role.peopleList = parent.peopleList.filter(p => p.role == role.name)
    }


}


// 渲染表格
function tableRender(role_name, peopleOfRole, skillList) {

    dataGrid.innerHTML = ''





    for (let s of skillList) {
        let row = document.createElement('div')
        row.setAttribute('data-skill', s.name)
        row.classList.add('row')


        // 行首
        let skill = document.createElement('div')
        skill.classList.add('skill-name')
        skill.innerHTML = s.name
        row.appendChild(skill)



        // role-target
        let role_aim = document.createElement('div')
        role_aim.classList.add('role_aim')
        row.appendChild(role_aim)

        // my aim sum
        let my_aim_sum = document.createElement('div')
        my_aim_sum.classList.add('my_aim_sum')
        my_aim_sum.classList.add('revisable')
        row.appendChild(my_aim_sum)

        // real sum
        let r_sum = document.createElement('div')
        r_sum.classList.add('revisable')
        r_sum.classList.add('r_sum')
        r_sum.classList.add('fas')
        row.appendChild(r_sum)



        // desc
        let desc = document.createElement('div')
        desc.innerHTML = s.desc
        desc.classList.add('desc')
        row.appendChild(desc)



        let r_value_list = peopleOfRole.map(p => {
            if (p.skill[s.name]) return p.skill[s.name].r
            else return 0
        })

        let my_aim_value_list = peopleOfRole.map(p => {
            if (p.skill[s.name]) return p.skill[s.name].my_aim
            else return 0
        })


        if (s.class == 'common') {



            r_sum.innerHTML = getAverage(r_value_list)
            my_aim_sum.innerHTML = getAverage(my_aim_value_list)
        } else if (s.class == 'specific') {
            r_sum.innerHTML = Math.max(...r_value_list)
            my_aim_sum.innerHTML = Math.max(...my_aim_value_list)

            row.classList.add('specific_class')

        }
        role_aim.innerHTML = s.target[role_name] || 0


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
    if (iframe.classList.toggle('none')) {
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
                    name: 'my target sum',
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
                radar.description.push(skill.querySelector('.skill-name').innerHTML)
                radar.inner[0].value.push(skill.querySelector('.role_aim').innerHTML - 0 || 0)
                radar.inner[1].value.push(skill.querySelector('.my_aim_sum').innerHTML - 0 || 0)
                radar.inner[2].value.push(skill.querySelector('.r_sum').innerHTML - 0 || 0)
            })
            radarList.push(radar)
        }

        // 可以直接和iframe传递对象(无需序列化)
        // console.log(radarList)
        iframe.contentWindow.initAll(radarList)

    }
}