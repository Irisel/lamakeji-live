define('', '', function(require) {
	var B = require('backbone');
	var M = require('base/model');
	var Swipe = require('plusin/swipe')
	var H = require('text!../../../../tpl/index/view/slider.html');
	var model = new M();
	var V = B.View.extend({
		model: model,
		template: H,
		initialize: function() {
			var t = this;
			if (t.model._loaded) {
				t.render();
			} else {
				t.listenTo(t.model, "sync", function() {
					t.render();
				});
			}
		},
		//待优化
		render: function() {
			var t = this,
				data = t.model.toJSON();
			var html = _.template(t.template, data);
			t.$el.show().html(html);
			t.doSlider();
			Jser.loadimages(t.$el);			
		},
		doSlider: function() {
			var t=this;
			var mySwipe = Swipe(t.$el.find(".slider-box")[0], {
				stopPropagation: true,
				continuous: true,
				auto: 2000,
				speed: 800,
				callback: function(idx) {
					$("#js-index-sliderIdx li").removeClass().eq(idx % mySwipe.getNumSlides()).addClass("on");
				}
			});
		}
	});
	return function(pars) {
		model.set({
			action: 'resource/data/index.carouselList.json'
		});		
		return new V({
			el: pars.el
		});
	}
})