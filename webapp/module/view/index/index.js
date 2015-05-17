define('', '', function(require) {
	var B = require('backbone');
	var M = require('base/model');

	var H = require('text!../../../tpl/index/index.html');
	var Slider = require("view/index/view/slider");
	var list_tpl = require('text!../../../tpl/index/view/list.html');

	var model = new M({
		pars: {
			"pageNo": "1"
		}
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
			"click .js-mark": "doMark"
		},
		initialize: function() {
			var t = this;
			indexSelf = this;
			t.listenToOnce(t.model, "change:data", function() {
				t.render();
				t.listenTo(t.model, "sync", function() {
					t.syncRender();
				});
			});
		},
		//待优化
		render: function() {
			var t = this,
				data = t.model.toJSON();
			var html = _.template(t.template, data);
			t.totalSize = Number(data.page.totalSize);
			t.totalPage = Math.ceil(t.totalSize / data.page.pageSize);
			t.$el.show().html(html);
			// 轮播图
			new Slider({
				el: t.$el.find(".js-slider-box")
			});
			t.bindEvent();
		},
		syncRender: function() {
			var t = this,
				data = t.model.toJSON();
			t.isLoad = false;
			var _html = _.template(list_tpl, data);
			var $list = t.$el.find(".js-index-list");
			$list.append(_html);
			Jser.loadimages($list);

		},
		bindEvent: function() {
			var t = this;
			t.finishScroll();
			$(window).on("scroll.index", t.doScroll);
		},
		doMark: function(e) {
			if (!App.isLogin()) {
				return false;
			}
			var $elem = $(e.currentTarget);
			var on = Number($elem.attr("data-on"));

			if (on) {
				Jser.alert("已收藏过");
			} else {
				/*
				fname:收藏夹名称
				fdescribe:收藏夹描述
				user_id：所有者用户主键
				owner:0：未公开    1：公开
				father_id:
				 */
				var _data = {
					"fname": $elem.attr("data-fname"),
					"user_id": Jser.getItem("user_id"),
					"fdescribe": $elem.attr("data-fdescribe"),
					"owner": 1,
					"father_id": $elem.attr("data-fid"),
					"fromflag": "share"
				};
				var url = "favorite/favoriteAdd";
				Jser.getJSON(ST.PATH.ACTION + url, _data, function(data) {
					Jser.alert("已成功添加到我的关注");
				}, function() {

				}, "post");

				$elem.attr("data-on", "1");

			}
			return false;
		},
		doScroll: function() {
			var t = indexSelf,
				hash = window.location.hash;
			if (!t.iTimer && !t.isLoad && (hash == "" || hash.indexOf("#index/index") != -1)) {
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
			$(window).off('scroll.index', t.doScroll);
			t.clearTime();
		},
		changePars: function(pars) {
			var t = this;
			var data = $.extend({}, t.model.get("pars"));
			$.extend(data, pars);
			t.model.set("pars", data);
		}
	});
	return function(pars) {
		model.set({
			action: 'favorite/publicFavoriteList'
		});
		return new V({
			el: $("#" + pars.model + "_" + pars.action)
		});
	}
})