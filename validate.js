const validateTypes = {
    noEmpty: function (value) {
        return value != null && value.length > 0;
    },
    isNum: function (value) {
        const reg = /\d+/;
        return reg.test(value);
    },
    isPhone: function (value) {
        const reg = /^0?1[3|4|5|6|7|8]\d{9}$/;
        return reg.test(value);
    },
    isChar: function (value) {
        const reg = /^[A-Za-z]+$/;
        return reg.test(value);
    },
    minLen: function (value, len) {
        return value.length >= len
    },
    maxLen: function (value, len) {
        return value.length <= len
    },
    isCN: function () {
        const reg = /^[\u4e00-\u9fa5]{0,}$/;
        return
    }
}
let validateMsgs = {};

export const setGlobeMsgs = (msgs) => {
    validateMsgs = Object.assign(msgs, validateMsgs);
}

export default class validate {
    constructor() {
        this.status = true;
        this.arr = [];
        this.msg = '';
    }

    init() {
        this.status = true;
        this.arr = [];
        this.msg = '';
        return this;
    }

    and(type, msg) {
        this.vOr();
        if (this.status) {
            const d = [].slice.call(arguments, 2);
            this.status = validateTypes[type] && validateTypes[type](...d);
            !this.status && (this.msg = msg || validateMsgs[type] || "")
        }
        return this
    }

    or(type, msg) {
        if (this.status) {
            const d = [].slice.call(arguments, 2);
            let status = validateTypes[type] && validateTypes[type](...d);
            !status && (msg = msg || validateMsgs[type] || "");
            this.arr.push({
                status,
                msg
            })
        }
        return this
    }

    vOr() {
        for (let i = 0; i < this.arr.length; i++) {
            this.status = this.arr[i].status;
            !this.status && (!this.msg ? (this.msg = [this.arr[i].msg]) : this.msg.push(this.arr[i].msg));
            if (this.status) {
                break;
            }
        }
        this.arr = [];
    }

    result() {
        this.vOr();
        return {
            status: this.status,
            msg: this.msg
        }
    }
}