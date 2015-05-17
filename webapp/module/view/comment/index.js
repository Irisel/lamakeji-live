define('', '', function(require) {
	var B = require('backbone');
	var M = require('base/model');
	var H = require('text!../../../tpl/comment/index.html');
	var list_tpl = require('text!../../../tpl/comment/view/list.html');
	var model = new M({
		action: 'comment/commentListByPid'
	});
	var indexSelf;
	var V = B.View.extend({
		model: model,
		template: H,

		iTimer: null,
		isLoad: false, // 当加载数据的时候 禁止使用滑动加载 ,默认是false 即没有加载数据
		totalSize: 10, // 每次显示的个数
		page: 1, // 分页
		totalPage: 1, // 总页数

		events: {
			"click .js-back": "goback",
			"click .js-comment-sent": "doSent"
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
			t.$el.show().html(html);
			t.bindEvent();
		},
		goback: function() {
			var t = this;
			if (window.history && window.history.length > 2) {
				window.history.back();
			} else {
				window.location.href = "#shangpin/index/pid:" + t.model.get("pars")["pid"];
			}
		},
		syncRender: function() {
			var t = this,
				data = t.model.toJSON();
			t.totalPage = Math.ceil(data.page.totalSize / t.totalSize);
			t.$el.find(".js-comment-totalSize").text(data.page.totalSize);
			t.isLoad = false;
			var _html = _.template(list_tpl, data);
			t.$el.find(".js-comment-list").append(_html);
			t.$el.find(".js-list-loading").hide();
			Jser.loadimages();
			t.$el.show();
		},
		bindEvent: function() {
			var t = this;
			t.finishScroll();
			$(window).on("scroll.comment", t.doScroll);
		},
		doSent: function() {
			var t = this;
			if (t.checkSent()) {
				/*
				添加商品评价:comment/commentAdd
				参数：
				pid:商品主键
				content：评价内容
				user_id:评论用户，即登陆用户
				uname:评论用户名
				comment_user_id:被评论用户(直接评论则是0)
				comment_uname:被评论用户名(直接评论则是0)
				comment_id:被评论的评论id(直接评论则是0)
				方法：post
				 */
				var url = ST.PATH.ACTION + "comment/commentAdd";
				var _data = {};
				_data.content = $.trim(t.$el.find(".js-comment-content").val());
				_data.pid = t.model.get("pars")["pid"];
				_data.user_id = Jser.getItem("user_id");
				_data.uname = Jser.getItem("uname");
				_data.comment_user_id = 0;
				_data.comment_uname = 0;
				_data.comment_id = 0;
				Jser.getJSON(url, _data, function(data) {
					if (Number(data.code) == 0) {
						location.reload();
					}
				}, function(data) {
					debugger
					if (data && data.msg)
						Jser.alert(data.msg);
				}, "post");

			} else {
				Jser.alert("评论不可为空");
			}
		},
		checkSent: function() {
			var t = this;
			var t1 = t.$el.find(".js-comment-content");
			var v1 = $.trim(t1.val());
			if (v1.length == 0) {
				return false;
			}
			return true;
		},
		doScroll: function() {
			var t = indexSelf,
				hash = window.location.hash;
			if (!t.iTimer && !t.isLoad && hash.indexOf("#comment/index") != -1) {
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
				t.changePars2(pars);
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
			$(window).off('scroll.comment', t.doScroll);
			t.clearTime();
		},
		changePars2: function(pars) {
			var t = this;
			var data = $.extend({}, t.model.get("pars"));
			$.extend(data, pars);
			t.model.set("pars", data);
		},
		changePars: function(pars) {
			var t = this;
			t.changePars2(pars);
			t.$el.find(".js-comment-list").html('');
		}
	});
	return function(pars) {
		model.set({
			pars: {
				"pid": pars.pid
			}
		});
		return new V({
			el: $("#" + pars.model + "_" + pars.action)
		});
	}
})