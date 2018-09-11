(function init() {

    window.curr = new Proxy({}, {
        get: (obj, prop) => {
            return prop in obj ? obj[prop] : undefined;
        },
        set: (obj, prop, value) => {
            obj[prop] = value;

            switch (prop) {

                case 'role':
                    {
                        dom.role_name.innerHTML = value.name
                        dom.peo_count.innerHTML = value.peoList.length
                        Array.from(dom.roleList.children).find(b => b.getAttribute('data-role_id') == curr.role._id).appendChild(dom.dot)
                        break
                    }
                case 'skill':
                    {
                        dom.skill_name.innerHTML = value.name
                        dom.skill_desc.innerHTML = value.desc
                        dom.type.innerHTML = value.type
                        break
                    }
                    // 没有type,因为type字段是虚的(寄托在skill上)
            }
        }
    })



    window.rowList = []

    window.dom = {
        peo_count: document.querySelector('[data-curr="peo_count"]'),
        radar: document.querySelector('#radar'),
        dot: document.querySelector('#dot'),
        loading: document.querySelector('#loading'),
        edi: document.querySelector('#edi'),
        curr: document.querySelector('#curr'),
        roleList: document.querySelector('#roleList'),
        table: document.querySelector('#table'),
        role_name: document.querySelector('#curr [data-curr="role_name"]'),
        skill_name: document.querySelector('#curr [data-curr="skill_name"]'),
        skill_desc: document.querySelector('#curr [data-curr="skill_desc"]'),
        type: document.querySelector('[data-curr="type"]'),
        innerEdi: {}
    }



    // leader和boss的init相似
    switch (parent.user.level) {
        case 'staff':
            {
                // permission denied
                break
            }
        case 'leader':
            {
                loadRoleList(window.parent.roleList)
                break
            }
        case 'boss':
            {
                loadRoleList(window.parent.roleList)
                break
            }
    }







    // switch role
    dom.roleList.addEventListener('click', event => {
        let _id = event.target.getAttribute('data-role_id')
        if (_id) {
            curr.role = parent.roleList.find(r => r._id == _id);
            resetRowList()
            gridOptions.api.setRowData(window.rowList);
            fitAllCols()
            dom.table.focus()
        }
    })




    // 多个人的平均值
    window.columnDefs = [{
        headerName: 'Competence',
        field: 'skill',
        colId: 'skill'
    }, {
        headerName: 'Type',
        field: 'type',
    }, {
        headerName: 'Attribute',
        field: 'attr',
        colId: 'attr',
    }, {
        headerName: 'Role Target',
        field: 'role_tar',
        width: 170,
        enableValue: true,
        // group后自动aggregate
        aggFunc: 'avg',
        editable: true,
        cellStyle: {
            color: 'orange',
            // 'background-color': 'green'
        },
        onCellValueChanged: event => {
            sendSetTar({
                role_id: curr.role._id,
                skill_id: event.data.skill_id,
                value: event.newValue
            })
        }
    }, {
        headerName: 'Personal Target Agg',
        field: 'my_tar_agg',
        enableValue: true,
        aggFunc: 'avg'
    }, {
        headerName: 'Actual Score Agg',
        field: 'real_agg',
        enableValue: true,
        aggFunc: 'avg'
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
            width: 140,
            enableRowGroup: true,
            enableValue: false,
        },
        onCellClicked: event => {
            if (event.node.group) return
            curr.row = event.data
            curr.node = event.node
            curr.skill = parent.skillList.find(s => s._id == event.data.skill_id)
        },
    };



    document.addEventListener('DOMContentLoaded', function () {
        new agGrid.Grid(dom.table, gridOptions);

        if (parent.roleList.length > 0)
            dom.roleList.children[0].click()

    });


})();

// 可以叠加同一个事件




function getContextMenuItems() {

}


function fitAllCols() {
    let allColumnIds = gridOptions.columnApi.getAllColumns().map(c => c.colId)
    gridOptions.columnApi.autoSizeColumns(allColumnIds);
}





// refresh roleple list aside
function loadRoleList(roleList = parent.roleList) {
    dom.roleList.innerHTML = ''
    for (let r of roleList) {
        let button = document.createElement('button')
        button.classList.add('fas')
        button.innerHTML = r.name
        button.setAttribute('data-role_id', r._id)
        dom.roleList.appendChild(button)
    }


}




// generate the radarList then draw it
function drawSkillRadar(segment = 7) {
    dom.radar.style.display = 'flex'

    let radarList = []
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
        rowList.slice(i, i + segment).forEach(row => {
            radar.maxValue.push(5)
            radar.description.push(row.skill)
            radar.inner[0].value.push(row.role_tar)
            radar.inner[1].value.push(row.my_tar_agg)
            radar.inner[2].value.push(row.real_agg)
        })
        radarList.push(radar)
    }

    // 可以直接和radarFrame传递对象(无需序列化)
    drawRadarList(radarList)

}



function drawTypeRadar(segment = 7) {

    let col = gridOptions.columnApi.getColumn("type");
    gridOptions.columnApi.setRowGroupColumns([col]);

    dom.radar.style.display = 'flex'
    let radarList = []

    let groupNodeList = []
    gridOptions.api.forEachNode(node => {
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
        groupNodeList.slice(i, i + segment).forEach(node => {
            radar.maxValue.push(5)
            radar.description.push(node.key)
            radar.inner[0].value.push(node.aggData.role_tar)
            radar.inner[1].value.push(node.aggData.my_tar_agg)
            radar.inner[2].value.push(node.aggData.real_agg)
        })
        radarList.push(radar)
    }

    drawRadarList(radarList)



}



// generate the rowList, and can be redraw
function resetRowList() {
    window.rowList = []
    // let skillList = Array.prototype.concat.apply([], parent.typeList.map(t => t.skillList))

    for (let s of parent.skillList) {

        // 计算出基于skill和多个人的rowList,并过滤掉undefined的row
        let rowList = curr.role.peoList.map(p => p.rowList).map(list => list.find(r => r.skill_id == s._id)).filter(r => r)

        let row = {
            skill_id: s._id,
            my_tar_agg: getAvg(rowList.map(r => r.my_tar)),
            real_agg: getAvg(rowList.map(r => r.real)),
        }

        window.rowList.push(resetRow(row))
    }
}


function getAvg(list) {
    if (list.length == 0) return 0
    let all = 0
    list.map(x => {
        all += x
    })
    // 一元正号是转换其他对象到数值的最快方法，也是最推荐的做法
    return +(all / list.length).toFixed(1)
}




// peo的row转ui的row
function resetRow(r) {
    let {
        skill_id,
        my_tar_agg,
        real_agg,
    } = r
    let skill = parent.skillList.find(s => s._id == skill_id)
    let row = {
        // 保留
        skill_id,
        skill: skill.name,
        type: skill.type,
        attr: skill.attr,
        role_tar: curr.role.tarList[skill_id],
        my_tar_agg,
        real_agg,
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