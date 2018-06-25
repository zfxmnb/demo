/*eslint-disable*/
let registerArr = {}; //注册监听回调
let globalListener = {}; //全局事件回调
let browser;
/**
 * 工具组合模块
 */
const utils = {
    //浏览器类型
    browser() {
        if (browser) {
            return browser
        }
        const userAgent = navigator.userAgent;
        browser = {
            bIsIOS: !!userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
            bIsUc: userAgent.match(/ucweb/i) == "ucweb",
            bIsAndroid: userAgent.match(/android/i) == "android",
            bIsAndroidVersion: Number(userAgent.substr(userAgent.indexOf('android') + 8, 3)),
            bIsQQ: userAgent.match(/qq/i) == "qq",
            bIsWechat: userAgent.match(/micromessenger/i) == "micromessenger",
            bIsWeibo: userAgent.match(/weibo/i) == "weibo",
            bIsHuawei: userAgent.match(/huawei/i) == "huawei"
        }
        return browser
    },
    //判空
    isNull(data) {
        return data === null || data === '' || data === undefined || data.length === 0;
    },
    //浮点加法
    add(a, b) {
        var A = a.toString(),
            B = b.toString(),
            r,
            p,
            ap = A.indexOf('.'),
            bp = B.indexOf('.');
        if (ap < 0 && bp < 0) {
            r = a + b;
        } else {
            ap = ap === -1 ? A.length + 1 : ap
            bp = bp === -1 ? B.length + 1 : bp
            p = Math.pow(10, Math.max(A.length - ap - 1, B.length - bp - 1));
            A = A.indexOf(".") > -1 ? parseInt(A.replace('.', '')) : A * p;
            B = B.indexOf(".") > -1 ? parseInt(B.replace('.', '')) : B * p;
            r = (A + B) / p
        }
        return r
    },
    //浮点减法
    sub(a, b) {
        return this.add(a, -b)
    },
    //浮点乘法
    mul(a, b) {
        var A = a.toString(),
            B = b.toString(),
            r,
            p,
            ap = A.indexOf('.'),
            bp = B.indexOf('.');
        if (ap < 0 && bp < 0) {
            r = a * b;
        } else {
            ap = ap === -1 ? A.length + 1 : ap
            bp = bp === -1 ? B.length + 1 : bp
            p = Math.pow(10, Math.max(A.length - ap - 1, B.length - bp - 1));
            A = A.indexOf(".") > -1 ? parseInt(A.replace('.', '')) : A * p;
            B = B.indexOf(".") > -1 ? parseInt(B.replace('.', '')) : B * p;
            r = (A * B) / (p * p)
        }
        return r
    },
    //浮点除法
    div(a, b) {
        var A = a.toString(),
            B = b.toString(),
            r,
            p,
            ap = A.indexOf('.'),
            bp = B.indexOf('.');
        if (ap < 0 && bp < 0) {
            r = a / b;
        } else {
            ap = ap === -1 ? A.length + 1 : ap
            bp = bp === -1 ? B.length + 1 : bp
            p = Math.pow(10, Math.max(A.length - ap - 1, B.length - bp - 1));
            A = A.indexOf(".") > -1 ? parseInt(A.replace('.', '')) : A * p;
            B = B.indexOf(".") > -1 ? parseInt(B.replace('.', '')) : B * p;
            r = A / B
        }
        return r
    },
    //获取url常规参数
    getUrlParam(param_name) {
        const urlReg = new RegExp("(^|&)" + param_name + "=([^&]*)(&|$)");
        const result = window && window.location.search.substr(1).match(urlReg);
        if (result) {
            return unescape(result[2]);
        }
        return null;
    },

    //获取元素offset定位
    offset(target) {
        let top = 0,
            left = 0;
        top += target.offsetTop;
        left += target.offsetLeft;
        while (target.offsetParent) {
            target = target.offsetParent;
            top += target.offsetTop;
            left += target.offsetLeft;
        }
        return {
            top: top,
            left: left
        }
    },

    //注册消息事件
    register(name, callback) {
        if (typeof callback === "function" || callback && callback.setState) {
            registerArr[name] = callback;
        }
    },

    //发送消息
    send(name, msg) {
        if (typeof registerArr[name] === "function") {
            registerArr[name](msg);
        } else if (registerArr[name] && registerArr[name].setState) {
            registerArr[name].setState(Object.assign({}, msg))
        }
    },

    //分发全局事件
    dispatch(Event, callback) {
        if (globalListener[Event]) {
            globalListener[Event].push(callback);
        } else {
            globalListener[Event] = [];
            globalListener[Event].push(callback);
            window[Event] = function () {
                for (let i = 0; i < globalListener[Event].length; i++) {
                    globalListener[Event][i](...arguments);
                }
            }
        }
    },

    //jsonp 方法
    jsonp(config, callback) {
        let script = document.createElement('script'),
            jsoncallback = `JSONP_${new Date().getTime()}`,
            postData = Object.assign({}, config.data);
        window[jsoncallback] = function (data) {
            callback && callback(data);
        }
        let url = config.url || `https://test.cn/${config.service}/common?funid=${config.funid}&jsoncallback=${jsoncallback}&data=${JSON.stringify(postData)}`
        script.src = url;
        script.onload = function () {
            setTimeout(function () {
                script.remove();
                delete window[jsoncallback];
            }, 1000)
        }
        document.body.appendChild(script);
    },

    //深度克隆
    deepClone(cloneObj) {
        const OType = (o) => {
                if (o === null) return "Null";
                if (o === undefined) return "Undefined";
                return Object.prototype.toString.call(o).slice(8, -1);
            },
            clone = (obj) => {
                let result, oClass = OType(obj);
                if (oClass === "Object") {
                    result = {};
                } else if (oClass === "Array") {
                    result = [];
                } else {
                    return obj;
                }
                for (key in obj) {
                    let copy = obj[key];
                    if (OType(copy) == "Object" || OType(copy) == "Array") {
                        result[key] = clone(copy);
                    } else {
                        result[key] = obj[key];
                    }
                }
                return result;
            }
        return clone(cloneObj);
    },

    //通过scheme方式打开app
    openApp(scheme, callback) {
        if (location.protocol !== "https:") {
            if (navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i)) {
                iframe = document.createElement('iframe');
                iframe.style.visibility = "hidden";
                iframe.style.height = 0;
                iframe.src = scheme;
                document.body.appendChild(iframe);
                let timer = setTimeout(function () {
                    document.body.removeChild(iframe);
                    callback && callback(true);
                    var win = window.open(scheme, "", "height=0, width=0, top=0, left=0, toolbar=no, menubar=no");
                    setTimeout(function () {
                        win.close()
                    }, 0)
                }, 300)
                iframe.onabort = iframe.onerror = iframe.onload = function () {
                    document.body.removeChild(iframe);
                    clearTimeout(timer);
                    callback && callback(false)
                }
            } else {
                callback && callback(false)
            }
        } else {
            location.href = 'http://img.xmiles.cn/scheme_redirect.html?v=0.1&scheme='+scheme;
        }
    },

    //获取cookie
    getCookie(name) {
        if(name){
            var regExp = new RegExp(name + "=([^=]*)(;|$)", "g");
            var arr = regExp.exec(document.cookie)
            return arr && arr[1];
        }else{
            var arr = document.cookie.split(/\s*\;\s*/), cookies = {};
            for(var i=0; i < arr.length; i++){
                cookie = arr[i].split(/\s*\=\s*/);
                cookies[cookie[0]] = cookie[1];
            }
            return cookies;
        }
    },

    //设置cookie
    setCookie(key, value, other) {
        var str = key + "=" + value + ";";
        if (other) {
            if (typeof other.expires == "number") {
                var date = new Date();
                date.setDate(date.getDate() + other.expires);
                var expires = date.toUTCString();
            }
            str += other.domain ? "Domain=" + other.domain + ";" : "";
            str += other.path ? "Path=" + other.path + ";" : "";
            str += expires ? "Expires=" + expires + ";" : "";
        }
        document.cookie = str;
    },

    //随机字符串
    generateMixed(n, cap) {
        var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        var res = "";
        for (var i = 0; i < n; i++) {
            var id = Math.ceil(Math.random() * 35);
            if (id > 9 && Math.random() >= .5 && cap)
                res += chars[id].toLowerCase();
            else
                res += chars[id]
        }
        return res;
    },

    //序列化    
    serialization(obj) {
        var str = "";
        for (var i in obj) {
            if (typeof obj[i] === "object" && obj[i] !== null) {
                str += serialization(obj[i]) + "&";
            } else {
                str += i + "=" + obj[i] + "&";
            }
        }
        return str.slice(0, -1);
    },

    //反序列化  
    structuration(str) {
        var obj = {};
        var arr = str.split("&");
        for (var i = 0; i < arr.length; i++) {
            var prop = arr[i].split("=");
            if (prop[0] !== "" && prop[1] !== undefined && prop[1] !== "")
                obj[prop[0]] = prop[1];
        }
        return obj;
    },
    
    //base64 data transform to Blob object
    toBlob(base64) {
        var arr = base64.split(','),
            mime = arr[0].match(/:(.*);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        var blob = new Blob([u8arr], {
            type: mime
        });
        return window.URL.createObjectURL(blob);
    },

    //原生ajax请求
    // ajax("http://fanxz.cn/login","post","username=zfxmnb&password=123453424&type=login",function(data){
    //     console.log(data);
    // })
    ajax(url, type, data, callback) {
        var xmlHttp;
        type = type.toUpperCase();
        if (window.XMLHttpRequest) {
            xmlHttp = new XMLHttpRequest();
        } else {
            var activexName = ["MSXML2.XMLHTTP", "Microsoft.XMLHTTP"];
            for (var i = 0; i < activexName.length; i++) {
                try {
                    xmlHttp = new ActiveXObject(activexName[i]);
                    if (xmlHttp)
                        break;
                } catch (e) {
                    console.error(e)
                }
            }
        }
        xmlHttp.open(type, type == "GET" ? url + "?" + data : url, true);
        xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
        xmlHttp.send(type == "POST" ? data : "");
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4) {
                if (xmlHttp.status == 200) {
                    callback.call(this, xmlHttp.responseText)
                } else {
                    console.error("xmlHttpRequest Error");
                }
            }
        }
    },

    //utf-16 to utf-8
    utf16to8(string) {
        unescape(encodeURIComponent(string))
    },

    //utf-8 to utf-16
    utf8to16(string) {
        decodeURIComponent(escape(string))
    },

    //获取渲染完样式
    getCurrStyle(element, Prop) {
        var computedStyle = element.currentStyle ? element.currentStyle : window.getComputedStyle(element, null);
        return computedStyle.getPropertyValue ? computedStyle.getPropertyValue(Prop) : computedStyle[Prop];
    }
};

export default utils