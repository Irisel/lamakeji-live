define('', '', function(require) {
	var B = require('backbone');
	var M = require('base/model');
	var H = require('text!../../../tpl/list2/index.html');
	var list_tpl = require('text!../../../tpl/list2/view/list.html');
	var model = new M({
		action: 'product/productListByPtid'
	});
	var V = B.View.extend({
		model: model,
		template: H,
		events: {
			"click .js-back": "goback",
			"click .js-share": "doShare",
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
			data.data.ptid = t.model.get("pars")["ptid"];
			var html = _.template(t.template, data);
			t.$el.show().html(html);
			var _html = _.template(list_tpl, data);
			t.$el.find(".js-list-area").append(_html);
			Jser.loadimages(t.$el.find(".js-list-area"));
			t.setShare();
			$(window.parent.document).find("#js-iframe").load(function() {
				var subWeb = document.frames ? document.frames["js-iframe"].document : this.contentDocument;
				$(this).height(subWeb.body.scrollHeight);
			});
		},
		goback: function() {
			var t = this;
			if (window.history && window.history.length > 2) {
				window.history.back();
			} else {
				window.location.href = "#";
			}
		},
		setShare: function() {
			var t = this;
			var fid = t.model.get("pars")["fid"];
			var url = ST.PATH.SHARE + "?fid=" + fid;
			Jser.setshare({
				imgUrl: "",
				lineLink: url,
				shareTitle: "妈咪口袋" + Jser.getItem("fid" + fid),
				descContent: ""
			});
		},
		doShare: function() {
			Jser.share();
		},
		changePars: function(pars) {
			var t = this;
			t.model.set("pars", pars);
		}
	});

	return function(pars) {
		model.set({
			pars: {
				"ptid": pars.ptid
			}
		});
		return new V({
			el: $("#" + pars.model + "_" + pars.action)
		});
	}
})