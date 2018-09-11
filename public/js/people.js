(function init() {

    window.curr = new Proxy({}, {
        get: (obj, prop) => {
            return prop in obj ? obj[prop] : undefined;
        },
        set: (obj, prop, value) => {
            // The default behavior to store the value
            obj[prop] = value;

            switch (prop) {
                case 'peo':
                    {
                        dom.peo_name.innerHTML = value.name,
                        dom.peo_usern.innerHTML = value.usern,
                        Array.from(dom.peoList.children).find(b => b.getAttribute('data-peo_id') == curr.peo._id).appendChild(dom.dot)
                        break
                    }
                case 'role':
                    {
                        dom.role_name.innerHTML = value.name
                        break
                    }
                case 'skill':
                    {
                        dom.skill_name.innerHTML = value.name
                        dom.skill_desc.innerHTML = value.desc
                        dom.type.innerHTML = value.type
                        break
                    }
            }
        }
    })



    window.rowList = []

    window.dom = {
        radar: document.querySelector('#radar'),
        dot: document.querySelector('#dot'),
        loading: document.querySelector('#loading'),
        edi: document.querySelector('#edi'),
        curr: document.querySelector('#curr'),
        peoList: document.querySelector('#peoList'),
        table: document.querySelector('#table'),
        peo_name: document.querySelector('#curr [data-curr="peo_name"]'),
        peo_usern: document.querySelector('#curr [data-curr="peo_usern"]'),
        role_name: document.querySelector('#curr [data-curr="role_name"]'),
        skill_name: document.querySelector('#curr [data-curr="skill_name"]'),
        skill_desc: document.querySelector('#curr [data-curr="skill_desc"]'),
        type: document.querySelector('[data-curr="type"]'),
        innerEdi: {}
    }



    // 所有用户的视图一样,数据不一样
    switch (parent.user.level) {
        case 'staff':
            {
                loadPeoList(window.parent.peoList)
                break
            }
        case 'leader':
            {
                loadPeoList(window.parent.peoList)
                break
            }
        case 'boss':
            {
                loadPeoList(window.parent.peoList)
                break
            }
    }








    dom.peoList.addEventListener('click', event => {
        let p_id = event.target.getAttribute('data-peo_id')
        if (p_id) {
            let p = parent.peoList.find(p => p._id == p_id)
            window.curr.peo = p;
            // 如果不存在,给curr分配一个虚拟role
            window.curr.role = parent.roleList.find(r => r._id == p.role_id) || {
                tarList: []
            };
            resetRowList()
            gridOptions.api.setRowData(window.rowList);
            fitAllCols()
            dom.table.focus()
        }
    })




    window.columnDefs = [{
        headerName: 'Competence',
        field: 'skill',
        colId: 'skill',
    }, {
        headerName: 'Type',
        field: 'type',
        colId: 'type',
    }, {
        headerName: 'Attribute',
        field: 'attr',
        colId: 'attr',
    }, {
        headerName: 'Role Target',
        field: 'role_tar',
        enableValue: true,
        // group后自动aggregate
        aggFunc: 'avg',
    }, {
        cellStyle: {
            'color': 'orange'
        },
        headerName: 'My Target',
        field: 'my_tar',
        colId: 'my_tar',
        enableValue: true,
        aggFunc: 'avg'
    }, {
        cellStyle: {
            'color': 'orange'
        },
        headerName: 'Actual Score',
        field: 'real',
        colId: 'real',
        enableValue: true,
        aggFunc: 'avg'
    }, {
        cellStyle: {
            'color': 'orange'
        },
        headerName: 'Action',
        field: 'act',
        colId: 'act',
    }, {
        cellStyle: {
            'color': 'orange'
        },
        headerName: 'Action Status',
        field: 'act_sta',
        colId: 'act_sta',
    }, {
        cellStyle: {
            'color': 'orange'
        },
        headerName: 'Action Detail',
        field: 'act_de',
        colId: 'act_de',
    }, {
        cellStyle: {
            'color': 'orange'
        },
        headerName: 'Comment',
        field: 'comm',
        colId: 'comm',
    }]




    window.gridOptions = {
        columnDefs,
        sideBar: false,
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
            width: 150,
            enableRowGroup: true,
            enableValue: false,
        },
        onCellClicked: event => {
            if (event.node.group) return
            curr.row = event.data
            curr.node = event.node
            curr.skill = parent.skillList.find(s => s._id == event.data.skill_id)
            let colId = event.column.colId
            if (['my_tar', 'real', 'act', 'act_sta', 'act_de', 'comm'].includes(colId))
                openEdi('setRow', colId)
        },
    };


    // init
    document.addEventListener('DOMContentLoaded', function () {
        new agGrid.Grid(dom.table, gridOptions);

        dom.peoList.children[0].click()
        // curr.skill = parent.skillList[0]
    });


})();

function getContextMenuItems() {

}




function fitAllCols() {
    let allColumnIds = gridOptions.columnApi.getAllColumns().map(c => c.colId)
    gridOptions.columnApi.autoSizeColumns(allColumnIds);
}


// refresh people list aside
function loadPeoList(peoList = parent.peoList) {
    dom.peoList.innerHTML = ''
    for (let p of peoList) {
        let button = document.createElement('button')
        button.classList.add('fas')
        button.innerHTML = p.name
        button.setAttribute('data-peo_id', p._id)
        dom.peoList.appendChild(button)
    }


}




// generate the radarList then draw it
function drawSkillRadar(segment = 7) {
    dom.radar.style.display = 'flex'

    let radarList = []
    // 考虑改成通过api读取node
    let rowList = window.rowList
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
                name: 'personal target',
                value: [],
                lineColor: "yellow",
                fillColor: 'transparent',
                lineWidth: 2
            }, {
                name: 'actual',
                value: [],
                lineColor: "red",
                fillColor: 'transparent',
                lineWidth: 2
            }]
        }
        rowList.slice(i, i + segment).forEach(row => {
            radar.maxValue.push(5)
            radar.description.push(row.skill)
            radar.inner[0].value.push(+row.role_tar)
            radar.inner[1].value.push(+row.my_tar)
            radar.inner[2].value.push(+row.real)
        })
        radarList.push(radar)
    }

    // 可以直接和radarFrame传递对象(无需序列化)
    drawRadarList(radarList)

}



function drawTypeRadar(segment = 7) {

    // 先对type列分组,然后读取所有的group node
    let col = gridOptions.columnApi.getColumn("type");
    gridOptions.columnApi.setRowGroupColumns([col]);

    dom.radar.style.display = 'flex'
    let radarList = []

    let groupNodeList = []
    gridOptions.api.forEachNode(node => {
        // 属于group node且没有被过滤(隐藏)的node
        if (node.group && node.aggData) groupNodeList.push(node)
    })

    for (let i = 0; i < groupNodeList.length; i += segment) {
        let radar = {
            maxValue: [],
            description: [],
            inner: [{
                name: 'role target agg',
                value: [],
                lineColor: "blue",
                fillColor: 'transparent',
                lineWidth: 2
            }, {
                name: 'personal target agg',
                value: [],
                lineColor: "yellow",
                fillColor: 'transparent',
                lineWidth: 2
            }, {
                name: 'actual agg',
                value: [],
                lineColor: "red",
                fillColor: 'transparent',
                lineWidth: 2
            }]
        }
        // console.log(groupNodeList)
        groupNodeList.slice(i, i + segment).forEach(node => {
            radar.maxValue.push(5)
            radar.description.push(node.key)
            radar.inner[0].value.push(node.aggData.role_tar)
            radar.inner[1].value.push(node.aggData.my_tar)
            radar.inner[2].value.push(node.aggData.real)
        })
        radarList.push(radar)
    }

    drawRadarList(radarList)



}



function resetRowList(p = curr.peo) {
    window.rowList = []
    // let skillList = Array.prototype.concat.apply([], parent.typeList.map(t => t.skillList))
    let r = parent.roleList.find(r => r._id == p.role_id)

    for (let s of parent.skillList) {

        let row = resetRow(p.rowList.find(r => r.skill_id == s._id) || {
            skill_id: s._id
        })
        rowList.push(row)
    }
    return window.rowList
}


// peo的row转ui的row
// 主要是将skill_id衍生出skill,type,role_tar,attr等
function resetRow(r) {
    let {
        skill_id,
        my_tar,
        real,
        act,
        act_sta,
        act_de,
        comm
    } = r
    let skill = parent.skillList.find(s => s._id == skill_id)
    let row = {
        skill: skill.name,
        skill_id,
        type: skill.type,
        attr: skill.attr,
        role_tar: curr.role.tarList[skill_id],
        my_tar,
        real,
        act,
        act_sta,
        act_de,
        comm
    }
    return row
}



// draw radarList
function drawRadarList(radarList) {
    dom.radar.innerHTML = ''
    for (let radar of radarList) {
        let container = document.createElement('div')
        container.classList.add('canvas')
        dom.radar.appendChild(container)


        window.RADAR.init(container, {
            data: {
                maxValue: radar.maxValue,
                description: radar.description,
                inner: radar.inner
            },
            config: {
                scale: 1,
                showTooltip: true,
                tooltip: {
                    offsetY: 0,
                    offsetX: 0,
                    r: 5
                },
                dataCircle: {
                    // 节点
                    r: 5,
                    fillStyle: "transparent",
                },
                bg: {
                    // 由内到外的层数
                    layer: 7,
                    evenFillStyle: "#fff",
                    oddFillStyle: "rgba(0,0,0,0.1)",
                    axisColor: "rgba(0,0,0,0.5)"
                }
                // 雷达图半径(默认自适应)
                // radius: 300
            }
        })


    }
}