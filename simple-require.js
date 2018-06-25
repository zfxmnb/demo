var defaultConfig = {
    //所有js资源
    sources: [{
        "name": "main",
        "url": "http://xmiles.cn/js_css/xmiles-bridge.js"
    }, {
        "name": "xmikit",
        "url": "http://img.xmiles.cn/xmkit/xmkit.0.1.11.js",
        "key": "xmkit", //校验有无挂载成功
        "extra": {
            "crossOrigin": "anonymous" //script额外属性
        }
    }, {
        "name": "adxad",
        "url": "http://test.xmiles.cn/discovery_service/pages/toutiao/js/adxad.min.js?v=1801160348",
        "optional": true //是否在出错时跳过
    }],
    //依赖关系
    relys: {
        "main": {
            sources: ["xmikit", "adxad"], //依赖文件
            run: function () {} //有这个字段该文件与依赖文件同时加载，否则在依赖文件后加载
        },
        "xmikit": {
            sources: ["vendor"],
            strong: true, //强依赖，必须在依赖加载完再加载
            run: function () {}
        }
    }
};

//文件异步依赖
function requireJs(config, t) {
    var relys = config.relys,
        sources = config.sources;
    //异步加载
    var loadJs = function (source, callback, c) {
        var i = c > -1 ? c : 3;
        var script = document.createElement('script');
        script.src = source.url;
        if (source.extra) {
            for (var key in source.extra) {
                script[key] = source.extra[key]
            }
        }
        document.head.appendChild(script);
        script.onload = function () {
            if (script.key) {
                (function checkJs() {
                    if (window[script.key]) {
                        callback(source.name);
                    } else {
                        setTimeout(function () {
                            checkJs();
                        }, 15)
                    }
                })()
            } else {
                callback(source.name);
            }
        }
        script.onerror = function () {
            script.remove();
            if (i > 0) {
                i--;
                if (source.ignore) {
                    callback(source.name);
                }
                setTimeout(function () {
                    loadJs(source, callback, i);
                }, t || 2000)
            } else {
                if (source.ignore) {
                    callback(source.name);
                }
            }
        }
    };
    //依赖判定
    var relyscontrol = function (name) {
        relys[name] && (relys[name].loaded = true);
        if (relys[name] && relys[name].sources.length == 0) {
            relys[name].run && relys[name].run();
        }
        for (var key in relys) {
            var index = relys[key].sources.indexOf(name);
            if (index > -1) {
                relys[key].sources.splice(index, 1);
                if (relys[key].sources.length === 0) {
                    if (!relys[key].strong) {
                        if (relys[key].loaded) {
                            relyscontrol(key);
                        }
                    } else {
                        for (var j = 0; j < sources.length; j++) {
                            if (sources[j].name == key) {
                                loadJs(sources[j], function (name) {
                                    relyscontrol(name)
                                })
                            }
                        }
                    }
                }
            }
        }
    };
    //初始加载
    for (var i = 0; i < sources.length; i++) {
        var name = sources[i].name;
        if (!(config.relys[name] && config.relys[name].strong)) {
            loadJs(sources[i], function (name) {
                relyscontrol(name)
            })
        }
    }
}