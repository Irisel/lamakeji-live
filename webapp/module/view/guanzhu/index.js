define('', '', function(require) {
	var B = require('backbone');
	var M = require('base/model');

	var H = require('text!../../../tpl/guanzhu/index.html');

	var list_tpl = require('text!../../../tpl/guanzhu/view/list.html');

	var model = new M({
		pars: {
			"user_id": Jser.getItem("user_id")
		}
	});
	var V = B.View.extend({
		model: model,
		template: H,
		events: {

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
			Jser.loadimages(t.$el);
			t.bindEvent();
		},
		bindEvent: function() {
			var t = this;
			t.$el.find(".js-guanzhu-dropdown").change(function() {
				var txt = $(this).find("option:selected").text();
				if (txt == "合集") {
					window.location.hash = "#guanzhu/index";
				} else if (txt == "单品") {
					window.location.hash = "#guanzhu/danpin";
				}
			});
		},
		changePars: function(pars) {
			var t = this;
			t.model.fetchData();
		}
	});
	return function(pars) {
		model.set({
			action: 'favorite/favoriteMyList'
		});
		return new V({
			el: $("#" + pars.model + "_" + pars.action)
		});
	}
})