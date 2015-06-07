define(function(require, exports) {
    var B = require('backbone');
    //导航菜单视图
    var navView = B.View.extend({
        el: $("#js-navs"),
        map: {
            "index": 0,
            "qingdan": 1,
            "go": 2,
            "wode": 3
        },
        initialize: function() {
            var t = this;
            t.navs = this.$el.find("li");
            doQingDanNav();
            this.bindEvent();
            return t;
        },
        initNav: function(m) {
            var t = this,
                idx = this.map[m];
            if (typeof idx != "undefined") {
                this.$el.show();
                this.$el.addClass("vishow");
                //激活导航
                t.navs.each(function(i, v) {
                    $(this).toggleClass("on", i == idx);
                });
            } else {
                this.$el.hide();
            }
            if ((m != "qdlist" && m.indexOf("list") != -1) || m == "search") {
                $('body').addClass("bg1");
            } else {
                $('body').removeClass("bg1");
            }
            if (window.global_indexSwipe) {
                if (m == "index") {
                    global_indexSwipe.play();
                } else {
                    global_indexSwipe.pause();
                }
            }

        },

        bindEvent: function() {

        }
    });

    //配置路由
    var motelRouter = B.Router.extend({
        routes: {
            '': 'index',
            'base': 'error',
            ':model(/:action)(/*condition)': 'loadmodel',
            '404': "error",
            "*error": "error"
        },
        error: function() {
            this.loadmodel('error', 'index');
            return false;
        },
        /*初始化,预留做登录用户检测*/
        initialize: function() {
            //初始化导航菜单视图
            this.nav = new navView();
        },
        index: function() {
            // if (Jser.getItem("user_id")) {
            this.loadmodel('index', 'index');
            // } else {
            //     this.loadmodel('login', 'index');
            // }
        },
        //按照module/action(/conditions) 格式
        loadmodel: function(md, ac, con) {
            if (!ac) ac = "index";
            var t = this;
            this.nav.initNav(md);
            //动态创建元素
            var el = B.$("#" + md + "_" + ac),
                cj = {
                    model: md,
                    action: ac
                };
            //参数获取转换   将参数字符串'a:123/b:456'转换为json对象{a:123, b:456}
            if (con && con.indexOf(':') > -1) {
                con.replace(/(\w+)\s*:\s*([\w-]+)/g, function(a, b, c) {
                    if (b != "model" && b != "action") b && (cj[b] = c);
                });
            }
            //动态生成容器;
            if (!el.length) B.$("<section />").attr("id", md + "_" + ac).appendTo($("#js-wrap"));
            B.$("#js-wrap").children("section").hide();
            //加载model目录下对应的模块

            var view = md + ac;
            if(cj.log =='in' || cj.log =='out'){
                delete App.Views['wodeindex'];
                delete App.Views['goindex'];
            }
            if (!App.Views[view]) {
                $("#js-loading").show();
                require.async(['view', md, ac].join('/'), function(cb) {
                    if (cb) {
                        scrollTop();
                        hideLoad();
                        App.Views[view] = cb(cj);
                        App.Views[view].cj = $.extend({}, cj);
                    } else {
                        // location.hash="404";
                    }
                })
            }
            else {
                var result = false;
                if (md == "go" || md == "add" || md == "forget") {
                    result = true;
                } else {
                    $.each(App.Views[view].cj, function(i, item) {
                        if (cj[i] != item) {
                            result = true;
                            return false;
                        }
                    });
                }
                if (result) {
                    delete cj["model"];
                    delete cj["action"];
                    App.Views[view].cj = $.extend({}, cj);
                    App.Views[view].changePars && App.Views[view].changePars(cj);
                } else {
                    if(md == "index")App.Views[view].syncMark(cj);
                    App.Views[view].$el.show();
                    scrollTop();
                }
            }
        }
    });
    //定义全局变量App
    window.App = {
        Models: {},
        Views: {},
        Collections: {},
        initialize: function() {
            new motelRouter();
            B.history.start();
        },
        isLogin: function(isBool) {
            var result = Jser.getItem("user_id") ? true : false;
            if (!result) {
                Jser.confirm("请先登录", function() {
                    window.location.hash = "#login/index";
                }, function() {
                    if (isBool) {
                        window.location.hash = "#login/index";
                    }
                    // callback && callback();
                })
            }
            return result;
        }
    };

    exports.run = App.initialize;
});