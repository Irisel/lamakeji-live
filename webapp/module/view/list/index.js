define('', '', function(require) {
	var B = require('backbone');
	var M = require('base/model');
	var H = require('text!../../../tpl/list/index.html');
	var list_tpl = require('text!../../../tpl/list/view/list.html');
	var model = new M({
		action: 'product/productListByFid'
	});
	var V = B.View.extend({
		model: model,
		template: H,
		events: {
			"click .js-back": "goback",
			"click .js-share": "doShare",
            "click .js-mark": "doMark"
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
			data.data.fdata = data.fdata;
			data.data.fid = t.model.get("pars")["fid"];
            data.data.on = t.model.get("pars")["on"];
			data.data.guanzhu = t.model.get("pars")["guanzhu"];
			var html = _.template(t.template, data);
			t.$el.show().html(html);
			var _html = _.template(list_tpl, data);
			t.$el.find(".js-list-area").append(_html);
			Jser.loadimages(t.$el.find(".js-list-area"));
			t.setShare();
            Jser.getJSON("http://lama.piapiapiapia.com/mamago/index.php/favorite/getDetail?favoriteId="+ data.data.fid,"", function(data) {
                t.$el.find('.strategy-share').html(data.data.detail.fcontent);
            })
		},
		goback: function() {
			var t = this;
			if (window.history && window.history.length > 2) {
				window.history.back();
			} else {
				window.location.href = "#";
			}
		},
		doMark: function(e) {
			if (!App.isLogin()) {
				return false;
			}
            event.stopPropagation();
			var $elem = $(e.currentTarget);
			var on = Number($elem.attr("data-on"));

			if (on) {
//                if($elem.data('userid') == '1'){
//                    Jser.alert("默认的心愿单不能取消关注");
//                    event.preventDefault();
//                    return;
//                }
                var _data = {fid: $elem.attr("data-fid"), type: 2, user_id: Jser.getItem("user_id")};
				Jser.confirm("确定要取消关注么？", function() {
				    Jser.getJSON(ST.PATH.ACTION + "favorite/favoriteDelete", _data, function(data) {
					    $elem.removeClass('icon-heart-on');
                        $elem.attr("data-on", 0);
				});
			});
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
                    $elem.addClass('icon-heart-on');
                    $elem.data('fid', data.fid);
					Jser.alert("已成功添加到我的关注");
				}, function() {

				}, "post");

				$elem.attr("data-on", "1");

			}
			return false;
		},
		setShare: function() {
            loadwxconfig();
			var t = this;
			var fid = t.model.get("pars")["fid"];
			var shareTitle = Jser.getItem("fdescribe" + fid) || "辣妈科技";
			var descContent = Jser.getItem("fid" + fid);
			var url = 'http://www.lamakeji.com/webapp/#list/share/fid:'+ fid +'?share=true';
			Jser.setshare({
				lineLink: url,
				shareTitle: shareTitle,
				descContent: descContent
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
		if (pars.guanzhu) {
			model.set({
				pars: {
					"fid": pars.fid,
					"guanzhu": pars.guanzhu,
                    "on": pars.on
				}
			});
		} else if (pars.fid) {
			model.set({
				pars: {
					"fid": pars.fid,
                    "on": pars.on
				}
			});
		}
		return new V({
			el: $("#" + pars.model + "_" + pars.action)
		});
	}
});