(function init() {



    window.editor = document.querySelector('#editor')
    window.updateUserEditor = document.querySelector('#updateUserEditor')
    window.addLeaderEditor = document.querySelector('#addLeaderEditor')
    window.branchDataList = document.querySelector('#branchDataList')

    window.branchSelector = document.querySelector('#branchSelector')

    window.mainFrame = document.querySelector('#main')

    switch (parent.user.level) {
        case 'staff':
            {
                openNormalBoard()
                break
            }
        case 'leader':
            {
                openLeaderBoard()
                break
            }
        case 'boss':
            {
                openBossBoard()
                break
            }
    }

    updateUserEditor.querySelector('.role').innerHTML = parent.roleList.map(r => `<option value="${r.name}">${r.name}</option>`).join('')



})();




function openNormalBoard() {
    branchSelector.value = parent.user.branch
    document.querySelector('[data-info=switchBranch]').remove()
}

function openLeaderBoard() {
    updateUserEditor.querySelector('.role').parentNode.style.display='none'
    document.querySelector('[data-info=role]').style.display='none'
    
    branchDataList.innerHTML = parent.user.branchList.map(b => `<option value="${b}"></option>`).join('')
    branchSelector.value = parent.user.branch
}

function openBossBoard() {
    updateUserEditor.querySelector('.role').parentNode.style.display='none'
    document.querySelector('[data-info=role]').style.display='none'
    parent.sendAjax('GET', '/data?get=branchList').then(list => {
        window.branchList = list
        // window.branchDataList = document.createElement('datalist')
        // branchDataList.id='branchDataList'
        branchDataList.innerHTML = list.map(b => `<option value="${b}"></option>`).join('')
        branchSelector.value = parent.user.branch
    })

    // branchSelector.setAttribute('list','branchDataList')
}




function openEditor(mode) {
    editor.style.display = 'flex'
    updateUserEditor.style.display = 'none'
    addLeaderEditor.style.display = 'none'
    if (mode === 'updateUser') {
        window.currentEditor = updateUserEditor
        updateUserEditor.style.display = 'block'
        updateUserEditor.querySelector('.loading').innerHTML = ''
        updateUserEditor.querySelector('.name').value = parent.user.name
        updateUserEditor.querySelector('.username').value = parent.user.username
        // updateUserEditor.querySelector('.branch').value = parent.user.branch
        updateUserEditor.querySelector('.old_pass').focus()
    } else if (mode == 'addLeader') {
        if (parent.user.level !== 'boss') {
            alert('sorry but only root account can create admin :(')
            editor.click()
            return
        }
        window.currentEditor = addLeaderEditor
        addLeaderEditor.style.display = 'block'
        addLeaderEditor.querySelector('.loading').innerHTML = ''
        addLeaderEditor.querySelector('.branchList').innerHTML = ''
        addLeaderEditor.querySelector('.name').focus()
        newInput()

    }
}



function sendUpdateUser() {


    let where = {
        // _id: parent.user._id,
        cryptedPas: CryptoJS.SHA1(updateUserEditor.querySelector('.old_pass').value).toString(),
        username: updateUserEditor.querySelector('.username').value
    }
    let update = {
        $set: {

        }
    }


    update.$set.name = updateUserEditor.querySelector('.name').value
    update.$set.cryptedPas = CryptoJS.SHA1(updateUserEditor.querySelector('.new_pass').value).toString()
    update.$set.role = updateUserEditor.querySelector('.role').value



    updateUserEditor.querySelector('.loading').innerHTML = 'loading...'

    parent.sendAjax('POST', '/update?updatePeople=1', {
        where,
        update
    }).then(res => {
        if (res.msg == 'ok') {
            if (res.log.modifiedCount == 1) {

                alert('user info updated successfully')
                parent.location.href = "/log?logout=1"
            } else {
                updateUserEditor.querySelector('.loading').innerHTML = ''
                alert('oops nothing altered ')
            }
        } else alert(res.msg)

    })
}


// 切换部门
function switchBranch(branch) {
    parent.location.href = '/log?switchBranch=' + branch
}


// delete account
function dropMyself() {
    if (parent.user.level == 'boss') {
        alert('sorry but root account cannot delete himself :(')
        return
    }
    if (!confirm(`CAUTION THIS OPERATION IS IRREVERSIBLE !!
        R U SURE TO DELETE UR ACCOUNT ANYWAY ??`)) return

    parent.sendAjax('POST', '/update?dropPeople=1', {
        people: parent.user
    }).then(res => {
        if (res.msg == 'ok' && res.log.deletedCount == 1) {
            alert('account deleted permanetely .')
            parent.location.href = '/log?logout=1'
        }
    })
}



// 添加一个新的branch输入控件(datalist)
function newInput() {
    let branchDiv = document.createElement('div')
    branchDiv.classList.add('branch')
    let input = document.createElement('input')
    input.setAttribute('type', 'text')
    input.setAttribute('name', 'test')
    input.setAttribute('list', 'branchDataList')
    let button = document.createElement('button')
    button.classList.add('fas')
    button.classList.add('fa-times')
    button.onclick = event => {
        event.target.parentNode.remove()
    }
    branchDiv.appendChild(input)
    branchDiv.appendChild(button)
    addLeaderEditor.querySelector('.branchList').appendChild(branchDiv)
}

// boss添加leader
function sendAddLeader() {
    let inputList = addLeaderEditor.querySelectorAll('.branchList .branch input')
    let branchList = Array.from(new Set(Array.from(inputList).map(i => i.value)))
    let loading = addLeaderEditor.querySelector('.loading')

    let password = addLeaderEditor.querySelector('.password').value
    let reenter_password = addLeaderEditor.querySelector('.reenter_password').value
    if (password !== reenter_password) {
        alert('OOPS SORRY PASSWORD ISNT REENTERED CORRECTLY')
        return
    }

    let leader = {
        name: addLeaderEditor.querySelector('.name').value,
        username: addLeaderEditor.querySelector('.username').value,
        password,
        level: addLeaderEditor.querySelector('.level').value,
        // branch: addEditor.querySelector('.branch').value,
        role: addLeaderEditor.querySelector('.role').value,
        // branchList: new Set(Array.from(addLeaderEditor.querySelectorAll('.branchList .branch input')).map(i => i.value))
        branchList
    }


    loading.innerHTML = 'waiting...'
    parent.sendAjax('POST', '/update?addPeople=1', {
        people: leader
    }).then(res => {
        if (res.msg === 'ok' && res.log.insertedCount == 1) {
            // window.log = res.log
            let lea = res.log.ops[0]
            alert(`new leader added successfully !
                name: '${lea.name}'
                username: '${lea.username}'
                password: '${leader.password}'
                role: 'leader'
                level: '${lea.level}'
                branch list: ${lea.branchList.join(',')}`)
            parent.location.reload()
        } else {
            alert(res.msg)
            addLeaderEditor.querySelector('.loading').innerHTML = ''
        }
    })
}