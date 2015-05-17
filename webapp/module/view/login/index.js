define('', '', function(require) {
	var B = require('backbone');
	var M = require('base/model');
	var H = require('text!../../../tpl/login/index.html');
	var model = new M({
		pars: {
			"user_id": Jser.getItem("user_id")
		}
	});
	var V = B.View.extend({
		template: H,
		events: {
			"click .js-back": "goback",
			"click .js-login-btn": "doLogin"
		},
		initialize: function() {
			var t = this;
			t.render();
		},
		//待优化
		render: function() {
			var t = this,
				data = {};
			var html = _.template(t.template, data);
			t.$el.show().html(html);
		},
		doLogin: function() {
			var t = this;
			if (t.checkLogin()) {
				var _data = t.$el.find("#js-login-form").serializeArray();
				var name, val;
				var _locData={};
				$.each(_data, function(i, item) {
					name = item.name;
					val = $.trim(item.value);
					_data[i].value = val;
					_locData[name]=val;
				});
				Jser.getJSON(ST.PATH.ACTION + "user/login", _data, function(data) {
					Jser.setItem("uname", data.data.uname);
					Jser.setItem("password",_locData["password"]);
					Jser.setItem("user_id", data.data.user_id);
					window.location.href = '#wode/index/log:in';
				}, function() {

				}, "post");

			}
		},
		checkLogin: function() {
			var t = this;
			var t1 = t.$el.find(".js-uname");
			var t2 = t.$el.find(".js-password");
			var v1 = $.trim(t1.val());
			var v2 = $.trim(t2.val());
			if (v1.length == 0) {
				Jser.error(t.$el.find(".js-error"), "请输入用户名");
				return false;
			} else if (v2.length == 0) {
				Jser.error(t.$el.find(".js-error"), "请输入密码");
				return false;
			}
			return true;
		},
		goback: function() {
			var t = this;
			if (window.history && window.history.length > 2) {
				window.history.back();
			} else {
				window.location.href = "#sign/index";
			}
		}
	});
	return function(pars) {
		model.set({
			pars: {
				"user_id": Jser.getItem('user_id')
			}
		});
		return new V({
			el: $("#" + pars.model + "_" + pars.action)
		});
	}
});