define('', '', function(require) {
	var B = require('backbone');
	var M = require('base/model');
	var H = require('text!../../../tpl/xinxi/index.html');

	var V = B.View.extend({
		template: H,
		events: {
			"click .js-back": "goback",
			"click .js-sure": "doSure"

		},
		xinxistatusindex: 0,
		xinxigenderindex: "",
		initialize: function() {
			var t = this;
			t.render();
			t.bindEvent();
		},
		//待优化
		render: function() {
			var t = this,
				data = {};
			var html = _.template(t.template, data);
			t.$el.show().html(html);
			if (!!Jser.os.ios) {
				t.$el.find(".js-iphone-date").show();
			}
		},
		bindEvent: function() {
			var t = this;
			var $li = t.$el.find(".js-xinxi-status li");
			$li.on("mousedown", function() {
				var index = $(this).index();
				$li.each(function(i) {
					if (index != i) {
						$(this).removeClass("on");
					}
				});
				$(this).addClass("on");
				t.xinxistatusindex = index;
			});
			var $ligender = t.$el.find(".js-xinxi-gender li");
			$ligender.on("mousedown", function() {
				var index = $(this).index();
				$ligender.each(function(i) {
					if (index != i) {
						$(this).removeClass("on");
					}
				});
				$(this).addClass("on");
				t.xinxigenderindex = index;
			});
			t.$el.find(".js-iphone-date").on("blur", function() {
				t.$el.find(".js-xinxi-date").val(this.value);
			});
		},
		doSure: function() {
			var t = this;
			Jser.setItem("xinxistatus", t.xinxistatusindex);
			Jser.setItem("xinxigender", t.xinxigenderindex);
			Jser.setItem("xinxidate", t.$el.find(".js-xinxi-date").val());
			doQingDanNav();
			t.goback();
		},
		goback: function() {
			var t = this;
			if (window.history && window.history.length > 2) {
				window.history.back();
			} else {
				window.location.href = "#";
			}
		}
	});
	return function(pars) {
		return new V({
			el: $("#" + pars.model + "_" + pars.action)
		});
	}
})