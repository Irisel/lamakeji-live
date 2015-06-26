define('', '', function(require) {
	var B = require('backbone');
	var M = require('base/model');
	var H = require('text!../../../tpl/forget/index.html');

	var model = new M();
	var V = B.View.extend({
		model: model,
		template: H,
		events: {
			"click .js-forget-step": "doStep",
			"click .js-forget-sure": "doSure"
		},
		initialize: function() {
			var t = this;
			t.render();
		},
		//待优化
		render: function() {
			var t = this;
			var html = _.template(t.template, {});
			t.$el.show().html(html);
		},
		doStep: function() {
            var t = this;
			if (t.checkStep()) {
				t.$el.find(".js-error").hide();
				var url = ST.PATH.ACTION + "user/sendEmail";
				var tel = $.trim(t.$el.find(".js-forget-tel").val());
				var _data = {
					"uname": tel
				};
				Jser.getJSON(url, _data, function() {
					Jser.confirm("验证码发送成功", function() {

                    }, function() {

                    });
				}, function() {

				}, "post");
			}
		},
		doSure: function() {
			var t = this;
			if (t.checkSure()) {
				var _data = t.$el.find("#js-forget-form").serializeArray();
				var name, val;
				var _locData = {};
				$.each(_data, function(i, item) {
					name = item.name;
					val = $.trim(item.value);
					_data[i].value = val;
					_locData[name] = val;
				});

				Jser.getJSON(ST.PATH.ACTION + "user/findPassword", _data, function(data) {
                    Jser.setItem("uname", _data.uname);
                    Jser.setItem("user_id", '');
                    Jser.confirm(data.msg, function() {
                        window.location.href = '#login/index';
                    }, function() {

                    });
				}, function() {

				}, "post");
			}
		},
		checkSure: function() {
			var t = this;
			var t1 = t.$el.find(".js-vcode");
			var t2 = t.$el.find(".js-password1");
            var t3 = t.$el.find(".js-forget-tel");
            var reg = /^(\d{1,4}\-)?(13|15|17|18){1}\d{9}$/;
			var v1 = $.trim(t1.val());
			var v2 = $.trim(t2.val());
            var v3 = $.trim(t3.val());
			t.$el.find(".js-error").hide();
            if(!reg.test(v3)){
                Jser.error(t.$el.find(".js-error"), $(t3).attr("placeholder"));
				return false;
            }
			else if (v1.length == 0) {
				Jser.error(t.$el.find(".js-error"), $(t1).attr("placeholder"));
				return false;
			} else if (v2.length < 6) {
				Jser.error(t.$el.find(".js-error"), $(t2).attr("placeholder"));
				return false;
			}
			return true;
		},
		checkStep: function() {
			var t = this;
			t.$el.find(".js-error").hide();
			var v1 = $.trim(t.$el.find(".js-forget-tel").val());
			var reg = /^(\d{1,4}\-)?(13|15|17|18){1}\d{9}$/;
			if (!reg.test(v1)) {
				Jser.error(t.$el.find(".js-error"), "请输入正确的电话号码");
				return false;
			}
			return true;
		},
		changePars: function() {
			var t = this;
			t.render();
		}
	});
	return function(pars) {
		return new V({
			el: $("#" + pars.model + "_" + pars.action)
		});
	}
})