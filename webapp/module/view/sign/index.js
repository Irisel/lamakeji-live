define('', '', function(require) {
	var B = require('backbone');
	var M = require('base/model');
	var H = require('text!../../../tpl/sign/index.html');

	var V = B.View.extend({
		template: H,
		events: {
			"click .js-back": "goback",
			"click .js-sign-btn": "doSign",
			"click .js-set-vcode": "doVcode"

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
		doSign: function() {
			var t = this;
			if (t.checkSign()) {
				var _data = t.$el.find("#js-sign-form").serializeArray();
				var name, val;
				var _locData = {};
				$.each(_data, function(i, item) {
					name = item.name;
					val = $.trim(item.value);
					_data[i].value = val;
					_locData[name] = val;
				})
				Jser.getJSON(ST.PATH.ACTION + "user/register", _data, function(data) {
					Jser.setItem("uname", data.data.uname);
					Jser.setItem("password", _locData["password"]);
					Jser.setItem("user_id", data.data.user_id);

				}, function() {

				}, "post");
			}
		},
		// 发送验证码到手机
		doVcode: function() {
			var t = this;
			var v1 = $.trim(t.$el.find(".js-uname").val());
			t.$el.find(".js-error").hide();
			var reg = /^(\d{1,4}\-)?(13|15|17|18){1}\d{9}$/;
			if (reg.test(v1)) {
				var _data = {
					"uname": v1
				}
				Jser.getJSON(ST.PATH.ACTION + "user/sendEmail", _data, function(data) {
					Jser.alert(data.msg);
				}, function() {

				}, "post");
			} else {
				Jser.error(t.$el.find(".js-error"), "请输入正确的电话号码");
			}
		},
		checkSign: function() {
			var t = this;
			var t1 = t.$el.find(".js-uname");
			var t2 = t.$el.find(".js-password");
			var t3 = t.$el.find(".js-verification");
			var v1 = $.trim(t1.val());
			var v2 = $.trim(t2.val());
			var t3 = $.trim(t3.val());
			t.$el.find(".js-error").hide();
			var reg = /^(\d{1,4}\-)?(13|15|17|18){1}\d{9}$/;
			if (!reg.test(v1)) {
				Jser.error(t.$el.find(".js-error"), "请输入正确的电话号码");
				return false;
			}
			if (v1.length == 0) {
				Jser.error(t.$el.find(".js-error"), $(t1).attr("placeholder"));
				return false;
			} else if (v2.length == 0) {
				Jser.error(t.$el.find(".js-error"), $(t2).attr("placeholder"));
				return false;
			} else if (t3.length == 0) {
				Jser.error(t.$el.find(".js-error"), "请输入手机验证码");
				return false;
			}
			return true;
		}
	});
	return function(pars) {
		return new V({
			el: $("#" + pars.model + "_" + pars.action)
		});
	}
})