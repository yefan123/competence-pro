(function init() {

    window.curr = new Proxy({}, {
        get: (obj, prop) => {
            return prop in obj ? obj[prop] : undefined;
        },
        set: (obj, prop, value) => {
            // The default behavior to store the value
            obj[prop] = value;

            switch (prop) {
                case 'p':
                    {
                        dom.p_name.innerHTML = value.name,
                        dom.p_usern.innerHTML = value.usern
                        break
                    }
                case 'role':
                    {
                        dom.role_name.innerHTML = value.name
                        break
                    }
            }
        }
    })



    window.rowList = []

    window.dom = {
        load:document.querySelector('#load'),
        edi: document.querySelector('#edi'),
        radarToggler: document.querySelector('#radarToggler'),
        curr: document.querySelector('#curr'),
        peoList: document.querySelector('aside#peoList'),
        table: document.querySelector('#table'),
        mainFrame: document.querySelector('.main'),
        peo_name: document.querySelector('#curr [data-curr="peo_name"]'),
        peo_usern: document.querySelector('#curr [data-curr="peo_usern"]'),
        role_name: document.querySelector('#curr [data-curr="role_name"]'),
        innerEdi: {}
    }

    document.querySelectorAll('.innerEdi').forEach(e => {
        let name = e.getAttribute('data-edi')
        dom.innerEdi[name] = e
        e.addEventListener('click', event => {
            event.stopPropagation();
        })
    })

    // leader和boss的init相似
    switch (parent.user.level) {
        case 'staff':
            {
                curr.p = parent.user
                resetRowList()
                gridOptions.api.setRowData(window.rowList);
                dom.mainFrame.style.width = '80%'
                radarFrame.setAttribute('width', '80%')

                dom.mainFrame.style.left = '1%'
                radarFrame.style.left = '1%'
                break
            }
        case 'leader':
            {
                document.querySelector('aside.hidden').classList.remove('hidden')
                loadPeoList(window.parent.peoList)
                break
            }
        case 'boss':
            {
                document.querySelector('aside.hidden').classList.remove('hidden')
                loadPeoList(window.parent.peoList)
                break
            }
    }



    dom.edi.addEventListener('keydown', e => {
        if (e.key === 'Escape') edi.click()
    })




    dom.peoList.addEventListener('click', event => {
        let p_id = event.target.getAttribute('data-peo_id')
        if (p_id) {
            let p = parent.peoList.find(p => p._id == p_id)
            window.curr.peo = p;
            window.curr.role = parent.roleList.find(r => r._id == p.role_id);
            resetRowList()
            gridOptions.api.setRowData(window.rowList);
            let lastOne = event.target.parentNode.querySelector('.active')
            if (lastOne) lastOne.classList.remove('active')
            event.target.classList.add('active')
            dom.table.focus()
        }
    })






    dom.table.focus()




    window.columnDefs = [{
        headerName: 'Competence',
        field: 'skill',
    }, {
        headerName: 'Type',
        field: 'type',
    }, {
        headerName: 'Role Target',
        field: 'role_tar',
    }, {
        headerName: 'My Target',
        field: 'my_tar',
    }, {
        headerName: 'Actual Score',
        field: 'real',
    }, {
        headerName: 'Action',
        field: 'act',
    }, {
        headerName: 'Action Status',
        field: 'act_sta',
    }, {
        headerName: 'Action Detail',
        field: 'act_de',
    }, {
        headerName: 'Comment',
        field: 'comm',
    }]




    window.gridOptions = {
        columnDefs,
        showToolPanel: false,
        animateRows: true,
        enableRangeSelection: true,
        rowData: null,
        enableSorting: true,
        enableFilter: true,
        enableColResize: true,
        rowSelection: 'single',
        getContextMenuItems,
        defaultColDef: {
            editable: false,
            width: 140,
            enableRowGroup: true,
            enableValue: false,
        },
        onCellClicked: event => {
            curr.row = gridOptions.api.getSelectedRows()[0]
            curr.node = gridOptions.api.getSelectedNodes()[0]
            openEdi('setRow')
        },
    };



    document.addEventListener('DOMContentLoaded', function () {
        new agGrid.Grid(dom.table, gridOptions);

        curr.peo = parent.peoList[0]

    });


})();

// 可以叠加同一个事件




function getContextMenuItems() {

}



function openEdi(mode) {
    edi.style.display = 'flex'
    // 遍历对象
    Object.values(dom.innerEdi).forEach(edi => {
        edi.style.display = 'none'
    })
    dom.load.style.visibility = 'hidden'

    if (mode === 'setRow') {

        let edi = dom.innerEdi.setRow
        window.curr.edi = edi
        edi.style.display = 'block'
        edi.querySelector('.my_tar').value = curr.row.my_tar
        edi.querySelector('.real').value = curr.row.real
        edi.querySelector('.act').value = curr.row.act
        edi.querySelector('.act_sta').value = curr.row.act_sta
        edi.querySelector('.act_de').value = curr.row.act_de
        edi.querySelector('.comm').value = curr.row.comm


    } else if (mode === 'addPeo') {
        let edi = dom.innerEdi.addPeo
        window.curr.edi = edi
        edi.style.display = 'block'
        edi.querySelector('.dept').value = parent.user.dept
        edi.querySelector('.name').focus()
    }
}






// 基于people和skill
function sendSetRow() {


    let row = {
        skill: curr.row.skill,
        type: curr.row.type,
        my_tar: curr.edi.querySelector('.my_tar').value - 0,
        real: curr.edi.querySelector('.real').value - 0,
        act: curr.edi.querySelector('.act').value,
        act_sta: curr.edi.querySelector('.act_sta').value,
        act_de: curr.edi.querySelector('.act_de').value,
        comm: curr.edi.querySelector('.comm').value
    }


    dom.load.style.visibility = 'visible'

    parent.sendFetch({
        url: '/set?setRow=1',
        body: {
            row,
            peo: curr.peo,
            old: curr.row
        }
    }).then(({
        msg
    }) => {
        if (msg == 'ok') {
            dom.edi.click()
            curr.node.setData(row)
        }else{
            alert(msg)
            dom.edi.click()
        }
    })

}



// 添加新用户
function sendAddPeo() {
    let people = {
        name: addEditor.querySelector('.name').value,
        username: addEditor.querySelector('.username').value,
        password: addEditor.querySelector('.password').value,
        dept: addEditor.querySelector('.dept').value,
        role: addEditor.querySelector('.role').value,
    }
    dom.load.style.visibility = 'visible'
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
            addEditor.querySelector('#load').innerHTML = ''
        }
    })
}



// update语句可以顺便改变类型




// 删除员工
function sendDropPeople(people) {
    if (!currPeo) {
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



function loadPeoList(peoList) {
    for (let p of peoList) {
        let button = document.createElement('button')
        button.classList.add('fas')
        button.innerHTML = p.name
        button.setAttribute('data-peo_id', p._id)
        dom.peoList.appendChild(button)
    }


}






function toggleRadar(segment = 7) {
    dom.mainFrame.classList.toggle('none')
    if (radarFrame.classList.toggle('none')) {
        dom.mainFrame.focus()
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


function resetRowList(p = curr.peo) {
    window.rowList = []
    // let skillList = Array.prototype.concat.apply([], parent.typeList.map(t => t.skillList))
    let r = parent.roleList.find(r => r._id == p.role_id)
    for (let t of parent.typeList) {

        for (let s of t.skillList) {
            let {
                my_tar,
                real,
                act,
                act_sta,
                act_de,
                comm
            } = p.skillList.find(sk => sk._id == s._id) || {}
            let row = {
                skill: s.name,
                type: t.name,
                role_tar: r.tarList[s._id],
                my_tar,
                real,
                act,
                act_sta,
                act_de,
                comm
            }
            rowList.push(row)
        }
    }
}