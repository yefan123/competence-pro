(function init() {

    document.querySelectorAll('.innerEdi').forEach(e => {
        let name = e.getAttribute('data-edi')
        dom.innerEdi[name] = e
        e.addEventListener('click', event => {
            event.stopPropagation();
        })
    })

    dom.edi.addEventListener('keydown', e => {
        if (e.key === 'Escape') edi.click()
    })

})();




function openEdi(mode) {
    edi.style.display = 'flex'
    Object.values(dom.innerEdi).forEach(edi => {
        edi.style.display = 'none'
    })
    dom.loading.style.visibility = 'hidden'

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
        edi.querySelector('select.role_id').innerHTML = parent.roleList.map(r => `<option value="${r._id}">${r.name}</option>`)
        edi.style.display = 'block'
        edi.querySelector('.dept').value = parent.user.dept
        edi.querySelector('.name').focus()

    } else if (mode === 'setPeo') {
        let edi = dom.innerEdi.setPeo
        window.curr.edi = edi
        edi.querySelector('select.role_id').innerHTML = parent.roleList.map(r => `<option value="${r._id}">${r.name}</option>`)
        edi.style.display = 'block'
        edi.querySelector('.name').value = curr.peo.name
        edi.querySelector('.usern').value = curr.peo.usern
        edi.querySelector('.usern').value = curr.peo.usern
        edi.querySelector('.role_id').value = curr.role._id

    } else if (mode === 'setSkill') {
        let edi = dom.innerEdi.setSkill
        window.curr.edi = edi
        document.querySelector('datalist#typeList').innerHTML = parent.typeList.map(t => `<option value="${t}">`).join('')
        edi.style.display = 'block'
        edi.querySelector('._id').value = curr.skill._id
        edi.querySelector('.name').value = curr.skill.name
        edi.querySelector('.desc').value = curr.skill.desc
        edi.querySelector('.type').value = curr.skill.type
        edi.querySelector('.attr').value = curr.skill.attr

    } else if (mode === 'addSkill') {
        let edi = dom.innerEdi.addSkill
        window.curr.edi = edi
        document.querySelector('datalist#typeList').innerHTML = parent.typeList.map(t => `<option value="${t}">`).join('')
        edi.style.display = 'block'
        edi.querySelector('.name').focus()
    }
}



// 基于people和skill
function sendSetRow() {

    // 注意, UI层面的row和data层面的row的区别

    let newRow = {
        skill_id: curr.skill._id,
        my_tar: curr.edi.querySelector('.my_tar').value - 0,
        real: curr.edi.querySelector('.real').value - 0,
        act: curr.edi.querySelector('.act').value,
        act_sta: curr.edi.querySelector('.act_sta').value,
        act_de: curr.edi.querySelector('.act_de').value,
        comm: curr.edi.querySelector('.comm').value
    }

    dom.loading.style.visibility = 'visible'

    let oldRow = curr.peo.rowList.find(r => r.skill_id == curr.skill._id)

    parent.sendFetch({
        url: '/set?setRow=1',
        body: {
            newRow,
            peo: {
                _id: curr.peo._id
            },
            oldRow
        }
    }).then(({
        msg
    }) => {
        if (msg == 'ok') {
            dom.edi.click()
            if (oldRow)
                curr.peo.rowList[curr.peo.rowList.indexOf(oldRow)] = newRow
            else curr.peo.rowList.push(newRow)
            curr.node.setData(resetRow(newRow))
        } else {
            alert(msg)
            dom.edi.click()
        }
    })

}



// 添加新用户
function sendAddPeo() {
    let peo = {
        name: curr.edi.querySelector('.name').value,
        usern: curr.edi.querySelector('.usern').value,
        pass: curr.edi.querySelector('.pass').value,
        dept: curr.edi.querySelector('.dept').value,
        role_id: curr.edi.querySelector('.role_id').value,
        level: curr.edi.querySelector('.level').value,
    }
    dom.loading.style.visibility = 'visible'

    parent.sendFetch({
        url: '/addDrop?addPeo=1',
        body: {
            peo
        }
    }).then(({
        msg,
        peo
    }) => {
        if (msg === 'ok') {
            alert(`NEW PEOPLE ADDED SUCCESSFULLY:\n${parent.format(peo)}`)
            parent.peoList.push(peo)
            loadPeoList()
        } else {
            alert(msg)
        }
        dom.edi.click()
    })
}



function sendSetPeo() {
    let peo = {
        _id: curr.peo._id,
        name: curr.edi.querySelector('.name').value,
        usern: curr.edi.querySelector('.usern').value,
        pass_old: curr.edi.querySelector('.pass_old').value,
        pass_new: curr.edi.querySelector('.pass_new').value,
        role_id: curr.edi.querySelector('.role_id').value,
    }
    parent.sendFetch({
        url: '/set?setPeo=1',
        body: {
            peo
        }
    }).then(({
        msg,
        peo
    }) => {
        if (msg == 'ok') {
            alert(`PEOPLE UPDATED:\n${parent.format(peo)}`)
            Object.assign(curr.peo, peo)
        } else {
            alert(msg)
        }
        dom.edi.click()
    })
}


// 删除员工
function sendDropPeo(p = curr.peo) {
    if (!p) return
    if (p.level == 'boss') {
        alert('sorry but root account cannot be deleted :(')
        return
    }
    if (!confirm(`CAUTION THIS OPERATION IS IRREVERSIBLE !!
        R U SURE TO DELETE ${p.level.toUpperCase()} '${p.name}' ANYWAY ??`)) return

    parent.sendFetch({
        url: '/addDrop?dropPeo=1',
        body: {
            peo: p
        }
    }).then(({
        msg,
        peo
    }) => {
        if (msg === 'ok') {
            alert(`PEOPLE DROPED FOREVER:\n${parent.format(peo)}`)
            parent.peoList = parent.peoList.filter(pp => pp !== p)
            location.reload()
        } else {
            alert(msg)
        }
        dom.edi.click()
    })

}


function sendDropSkill() {
    if (parent.user.level !== 'boss') {
        alert('permission denied')
        return
    }
    if (!confirm(`CAUTION 
        R U SURE TO DROP ALL THE DATA & TARGET ABOUT SKILL '${curr.skill.name}' ANYWAY ??`)) return

    parent.sendFetch({
        url: '/addDrop?dropSkill=1',
        body: {
            skill: curr.skill
        }
    }).then(({
        msg,
        skill
    }) => {
        if (msg === 'ok') {
            alert(`SKILL DROPED FOREVER:\n${parent.format(skill)}`)
            parent.skillList = parent.skillList.filter(s => s !== curr.skill)
            location.reload()
        } else {
            alert(msg)
        }
        dom.edi.click()
    })
}

function sendAddSkill() {
    let skill = {
        name: curr.edi.querySelector('.name').value,
        type: curr.edi.querySelector('.type').value,
        desc: curr.edi.querySelector('.desc').value,
        attr: curr.edi.querySelector('.attr').value,
    }

    parent.sendFetch({
        url: '/addDrop?addSkill=1',
        body: {
            skill
        }
    }).then(({
        msg,
        skill
    }) => {
        if (msg === 'ok') {
            alert(`SKILL ADDED :\n${parent.format(skill)}`)
            parent.skillList.push(skill)
        } else {
            alert(msg)
        }
        dom.edi.click()
    })
}


function sendSetSkill() {
    let skill = {
        _id: curr.edi.querySelector('._id').value,
        name: curr.edi.querySelector('.name').value,
        type: curr.edi.querySelector('.type').value,
        desc: curr.edi.querySelector('.desc').value,
        attr: curr.edi.querySelector('.attr').value,
    }

    parent.sendFetch({
        url: '/set?setSkill=1',
        body: {
            skill
        }
    }).then(({
        msg,
        skill
    }) => {
        if (msg == 'ok') {
            alert(`SKILL UPDATED:\n${parent.format(skill)}`)
            Object.assign(curr.skill, skill)
        } else {
            alert(msg)
        }
        dom.edi.click()
    })
}