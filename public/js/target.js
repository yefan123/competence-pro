(function init() {








    parent.sendAjax('GET', '/data?get=roleList').then(list => {
        tableRender(parent.typeList, parent.skillList, list)
        // renderAddBtn()
    })


    window.dataGrid = document.querySelector('#grid-data')



    window.editor = document.querySelector('#editor')
    window.updateEditor = document.querySelector('#updateEditor')
    window.addSkillEditor = document.querySelector('#addSkillEditor')
    window.addRoleEditor = document.querySelector('#addRoleEditor')
    window.addTypeEditor = document.querySelector('#addTypeEditor')

    window.head = document.querySelector('#head')
    window.column = document.querySelector('#column')
    window.type_column = document.querySelector('#type_column')
    window.skill_column = document.querySelector('#skill_column')

    window.mainFrame = document.querySelector('#main')










    mainFrame.addEventListener('scroll', event => {
        head.style.top = mainFrame.scrollTop + 'px'
        column.style.left = mainFrame.scrollLeft + 'px'
    })



    editor.addEventListener('keydown', e => {
        // if (e.key === 'Enter') currentEditor.querySelector('.submit').click()
        if (e.key === 'Escape') editor.click()
    })





    updateEditor.addEventListener('click', event => {
        event.stopPropagation();
    })
    addSkillEditor.addEventListener('click', event => {
        event.stopPropagation();
    })
    addRoleEditor.addEventListener('click', event => {
        event.stopPropagation();
    })



    // 全局判断各种按钮
    document.addEventListener('click', event => {
        let ta = event.target


        // 点击aim数据
        if (ta.classList.contains('revisable')) {
            window.ta = event.target
            openEditor('update')


            // 各种删除按钮
        } else if (ta.classList.contains('delBtn')) {


            // 删除type
            if (ta.parentNode.hasAttribute('data-type')) {
                if (parent.user.level !== 'boss') {
                    alert('oops, only root has access to it :(')
                    return
                }
                let typeName = ta.parentNode.getAttribute('data-type')
                if (!confirm(`!!! CAUTION THIS OPERATION WILL AFFECT :
        WHOLE LOCAL INFO OF TYPE '${typeName}'
        ALL SKILLS UNDER TYPE '${typeName}'
        ALL PERSONAL DATA FROM SKILLS UNDER TYPE '${typeName}'
    R U PRETTY SURE TO REMOVE THEM PERMANETELY ???`)) return

                parent.sendAjax('POST', '/update?dropType=1', {
                    type: {
                        name: typeName
                    }
                }).then(res => {
                    alert(`finished:
                ${res.typeLog.deletedCount} type droped
                ${res.skillLog.deletedCount} skills droped
                ${res.peopleLog.modifiedCount} people affected`)
                    parent.location.reload()
                })



                // 删除skill
            } else if (ta.parentNode.hasAttribute('data-skill')) {
                if (parent.user.level !== 'boss') {
                    alert('oops, only root has access to it :(')
                    return
                }
                let skillName = event.target.parentNode.getAttribute('data-skill')
                if (!confirm(`!!! CAUTION THIS OPERATION WOULD CAUSE:
            ALL INFO ABOUT SKILL '${skillName}'
            ALL VALUE UNDER RELATIVE PEOPLE FROM SKILL '${skillName}'
        R U SURE TO DELETE THEM FOREVER ???`)) return

                parent.sendAjax('POST', '/update?dropSkill=1', {
                    skill: {
                        name: skillName
                    }
                }).then(res => {
                    // parent.skillList = parent.skillList.filter(s => s.name !== skillName)
                    alert(`finished:
                    ${res.valueDropLog.modifiedCount} people modified
                    ${res.skillDropLog.deletedCount} skill droped`)
                    parent.location.reload()
                })

                event.stopPropagation();


                // 删除role
            } else if (ta.parentNode.hasAttribute('data-role')) {
                let roleName = event.target.parentNode.getAttribute('data-role')
                if (!confirm(`!!! CAUTION THIS OPERATION WILL DELETE :
                    ALL THE INFO ABOUT ROLE '${roleName}'
                    ALL THE STAFF UNDER ROLE '${roleName}'
                    ALL THE AIMS FROM ROLE '${roleName}' 
                R U FVCKIN SURE TO REMOVE THEM PERMANETELY ???`)) return

                parent.sendAjax('POST', '/update?dropRole=1', {
                    role: {
                        name: roleName
                    }
                }).then(res => {


                    alert(`finished:
                        ${res.roleDropLog.deletedCount} role droped
                        ${res.peopleDropLog.deletedCount} people droped
                        ${res.aimDropLog.modifiedCount} aims droped`)

                    parent.location.reload()
                })

                event.stopPropagation();
            }


            // 各种添加按钮
        } else if (ta.classList.contains('fa-plus')) {

            // 添加type
            if (ta.classList.contains('addTypeBtn')) {
                if (parent.user.level == 'boss')
                    openEditor('addType')
                else alert('oops, only root has access to it :(')


                // 添加skill
            } else if (ta.classList.contains('addSkillBtn')) {
                if (parent.user.level == 'boss')
                    openEditor('addSkill', {
                        type: ta.parentNode.getAttribute('data-type')
                    })
                else alert('oops, only root has access to it :(')


                // 添加role
            } else if (ta.classList.contains('addRoleBtn')) {
                openEditor('addRole')

            }
        }
    })









})();






function tableRender(typeList, skillList, roleList) {






    for (let type of typeList) {
        let skillsOfType = skillList.filter(s => s.type == type.name)
        let label = document.createElement('div')
        label.innerHTML = type.name
        let delTypeBtn = document.createElement('button')
        delTypeBtn.classList.add('delBtn')
        delTypeBtn.classList.add('fa-times-circle')
        delTypeBtn.classList.add('fas')
        let typeDiv = document.createElement('div')
        typeDiv.style.width = (skillsOfType.length * 50 + 50) + 'px'
        typeDiv.setAttribute('data-type', type.name)
        typeDiv.classList.add('typeDiv')
        typeDiv.appendChild(delTypeBtn)
        typeDiv.appendChild(label)
        type_column.appendChild(typeDiv)

        let skillListDiv = document.createElement('div')
        skillListDiv.setAttribute('data-type', type.name)
        skillListDiv.classList.add('skillListDiv')

        if (type.class == 'specific') {
            typeDiv.classList.add('specific_class')
            skillListDiv.classList.add('specific_class')
        }

        for (let s of skillsOfType) {
            let skillDiv = document.createElement('div')
            skillDiv.setAttribute('data-skill', s.name)
            skillDiv.classList.add('fas')
            skillDiv.classList.add('skillDiv')
            let del = document.createElement('button')
            del.classList.add('fas')
            del.classList.add('fa-times-circle')
            del.classList.add('delBtn')
            let label = document.createElement('span')
            label.innerHTML = s.name
            skillDiv.appendChild(del)
            skillDiv.appendChild(label)
            skillListDiv.appendChild(skillDiv)

            let row = document.createElement('div')
            row.classList.add('row')
            row.setAttribute('data-skill', s.name)

            for (let role of roleList) {
                let unit = document.createElement('div')
                unit.classList.add('revisable')
                unit.setAttribute('data-role', role.name)
                unit.innerHTML = s.target[role.name] || NaN
                row.appendChild(unit)
            }
            dataGrid.appendChild(row)
        }
        let emptyRow = document.createElement('div')
        emptyRow.classList.add('row')
        emptyRow.classList.add('emptyRow')
        dataGrid.appendChild(emptyRow)

        skill_column.appendChild(skillListDiv)
        let addSkillBtn = document.createElement('button')
        addSkillBtn.classList.add('fas')
        addSkillBtn.classList.add('fa-plus')
        addSkillBtn.classList.add('addSkillBtn')
        skillListDiv.appendChild(addSkillBtn)
    }

    let addTypeBtn = document.createElement('button')
    addTypeBtn.classList.add('addTypeBtn')
    addTypeBtn.classList.add('fa-plus')
    addTypeBtn.classList.add('fas')
    type_column.appendChild(addTypeBtn)



    for (let role of roleList) {
        let roleDiv = document.createElement('div')
        roleDiv.setAttribute('data-role', role.name)
        let del = document.createElement('button')
        del.classList.add('fas')
        del.classList.add('fa-times-circle')
        del.classList.add('delBtn')
        let label = document.createElement('span')
        label.innerHTML = role.name
        roleDiv.appendChild(del)
        roleDiv.appendChild(label)
        head.appendChild(roleDiv)
    }

    let addRole = document.createElement('div')
    addRole.classList.add('fa-plus')
    addRole.classList.add('fas')
    addRole.classList.add('addRoleBtn')
    addRole.style.width = '150px'
    addRole.style.background = 'black'
    head.appendChild(addRole)




}






function openEditor(mode, param) {
    editor.style.display = 'flex'
    updateEditor.style.display = 'none'
    addTypeEditor.style.display = 'none'
    addSkillEditor.style.display = 'none'
    addRoleEditor.style.display = 'none'
    if (mode === 'update') {
        window.currentEditor = updateEditor
        updateEditor.style.display = 'block'
        updateEditor.querySelector('.loading').innerHTML = ''
        updateEditor.querySelector('.skill').value = window.ta.parentNode.getAttribute('data-skill')
        updateEditor.querySelector('.role').value = window.ta.getAttribute('data-role')
        updateEditor.querySelector('.target').focus()
    } else if (mode === 'addSkill') {
        window.currentEditor = addSkillEditor
        addSkillEditor.style.display = 'block'
        addSkillEditor.querySelector('.loading').innerHTML = ''
        addSkillEditor.querySelector('.type').value = param.type
        addSkillEditor.querySelector('.name').focus()
    } else if (mode === 'addRole') {
        window.currentEditor = addRoleEditor
        addRoleEditor.style.display = 'block'
        addRoleEditor.querySelector('.loading').innerHTML = ''
        addRoleEditor.querySelector('.branch').value = parent.user.branch
        addRoleEditor.querySelector('.name').focus()
    } else if (mode === 'addType') {
        window.currentEditor = addTypeEditor
        addTypeEditor.style.display = 'block'
        addTypeEditor.querySelector('.loading').innerHTML = ''
        addTypeEditor.querySelector('.name').focus()
    }
}



// 点击发送
function sendUpdate() {


    let param = {
        where: {},
        update: {
            $set: {

            }
        }
    }

    let roleName = updateEditor.querySelector('.role').value
    let skillName = updateEditor.querySelector('.skill').value
    param.where.name = skillName
    let token = `target.${roleName}`
    let newV = parseFloat(updateEditor.querySelector('.target').value)
    param.update.$set[token] = newV

    updateEditor.querySelector('.loading').innerHTML = 'loading...'

    parent.sendAjax('POST', '/update?updateTarget=1', param).then(data => {
        if (data.msg == 'ok') {
            window.ta.innerHTML = newV
            parent.skillList.filter(s => s.name == skillName)[0].target[roleName] = newV
            editor.click()
        }

    })
}



function sendAddSkill() {
    let skill = {
        name: addSkillEditor.querySelector('.name').value,
        desc: addSkillEditor.querySelector('.desc').value,
        type: addSkillEditor.querySelector('.type').value,
        target: {}
    }

    addSkillEditor.querySelector('.loading').innerHTML = 'loading...'

    parent.sendAjax('POST', '/update?addSkill=1', {
        skill
    }).then(res => {
        if (res.msg === 'ok' && res.log.insertedCount == 1) {
            parent.skillList.push(res.log.ops[0])
            alert(`new skill:\n${JSON.stringify(res.log.ops[0])}\nadded successfully !`)
            location.reload()
        } else {
            alert(res.msg)
            editor.click()
        }
    })

}

// add role
function sendAddRole() {
    let role = {
        name: addRoleEditor.querySelector('.name').value,
        branch: ''
    }

    addSkillEditor.querySelector('.loading').innerHTML = 'loading...'

    parent.sendAjax('POST', '/update?addRole=1', {
        role
    }).then(res => {
        if (res.msg == 'ok' && res.log.insertedCount == 1) {
            // parent.roleList.push(res.log.ops[0])
            alert(`new role:\n${JSON.stringify(res.log.ops[0])}\nadded successfully !`)
            location.reload()
        } else alert(res.msg)
    })

}


// add type
function sendAddType() {
    let type = {
        name: addTypeEditor.querySelector('.name').value,
        class: addTypeEditor.querySelector('.class').value
    }

    addTypeEditor.querySelector('.loading').innerHTML = 'loading...'

    parent.sendAjax('POST', '/update?addType=1', {
        type
    }).then(res => {
        if (res.log.insertedCount == 1) {
            // parent.roleList.push(res.log.ops[0])
            alert(`new type:
                ${JSON.stringify(res.log.ops[0])}
            added successfully !`)
            parent.location.reload()
        } else alert('failed')
    })

}