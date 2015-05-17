define('', '', function(require) {
	var B = require('backbone');
	var M = require('base/model');
	var H = require('text!../../../tpl/add/index.html');

	var model = new M({
		// action: 'http://myyglah.duapp.com/front/queryBeauticianWorks.action'
	});
	var V = B.View.extend({
		model: model,
		template: H,
		events: {
			"click .js-add-sure": "doAddSure"
		},
		initialize: function() {
			var t = this;
			t.render();
		},
		//待优化
		render: function() {
			var t = this;
			t.$el.show().html(t.template);
			if (!App.isLogin()) {
				return false;
			}
		},
		doAddSure: function() {
			if (!App.isLogin()) {
				return false;
			}
			var t = this;
			var val = $.trim(t.$el.find(".js-add-val").val());
			if (val.length != 0) {
				t.$el.find(".js-add-error").hide();
				/*
				fname:收藏夹名称
				fdescribe:收藏夹描述
				user_id：所有者用户主键
				owner:0：未公开    1：公开
				father_id:
				 */
				var _data = {
					"fname": val,
					"user_id": Jser.getItem("user_id"),
					"owner": 0,
					"fdescribe": 0,
					"fromflag": "myself"
				};
				Jser.getJSON(ST.PATH.ACTION + "favorite/favoriteAdd", _data, function(data) {
					Jser.alert("新建go单成功", function() {
						window.location.hash = "#go/index";
					});
				}, function() {

				}, "post");
			} else {
				t.$el.find(".js-add-error").show().find("span").text("请填写go单名称");
			}
		},
		changePars: function() {
			var t = this;
			t.$el.find(".js-add-val").val("");
			t.$el.show();
		}
	});
	return function(pars) {
		return new V({
			el: $("#" + pars.model + "_" + pars.action)
		});
	}
})