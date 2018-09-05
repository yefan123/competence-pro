(function init() {


    window.mainFrame = document.querySelector('.main')
    window.dataGrid = document.querySelector('#grid-data')
    window.peopleListAside = document.querySelector('aside#peopleList')
    window.peopleDetail = document.querySelector('#people-detail')

    window.radarToggler = document.querySelector('#radarToggler')
    window.radarFrame = document.querySelector('#radarFrame')

    window.editor = document.querySelector('#editor')









    window.typeList = parent.typeList


    peopleListAside.addEventListener('click', event => {
        let people_id = event.target.getAttribute('data-people_id')
        if (people_id) {
            window.currentPeo = parent.peopleList.filter(p => p._id === people_id)[0]
            tableRender(currentPeo, typeList)
            refreshPeopleInfo(currentPeo)
            let lastOne = event.target.parentNode.querySelector('.active')
            if (lastOne) lastOne.classList.remove('active')
            event.target.classList.add('active')
            if (!radarFrame.classList.contains('none'))
                radarToggler.click()

            mainFrame.focus()
        }
    })


    if (parent.user.level === 'staff') {
        openNormalBoard()
    } else if (parent.user.level === 'leader') {
        openLeaderBoard()
    } else if (parent.user.level === 'boss') {
        openBossBoard()
    }





    editor.addEventListener('keydown', e => {
        // if (e.key === 'Enter') currentEditor.querySelector('.submit').click()
        if (e.key === 'Escape') editor.click()
    })





})();





function refreshPeopleInfo() {


    peopleDetail.querySelector('[data-detail=name] span.right').innerHTML = currentPeo.name
    peopleDetail.querySelector('[data-detail=username] span.right').innerHTML = currentPeo.username
    peopleDetail.querySelector('[data-detail=branch] span.right').innerHTML = parent.user.branch
    peopleDetail.querySelector('[data-detail=role] span.right').innerHTML = currentPeo.role


}








function openNormalBoard() {


    peopleListAside.remove()
    mainFrame.style.left = '1%'
    mainFrame.style.right = '16%'
    radarFrame.style.left = '1%'
    radarFrame.setAttribute('width', '83%')


    parent.sendAjax('GET', '/data?get=people&_idStr=' + parent.user._id).then(myself => {



        window.currentPeo = myself
        tableRender(currentPeo, typeList)
        refreshPeopleInfo(currentPeo)

        mainFrame.focus()
    })


}


function openLeaderBoard() {
    loadPeopleList(parent.peopleList)
}

function openBossBoard() {

    loadPeopleList(parent.peopleList)
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
function tableRender(people, typeList) {

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

        // my aim sum
        let my_aim_sum = document.createElement('div')
        my_aim_sum.classList.add('my_aim_sum')
        row.appendChild(my_aim_sum)

        // real sum
        let r_sum = document.createElement('div')
        r_sum.classList.add('r_sum')
        r_sum.classList.add('fas')
        row.appendChild(r_sum)






        let r_value_list = []
        let my_aim_value_list = []
        let role_aim_value_list = []
        let skillsOfType = parent.skillList.filter(s => s.type === t.name)
        skillsOfType.forEach(s => {
            if (!people.skill[s.name]) return
            r_value_list.push(people.skill[s.name].r || 0)
            my_aim_value_list.push(people.skill[s.name].my_aim || 0)
            role_aim_value_list.push(s.target[people.role] || 0)
        })


        if (t.class == 'common') {

            r_sum.innerHTML = getAverage(r_value_list)
            my_aim_sum.innerHTML = getAverage(my_aim_value_list)
            role_aim_sum.innerHTML = getAverage(role_aim_value_list)
        } else if (t.class == 'specific') {
            r_sum.innerHTML = Math.max(...r_value_list)
            my_aim_sum.innerHTML = Math.max(...my_aim_value_list)
            role_aim_sum.innerHTML = Math.max(...role_aim_value_list)

            row.firstChild.classList.add('specific_class')


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
                    name: 'role aim sum',
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
            rowList.slice(i, i + segment).forEach(typeRow => {
                radar.maxValue.push(5)
                radar.description.push(typeRow.getAttribute('data-type'))
                radar.inner[0].value.push(typeRow.querySelector('.role_aim_sum').innerHTML - 0 || 0)
                radar.inner[1].value.push(typeRow.querySelector('.my_aim_sum').innerHTML - 0 || 0)
                radar.inner[2].value.push(typeRow.querySelector('.r_sum').innerHTML - 0 || 0)
            })
            radarList.push(radar)
        }

        radarFrame.contentWindow.initAll(radarList)

    }
}