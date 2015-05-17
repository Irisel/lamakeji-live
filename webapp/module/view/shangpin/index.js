define('', '', function(require) {
	var B = require('backbone');
	var M = require('base/model');
	var Swipe = require('plusin/swipe');
	var H = require('text!../../../tpl/shangpin/index.html');
	var list_tpl = require('text!../../../tpl/shangpin/view/list.html');

	var Comment = require("view/shangpin/view/comment");

	var model = new M({
		action: 'product/productByPid'
	});
	var V = B.View.extend({
		model: model,
		template: H,
		events: {
			"click .js-back": "goback",
			"click .js-share": "doShare",
			"click .js-praise": "doPraise"
		},
		initialize: function() {
			var t = this;
			indexSelf = this;
			t.listenTo(t.model, "change:data", function() {
				t.render();
			});
		},
		//待优化
		render: function() {
			var t = this,
				data = t.model.toJSON();
			data.data = data.data[0];
			// pdescribe: "[{"MOWIsDPlsoHkuYvpl7Q=":"\u63a8\u8f66\u662f\u5a74\u513f\u91cd\u8981\u7684\u51fa\u884c\u5de5\u5177\uff0c\u9700\u8981\u8003\u8651\u7684\u7ec6\u8282\u6709\u5f88\u591a\uff0c\u6bd4\u5982\u643a\u5e26\u662f\u5426\u65b9\u4fbf\uff0c\u6298\u53e0\u662f\u5426\u5bb9\u6613\uff1f\u7238\u7238\u5988\u5988\u4e5f\u8d8a\u6765\u8d8a\u6ce8\u610f\u548c\u5b9d\u5b9d\u7684\u4ea4\u6d41\uff0c\u9ad8\u5ea7\u4f4d\u7684\u8bbe\u8ba1\u53ef\u4ee5\u6ee1\u8db3\u7238\u7238\u5988\u5988\u7684\u8fd9\u4e2a\u9700\u6c42\uff0c\u6839\u636e\u81ea\u5df1\u7684\u5fc3\u610f\u968f\u610f\u8c03\u8282\u7684\u63a8\u8f66\u80fd\u6700\u5927\u9650\u5ea6\u4e3a\u5988\u5988\u63d0\u4f9b\u968f\u6027\u4efb\u6027\u7684\u751f\u6d3b\u3002"}]",
			var pdescribe = {},
				txt = "";
			try {
				pdescribe = JSON.parse(data.data.pdescribe);
			} catch (e) {

			}
			if (!$.isEmptyObject(pdescribe)) {
				for (var i in pdescribe[0]) {
					txt = unescape(pdescribe[0][i]);
					break;
				}
			}
			data.data.txt = txt;
			if (!data.data.pictureList) {
				var picture_arr = [];
				// "http://img13.360buyimg.com/n5/jfs/t148/122/1928837335/178654/e6e1cffb/53bd0a9cNe991f734.jpg,,,http://img13.360buyimg.com/n5/jfs/t184/259/1841534365/200245/adef5da/53bd0a8dNb7631c5c.jpg,,,http://img13.360buyimg.com/n5/jfs/t202/163/1857516600/272946/1042bdfa/53bd0ad8N8c8c089f.jpg,,,http://img13.360buyimg.com/n5/jfs/t130/126/4881294294/146165/c187b01c/537ad954N944b3be6.jpg,,,";
				if (data.data.picture_str) {
					$.each(data.data.picture_str.split(","), function(i, o) {
						if (o) {
							picture_arr.push(Jser.prefixImg(o, true))
						}
					})
				} else {
					picture_arr.push(data.data.picture);
				}
				data.data.pictureList = picture_arr;
			}
			var html = _.template(t.template, data);
			t.$el.show().html(html);

			// 评论
			new Comment({
				pid: t.model.get("pars")["pid"],
				el: t.$el.find(".js-shangpin-comment")
			});

			t.bindEvent();
			Jser.loadimages();
			t.setShare();
		},
		bindEvent: function() {
			var t = this;
			var $li = t.$el.find(".js-tab li");
			var $hlli = t.$el.find(".js-tab-highlight li");
			var $content = t.$el.find(".js-tab-content")
			$li.click(function() {
				if (!$(this).hasClass("on")) {
					var idx = $(this).index();
					var otherIdx = idx ? 0 : 1;
					$li.eq(otherIdx).removeClass("on");
					$hlli.eq(otherIdx).removeClass("on");
					$content.eq(otherIdx).hide();

					$(this).addClass("on");
					$content.eq(idx).show();
					$hlli.eq(idx).addClass("on");
				}
			});
			t.doSlider();
		},
		doSlider: function() {
			var t = this;
			var mySwipe = Swipe(t.$el.find(".js-slider-box")[0], {
				stopPropagation: true,
				continuous: true,
				auto: 2000,
				speed: 800,
				callback: function(idx) {
					t.$el.find(".js-sliderIdx li").removeClass().eq(idx % mySwipe.getNumSlides()).addClass("on");
				}
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
			var $elem = t.$el.find(".js-share");
			// alert($elem.attr("data-share"));
			Jser.setshare({
				imgUrl: $elem.attr("data-imgUrl"),
				lineLink: $elem.attr("data-share"),
				shareTitle: $elem.attr("data-shareTitle"),
				descContent: $elem.attr("data-descContent")
			});
		},
		doShare: function() {
			Jser.share();
		},
		doPraise: function(e) {
			if (!App.isLogin()) {
				return false;
			}
			var $elem = $(e.currentTarget);
			var isGood = $elem.attr("data-isgood");
			var t = this;
			var pid = t.model.get("pars")["pid"];
			var _data = {
				"pid": pid,
				"user_id": Jser.getItem("user_id")
			}
			var type = "post";
			var url = ST.PATH.ACTION;
			if (isGood == "yes") {
				url += "product/productDeleteGood";
				type = "get";
			} else {
				url += "product/productAddGood"
			}
			Jser.getJSON(url, _data, function(data) {
				if (Number(data.code) == 0) {
					if (isGood == "yes") {
						$elem.attr("data-isgood", "no");
						// var txt = "取消点赞";
						$elem.find("i").removeClass("icon-heart-on");
					} else {
						$elem.attr("data-isgood", "yes");
						// var txt = "点赞";
						$elem.find("i").addClass("icon-heart-on");
					}
					// Jser.alert(txt);
				}
			}, function(data) {
				if (data && data.msg)
					Jser.alert(data.msg);
			}, type);
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
			pars: {
				"pid": pars.pid,
				"user_id": Jser.getItem('user_id')
			}
		});
		return new V({
			el: $("#" + pars.model + "_" + pars.action)
		});
	}
})