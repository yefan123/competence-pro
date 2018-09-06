(function init() {


    window.dom = {


        edi: document.querySelector('#edi'),
        deptList: document.querySelector('#deptList'),

        dept_sel: document.querySelector('#dept_sel'),

    }

    switch (parent.user.level) {
        case 'staff':
            {
                break
            }
        case 'leader':
            {
                break
            }
        case 'boss':
            {
                parent.sendFetch({
                    url: '/data?get=deptList'
                }).then(({
                    list
                }) => {
                    window.deptList = list
                    dom.deptList.innerHTML = list.map(d => `<option value="${d}"></option>`).join('')
                    dom.dept_sel.value = parent.user.dept
                })
                break
            }
    }

    // show info
    document.querySelector('#main #last').innerHTML = 'last login: ' + parent.user.last.toDateString()




})();


// boss切换部门
function switchDept(dept) {
    parent.location.href = '/log?switchDept=' + dept
}