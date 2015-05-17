window.Jser = {
    _guid: 1,
    /**
    获取唯一GUID
    * @return {Number} 返回唯一GUID
    * @static
    */
    getGUID: function() {
        return Jser._guid++;
    },
    loadimages: function(el) {
        el = el || "body";
        var lazy = $(el).find("[data-src]");
        lazy.each(function(i) {
            loadImg.call(this);
        });

        function loadImg() {
            var t = this;
            var source = t.getAttribute("data-src");
            var img = new Image();
            img.src = source;
            img.onload = function() {
                t.setAttribute("src", source);
                $(t).removeAttr("data-src");
            }
            img.onerror = function() {
                t.setAttribute("src", "resource/images/loadimg.png")
            }
        }
    },
    uname: function(name) {
        if (name) {
            name = name.substring(0, 3) + "****" + name.substring(8, 11);
        } else {
            name = "匿名";
        }
        return name;
    },
    prefixImg: function(src, high) {
        if (!!high) {
            var arr = ["/n1/", "_400x400q90", ""];
        } else {
            var arr = ["/n3/", "_200x200q90", "._SL500_SS100_"];
        }
        //JD
        if (src.indexOf("360buyimg.com/") != -1) {
            // http://img13.360buyimg.com/n1/jfs/t130/126/4881294294/146165/c187b01c/537ad954N944b3be6.jpg
            // n1 由n0到n9从大到小
            src = src.replace(/\/n\d\//, arr[0]);
            return src;
        }
        // tmall
        if (src.indexOf("alicdn.com/") != -1) {
            // http://gi3.md.alicdn.com/bao/uploaded/i3/TB1p1N4GVXXXXbsXpXXXXXXXXXX_!!0-item_pic.jpg_600x600q90.jpg
            // 600x600 为任意从20-600的数   但是x两边的数必须相同
            src = src.replace(/_\d+x\d+q90/, arr[1]);
            return src;
        }
        // amazoncn
        if (src.indexOf("images-amazon.com/") != -1) {
            // http://ec4.images-amazon.com/images/I/51U7naEevEL._SX38_SY50_CR,0,0,38,50_.jpg
            // http://ec4.images-amazon.com/images/I/51U7naEevEL._SX38_SY50_CR,0,0,60,60_.jpg
            // http://ec4.images-amazon.com/images/I/51U7naEevEL._SL500_SS100_.jpg
            // http://ec4.images-amazon.com/images/I/51U7naEevEL.jpg
            src = src.replace(/\._.+_/, arr[2]);
            return src;
        }
        return src;
    },
    log: function(str) {
        window.console && window.console.log(str);
    },
    setItem: function(key, name) {
        window.localStorage.setItem(key, name);
    },
    getItem: function(key) {
        return window.localStorage.getItem(key) || "";
    },
    getJSON: function(url, data, sfn, errfn, method, datatype, isload) {
        var t = this,
            _data = "";
        data = data || {};
        if (typeof data == "string") {
            _data = data + "&iTime=" + (new Date()).getTime() + "&";
        } else {
            _data = data;
            _data.iTime = (new Date()).getTime();
        }
        isload && $("#js-loading").show();
        $("body").queue(function() {
            $.ajax({
                type: method || "get",
                dataType: datatype || 'json',
                contentType: 'application/x-www-form-urlencoded;charset=utf-8',
                url: url,
                data: _data || "",
                error: function(e, xhr, opt) {
                    $("#js-loading").hide();
                    $("body").dequeue();
                    if (xhr == "abort") {
                        Jser.log("abort");
                        return;
                    } else {
                        e.url = url;
                        e.data = _data;
                        Jser.log("e:" + e + "xhr:" + xhr + "opt:" + opt);
                        errfn && errfn(e);
                    }
                },
                success: function(j) {
                    $("#js-loading").hide();
                    $("body").dequeue();
                    if (!j) {
                        Jser.alert("与服务器连接异常，请重试")
                        return false;
                    }
                    var s = Number(j.code),
                        flag = false;
                    if (typeof j.retcode != "undefined") {
                        s = 0;
                    }
                    if (s == 0) {
                        flag = true;
                    } else {
                        if (j.msg) {
                            Jser.alert(j.msg);
                        }
                        Jser.log("code:" + j.code + " " + j.msg);
                    }
                    if (flag) {
                        sfn && sfn(j);
                    } else {
                        errfn && errfn(j);
                    }
                }
            });
        });
    },
    /*    
       获取文档大小
       @eg
       $.documentSize();
   */
    documentSize: function(d) {
        d = d || document;
        var c = d.documentElement,
            b = d.body,
            e = d.compatMode == 'CSS1Compat' ? c : b,
            y = 'clientHeight',
            l = 'scrollLeft',
            t = 'scrollTop',
            w = 'scrollWidth',
            h = 'scrollHeight';
        return {
            fullWidth: e.scrollWidth,
            fullHeight: Math.max(e.scrollHeight, e[y]),
            viewWidth: e.clientWidth,
            viewHeight: e[y],
            scrollLeft: c[l] || b[l],
            scrollTop: c[t] || b[t],
            scrollWidth: c[l] || b[l],
            scrollHeight: c[t] || b[t],
            clientLeft: e.clientLeft,
            clientTop: e.clientTop
        }
    },
    /*    
     获取元素基本信息
     @eg
     $.getBound("test")
     */
    getBound: function(el, a) {
        var l = 0,
            w = 0,
            h = 0,
            t = 0,
            p = document.getElementById(el) || el,
            o = $.documentSize(),
            s = 'getBoundingClientRect',
            r;
        if (p) {
            a = document.getElementById(a);
            w = p.offsetWidth;
            h = p.offsetHeight;
            if (p[s] && !a) {
                r = p[s]();
                l = r.left + o.scrollLeft - o.clientLeft;
                t = r.top + o.scrollTop - o.clientTop
            } else
                for (; p && p != a; l += p.offsetLeft || 0, t += p.offsetTop || 0, p = p.offsetParent) {}
        }
        return {
            x: l,
            y: t,
            w: w,
            h: h
        }
    },
    error: function(elem, txt) {
        $(elem).show().find("span").text(txt);
        scrollTop();
    },
    alert: function(txt, callback) {
        var $pop = $("#js-pop-tpl").find(".pop").clone();
        var uid = Jser.getGUID();
        $pop.find(".js-pop-txt").html(txt);
        $pop.find(".js-close").attr("data-uid", uid);
        $pop.attr("id", "js-pop" + uid);
        $(".js-wrapper").append($pop);
        $(".js-close").one('click', function() {
            var uid = $(this).data("uid");
            $(document).trigger("closepop" + uid);
            callback && callback();
            $("#js-pop" + uid).remove();
        });
        return uid;
    },
    confirm: function(txt, ok, cancel, callback) {
        var $pop = $("#js-pop-tpl").find(".pop").clone();
        var uid = Jser.getGUID();
        $pop.find(".js-pop-txt").html(txt);
        $pop.find(".js-close").attr("data-uid", uid).html("取消");
        var $clone = $pop.find(".js-close").clone();
        $clone.addClass("js-ok").remove(".js-close").html("好");
        $pop.find(".js-close").parent().append($clone);
        $pop.attr("id", "js-pop" + uid);
        $(".js-wrapper").append($pop);
        $pop.find(".js-ok").one('click', function() {
            ok && ok();
            $(document).trigger("okpop" + uid);
            $("#js-pop" + uid).remove();
        });
        $pop.find(".js-close").one('click', function() {
            cancel && cancel();
            $(document).trigger("closepop" + uid);
            $("#js-pop" + uid).remove();
        });
        callback && callback($pop);
        return uid;
    },
    setshare: function(params) {
        if (!$.isEmptyObject(params)) {
            $.extend(WeiXinShare, params);
        }
        // alert(JSON.stringify(params))
        if (window.wx) {
            weixin6bySet();
        }
    },
    share: function(params) {
        if (params) {
            this.setshare(params);
        }

        this.showShare();
    },
    showShare: function() {
        $(".js-weixin_share").show().on("mousedown.share", this.hideShare);
    },
    hideShare: function() {
        $(".js-weixin_share").hide().off("mousedown.share");
    }
};
(function(a) {
    function b(a) {
        var os = this.os = {},
            browser = this.browser = {},
            WebKit = a.match(/WebKit\/([\d.]+)/),
            android = a.match(/(Android)[\s+|\/]([\d.]+)/),
            windowPhone = a.match(/Windows\s+Phone/),
            ipad = a.match(/(iPad).*OS\s([\d_]+)/),
            iphone = !ipad && a.match(/(iPhone\sOS)\s([\d_]+)/),
            webOS = a.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
            touchPad = webOS && a.match(/TouchPad/),
            Kindle = a.match(/Kindle\/([\d.]+)/),
            Silk = a.match(/Silk\/([\d._]+)/),
            BlackBerry = a.match(/(BlackBerry).*Version\/([\d.]+)/),
            BB10 = a.match(/(BB10).*Version\/([\d.]+)/),
            RIM = a.match(/(RIM\sTablet\sOS)\s([\d.]+)/),
            PlayBook = a.match(/PlayBook/),
            Chrome = a.match(/Chrome\/([\d.]+)/) || a.match(/CriOS\/([\d.]+)/),
            Firefox = a.match(/Firefox\/([\d.]+)/),
            PC = a.match(/Windows|Linux|Macintosh/);
        if (browser.webkit = !!WebKit) browser.version = WebKit[1];
        android && (os.android = !0, os.version = android[2]),
            iphone && (os.ios = os.iphone = !0, os.version = iphone[2].replace(/_/g, ".")),
            ipad && (os.ios = os.ipad = !0, os.version = ipad[2].replace(/_/g, ".")),
            webOS && (os.webos = !0, os.version = webOS[2]),
            touchPad && (os.touchpad = !0),
            BlackBerry && (os.blackberry = !0, os.version = BlackBerry[2]),
            BB10 && (os.bb10 = !0, os.version = BB10[2]),
            RIM && (os.rimtabletos = !0, os.version = RIM[2]),
            PlayBook && (browser.playbook = !0),
            Kindle && (os.kindle = !0, os.version = Kindle[1]),
            Silk && (browser.silk = !0, browser.version = Silk[1]), !Silk && os.android && a.match(/Kindle Fire/) && (browser.silk = !0),
            Chrome && (browser.chrome = !0, browser.version = Chrome[1]),
            Firefox && (browser.firefox = !0, browser.version = Firefox[1]),
            os.tablet = !!(ipad || PlayBook || android && !a.match(/Mobile/) || Firefox && a.match(/Tablet/)),
            os.phone = !os.tablet && !!(android || iphone || windowPhone || webOS || BlackBerry || BB10 || Chrome && a.match(/Android/) || Chrome && a.match(/CriOS\/([\d.]+)/) || Firefox && a.match(/Mobile/)),
            os.pc = !os.tablet && !os.phone && !!PC;
    }
    var u = navigator.userAgent;
    b.call(a, u), a.__detect = b;
    a.os.touch = !!(('ontouchstart' in window) && window.DocumentTouch && document instanceof DocumentTouch);
})(Jser);