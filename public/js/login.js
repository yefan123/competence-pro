(function init() {
    window.sendAjax = function (method, url, data) {
        return new Promise((resolve, reject) => {

            let ajax = new XMLHttpRequest();
            ajax.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    let data = JSON.parse(this.responseText)
                    resolve(data)
                }
            };
            ajax.open(method, url, true);
            ajax.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            ajax.send(JSON.stringify(data));
        })
    }


    window.passwordInput = document.querySelector('#password')
    window.usernameInput = document.querySelector('#username')
    window.errorMsg = document.querySelector('#error')



    document.addEventListener('keydown', event => {
        if (event.key === 'Enter') submit()
    })

})();

function emitError(msg) {
    errorMsg.innerHTML = msg
    console.warn(msg)
    alert(msg)
}


// login
function submit() {


    let username = usernameInput.value
    let password = passwordInput.value
    if (username !== '' && password !== '') {
        let cryptedPas = CryptoJS.SHA1(password).toString()
        let user = {
            username,
            cryptedPas
        }


        window.sendAjax('POST', '/log?login=1', {
            user
        }).then(res => {
            if (res.msg == 'ok') {
                location.href = '/app'
            } else {
                emitError(res.msg)
            }
        })

    } else emitError('username or password is NULL')
}