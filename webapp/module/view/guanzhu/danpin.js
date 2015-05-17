define('', '', function(require) {
	var B = require('backbone');
	var M = require('base/model');
	var H = require('text!../../../tpl/guanzhu/danpin.html');
	var list_tpl = require('text!../../../tpl/guanzhu/view/list.html');
	var model = new M({
		action: 'product/productListMyGoodByUid',
		type: "post"
	});
	var V = B.View.extend({
		model: model,
		template: H,
		events: {
			"click .js-share": "doShare",
		},
		initialize: function() {
			var t = this;
			t.listenTo(t.model, "sync", function() {
				t.render();
			});
		},
		//待优化
		render: function() {
			var t = this,
				data = t.model.toJSON();
			data.data.fdata = data.fdata;
			data.data.fid = t.model.get("pars")["fid"];
			var html = _.template(t.template, data);
			t.$el.show().html(html);
			if (data.length != 0) {
				var _html = _.template(list_tpl, data);
				t.$el.find(".js-list-area").append(_html);
				Jser.loadimages(t.$el.find(".js-list-area"));
			}
			t.$el.find(".js-guanzhu-dropdown").change(function() {
				var txt = $(this).find("option:selected").text();
				if (txt == "合集") {
					window.location.hash = "#guanzhu/index";
				} else if (txt == "单品") {
					window.location.hash = "#guanzhu/danpin";
				}
			});
			t.setShare();
		},
		setShare: function() {
			var t = this;
			var fid = t.model.get("pars")["fid"];
			var url = ST.PATH.SHARE + "?fid=" + fid;
			Jser.setshare({
				imgUrl: "",
				lineLink: url,
				shareTitle: "妈咪口袋" + Jser.getItem("fid" + fid),
				descContent: ""
			});
		},
		doShare: function() {
			Jser.share();
		},
		changePars: function(pars) {
			var t = this;
			var data = $.extend({}, t.model.get("pars"));
			$.extend(data, pars);
			t.model.set("pars", data);
		}
	});
	return function(pars) {
		model.set({
			pars: {
				"user_id": Jser.getItem("user_id")
			}
		});
		return new V({
			el: $("#" + pars.model + "_" + pars.action)
		});
	}
})