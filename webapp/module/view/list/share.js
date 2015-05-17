define('', '', function(require) {
	var B = require('backbone');
	var M = require('base/model');
	var H = require('text!../../../tpl/list/share.html');
	var model = new M({
		action: 'favorite/getDetail'
	});
	var V = B.View.extend({
		model: model,
		template: H,
		events: {
			"click .js-back": "goback"
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
            console.log(data.data.detail);
			t.$el.show().html(html);
            t.$el.find('.strategy-share').html(data.data.detail.fcontent);
		},
		goback: function() {
			var t = this;
			if (window.history && window.history.length > 2) {
				window.history.back();
			} else {
				window.location.href = "#";
			}
		},
		changePars: function(pars) {
			var t = this;
			t.model.set("pars", pars);
		}
	});

	return function(pars) {
		model.set({
			pars: {
				"favoriteId": pars.fid
			}
		});
		return new V({
			el: $("#" + pars.model + "_" + pars.action)
		});
	}
});