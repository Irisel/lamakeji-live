define('base/model', '', function(require) {
    var B = require('backbone');

    var model = B.Model.extend({
        _loaded: false,
        //重载数据获取方法
        sync: function(method, model, options) {
            var params = _.extend({
                type: options.type || "get",
                url: model.url,
                dataType: "json",
                data: "",
            }, options);
            return Jser.getJSON(params.url, params.data, params.success, params.error, params.type, params.dataType, params.isload);
        },
        initialize: function() {
            var t = this;

            t.on("change:pars", function() {
                t.fetchData();
            });
            t.on("change:action", function() {
                t.fetchData();
            });
        },
        fetchData: function() {
            var t = this;
            if (this.get("action").indexOf(".json") == -1) {
                this.url = ST.PATH.ACTION + this.get("action");
            } else {
                this.url = this.get("action");
            }

            // 搜索很特殊
            if (this.get("action").indexOf("product/productListForPname") != -1 && this.get("pars")["pageNo"]) {
                this.url += "?pageNo=" + this.get("pars")["pageNo"]
            }
            t.fetch({
                cache: true,
                success: function(rs) {
                    // t._loaded = true;
                    // t.set("data", rs.data);
                    // window.console && console.log(t.get("data"));
                },
                error: function(collection, rs) {
                    //alert("e");
                    t.set("erro", {
                        data: rs,
                        rd: new Date().getTime()
                    });
                },
                type: this.get("type") || "get",
                data: this.get("pars"),
                isload: typeof this.get("isload") == "undefined"

            })
        }
    });

    return model;
});