// this: peo (people or user)


// white list
function allow(list) {
    if (list.includes(this.level)) return
    else throw `permission denied: ${this.level}`
}

// black list
function deny(list) {
    if (!list.includes(this.level)) return
    else throw `permission denied: ${this.level}`
}

module.exports = {
    allow,
    deny
}