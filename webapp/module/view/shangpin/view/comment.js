define('', '', function(require) {
	var B = require('backbone');
	var M = require('base/model');

	var H = require('text!../../../../tpl/shangpin/view/comment.html');
	var model = new M({
		action: 'comment/commentListByPid'
	});
	var V = B.View.extend({
		model: model,
		template: H,
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
			data.data.totalSize = data.page.totalSize;
			data.data.pid = t.model.get("pars")["pid"];
			var html = _.template(t.template, data);
			t.$el.html(html);

			Jser.loadimages(t.$el);
		}
	});
	return function(pars) {
		model.set({
			pars: {
				"pid": pars.pid
			}
		});
		return new V({
			el: pars.el
		});
	}
})