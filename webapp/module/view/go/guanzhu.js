define('', '', function(require) {
	var B = require('backbone');
	var M = require('base/model');

	var H = require('text!../../../tpl/go/guanzhu.html');
    var Danpin = require("view/go/view/danpin");
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
            if(data.data && data.data.length>1)data.data = data.data.slice(0,1);
			var html = _.template(t.template, data);
			t.$el.show().html(html);
            new Danpin({
				el: t.$el.find(".js-list-area")
			});
			Jser.loadimages(t.$el);
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