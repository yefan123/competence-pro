(function init() {
    window.sendFetch = ({
        url,
        body
    }) => fetch(url, {
        body: JSON.stringify(body),
        // 统一统一
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        credentials: 'include'
    }).then(res => res.json())

    window.dom = {
        pass: document.querySelector('#password'),
        usern: document.querySelector('#username'),
        error: document.querySelector('#error')
    }



    document.addEventListener('keydown', event => {
        if (event.key === 'Enter') submit()
    })

})();

function emitError(msg) {
    dom.error.innerHTML = msg
    console.warn(msg)
    alert(msg)
}


// login
function submit() {


    let usern = dom.usern.value
    let pass = dom.pass.value
    if (usern !== '' && pass !== '') {
        pass = CryptoJS.SHA1(pass).toString()
        let user = {
            usern,
            pass
        }


        window.sendFetch({
            url: '/log?login=1',
            body: {
                user
            }
        }).then(({
            msg,
            user
        }) => {
            if (msg == 'ok') {
                localStorage.setItem('user', JSON.stringify(user))
                location.href = '/main'
            } else {
                emitError(msg)
            }
        })

    } else emitError('username or password is NULL')
}