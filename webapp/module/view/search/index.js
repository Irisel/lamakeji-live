define('', '', function(require) {
	var B = require('backbone');
	var M = require('base/model');
	var H = require('text!../../../tpl/search/index.html');

	var list_tpl = require('text!../../../tpl/search/view/list.html');

	var model = new M({
		type: "post",
		isload: "false",
		action: 'product/productListForPname'
	});
	var indexSelf;
	var V = B.View.extend({
		model: model,
		template: H,
		iTimer: null,
		isLoad: false, // 当加载数据的时候 禁止使用滑动加载 ,默认是false 即没有加载数据
		totalSize: 6, // 每次显示的个数
		page: 1, // 分页
		totalPage: 1, // 总页数
		events: {
			"click .js-back": "goback",
			"click .js-search": "doSearch",
		},
		initialize: function() {
			var t = this;
			indexSelf = this;
			t.render();
			t.listenTo(t.model, "sync", function() {
				t.syncRender();
			});
		},
		//待优化
		render: function() {
			var t = this,
				data = t.model.toJSON();
			var html = _.template(t.template, data);
			t.$el.show().html(html);
			t.bindEvent();
		},
		goback: function() {
			var t = this;
			if (window.history && window.history.length > 2) {
				window.history.back();
			} else {
				window.location.href = "#";
			}
		},
		syncRender: function() {
			var t = this,
				data = t.model.toJSON();
			t.isLoad = false;
			var _html = _.template(list_tpl, data);
			t.$el.find(".js-list-area").append(_html);
			t.pageSize = Number(data.page.pageSize);
			t.totalPage = Math.ceil(data.page.totalSize / t.pageSize);
			Jser.loadimages(t.$el.find(".js-list-area"));
		},
		bindEvent: function() {
			var t = this;
			t.finishScroll();
			$(window).on("scroll.search", t.doScroll);
		},
		doScroll: function() {
			var t = indexSelf,
				hash = window.location.hash;
			if (!t.iTimer && !t.isLoad && hash.indexOf("#search/index") != -1) {
				t.iTimer = setTimeout(function() {
					var size = Jser.documentSize();
					if (size.fullHeight - size.scrollTop - size.viewHeight < 20) {
						t.loadData();
					}
					t.clearTime();
				}, 200);
			}
		},
		loadData: function() {
			var t = this;
			t.page++;
			if (t.page <= t.totalPage) {
				var pars = {
					"pageNo": t.page
				}
				t.isLoad = true;
				t.$el.find(".js-list-loading").show();
				t.changePars(pars);
			} else {
				t.finishScroll();
			}
		},
		clearTime: function() {
			var t = this;
			if (t.iTimer) {
				clearTimeout(t.iTimer);
			}
			t.iTimer = null;
		},
		finishScroll: function() {
			var t = this;
			t.$el.find(".js-list-loading").hide();
			$(window).off('scroll.search', t.doScroll);
			t.clearTime();
		},
		doSearch: function() {
			var t = this;
			var val = $.trim(t.$el.find(".js-search-val").val());
			if (val) {
				t.changePars({
					"search_pname": val,
					"pageNo": 1
				});
				t.$el.find(".js-list-area").html('');
			}
		},
		changePars: function(pars) {
			var t = this;
			var data = $.extend({}, t.model.get("pars"));
			$.extend(data, pars);
			t.model.set("pars", data);
		}
	});
	return function(pars) {

		return new V({
			el: $("#" + pars.model + "_" + pars.action)
		});
	}
})