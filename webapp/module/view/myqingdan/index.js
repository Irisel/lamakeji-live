define('', '', function(require) {
	var B = require('backbone');
	var M = require('base/model');
	var H = require('text!../../../tpl/myqingdan/index.html');

	var model = new M({
		// action: 'http://myyglah.duapp.com/front/queryBeauticianWorks.action'
	});
	var V = B.View.extend({
		model: model,
		template: H,
		events: {
			"click .js-back": "goback"
		},
		initialize: function() {
			var t = this;
			t.render();
			// t.listenTo(t.model, "sync", function() {
			// 	t.render();
			// });
		},
		//待优化
		render: function() {
			var t = this,
				data = t.model.toJSON();
				// data.data.beauticianID=t.model.get("pars").beauticianID;
			var html = _.template(t.template, data);
			t.$el.show().html(html);
			// Jser.loadimages();
		},
		goback: function() {
			var t = this;
			var pars = t.model.get("pars");
			if (window.history && window.history.length > 2) {
				window.history.back();
			} else {
				window.location.href = "#zuopin/index/beauticianID:" + pars.beauticianID;
			}
		},
		changePars: function(pars) {
			var t = this;
			var data = $.extend({}, t.model.get("pars"));
			$.extend(data, pars);
			t.model.set("pars", data);
		},
		changeId: function(pars) {
			var t = this;
			var pars = {
				"beauticianID": pars.beauticianID,
				"worksID": pars.worksID,
			}
			t.changePars(pars);
		}
	});
	return function(pars) {
		// model.set({
		// 	pars: {
		// 		beauticianID: pars.beauticianID,
		// 		worksID: pars.worksID
		// 	}
		// });
		return new V({
			el: $("#" + pars.model + "_" + pars.action)
		});
	}
})