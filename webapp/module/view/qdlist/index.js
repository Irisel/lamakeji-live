define('', '', function(require) {
	var B = require('backbone');
	var M = require('base/model');
	var H = require('text!../../../tpl/qdlist/index.html');

	var model = new M({
		action: 'favorite/favoriteMyList'
	});
	var V = B.View.extend({
		model: model,
		template: H,
		events: {
			"click .js-back": "goback",
			"click .js-qdlist-radio": "doRadio",
			"click .js-sure": "doSure"
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
			var html = _.template(t.template, data);
			t.$el.show().html(html);
		},
		goback: function() {
			var t = this;
			if (window.history && window.history.length > 2) {
				window.history.back();
			} else {
				window.location.href = "#shangpin/index/pid:" + t.model.get("pars")["pid"];
			}
		},
		doRadio: function(e) {
			var t = this;
			var $elem = $(e.currentTarget);
			var checked = Number($elem.attr("data-checked"));
			checked = checked ? 0 : 1;
			if (checked == 1) {
				t.$el.find(".qd-icon").removeClass("qd-icon-on");
				t.$el.find(".js-qdlist-radio").attr("data-checked", "0");
				$elem.find(".qd-icon").addClass("qd-icon-on");
				$elem.attr("data-checked", checked);
			}
		},
		doSure: function() {
			var t = this;
			// 	fid 收藏夹编号
			// 	pid要收藏的商品编号
			// user_id该收藏夹的用户编号
			var $elem = t.$el.find(".qd-icon-on");
			var _data = {
				"fid": $elem.attr("data-fid"),
				"pid": t.model.get("pars")["pid"],
				"user_id": Jser.getItem("user_id")
			}
			Jser.getJSON(ST.PATH.ACTION + "favorite/favoriteAddProduct", _data, function(data) {
				$elem.parent().parent().find(".js-pnum").text(Number($elem.attr("data-pnum")) + 1);
				Jser.alert("保存成功", function() {
					t.goback();
				});
			}, function() {}, "post");
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
				"user_id": Jser.getItem("user_id"),
				"pid": pars.pid
			}
		});
		return new V({
			el: $("#" + pars.model + "_" + pars.action)
		});
	}
})