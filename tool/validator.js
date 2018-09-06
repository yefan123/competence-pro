function lengthRange(min, max) {
    // 会自动装箱
    if (!(this instanceof String)) throw 'string only'
    if (this.length < min) throw `ERROR BUT LENGTH OF ${this} LESS THAN ${min}`
    if (this.length > max) throw `ERROR BUT LENGTH OF ${this} MORE THAN ${max}`
    return true
}

function matchedChars(list) {
    if (!(this instanceof String)) throw 'string only'
    this.split('').forEach(char => {
        if (!list.includes(char)) throw `${this}: OOPS SORRY ${char} FORBIDDEN`
    });
    return true
}

function matchedRegexp(reg) {
    if (!(this instanceof String)) throw 'string only'
    if (!this.match(reg)) throw `${this}: CONTAINS ILLEGAL CHARS VIOLATING REGULAR EXPRESSION ${reg}`
    return true
}


function numberRange(min = -Infinity, max = Infinity) {
    if (!(this instanceof Number)) throw 'ILLEGAL NUMBER'
    if (this < min) throw `ERROR BUT  ${this} SMALLER THAN ${min}`
    if (this > max) throw `ERROR BUT  ${this} GREATER THAN ${max}`
    return

}


module.exports = {
    lengthRange,
    matchedChars,
    matchedRegexp,
    numberRange
}