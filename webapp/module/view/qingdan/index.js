define('', '', function(require) {
	var B = require('backbone');
	var M = require('base/model');
	var H = require('text!../../../tpl/qingdan/index.html');
	var list_tpl = require('text!../../../tpl/qingdan/view/list.html');
	window.global_qd_type = 0;
	var model = new M({
		action: 'product/productTypeUserList'
	});
	/* 
		-365,-280备孕~0周
		-280,-189 0~12周
		-189,-77 13~28周
		-77,0 29~40周
		0,30 出生~满月
		30,100 满月~百天
		100,182 百天~半岁
		182,365 半岁~一岁
		365,547 一岁~一岁半
		547,730 一岁半~两岁
		730,1095 两岁~三岁
	*/
	var qdmap = {
		"1": ["-365", "-280", "备孕", "0周", "1"],
		"2": ["-280", "-189", "0周", "12周", "2"],
		"3": ["-189", "-77", "13周", "18周", "3"],
		"4": ["-77", "0", "19周", "出生", "4"],
		"5": ["0", "30", "出生", "满月", "5"],
		"6": ["30", "100", "满月", "百天", "6"],
		"7": ["100", "182", "百天", "半岁", "7"],
		"8": ["182", "365", "半岁", "1岁", "8"],
		"9": ["365", "547", "1岁", "1岁半", "9"],
		"10": ["547", "730", "1岁半", "2岁", "10"],
		"11": ["730", "1095", "2岁", "3岁", "11"]
	};
	// var indexSelf;
    var _index = Jser.getItem('idx') || '1';
	var V = B.View.extend({
		model: model,
		template: H,
		idx:  _index,
		// iTimer: null,
		// isLoad: false, // 当加载数据的时候 禁止使用滑动加载 ,默认是false 即没有加载数据
		// totalSize: 6, // 每次显示的个数
		// page: 1, // 分页
		// totalPage: 1, // 总页数
		events: {
			"click .js-qd-left": "doLeft",
			"click .js-qd-right": "doRight",
			// "click .qd-top-btn": "doSwitchQingdan",
			"click .js-qd-checked": "doCheckdQingdan",
            "click .js-qingdan-period": "doSetPeriod"
			// "click .js-dropdown": "doDropdown"
		},
		initialize: function() {
			var t = this;
			// indexSelf = this;
			t.listenTo(t.model, "sync", function() {
				t.render();
				// t.listenTo(t.model, "sync", function() {
				// 	t.syncRender();
				// });
			});
		},
		//待优化
		render: function() {
			var t = this,
				data = t.model.toJSON();
			data.qdmap = qdmap[_index];
            data.period_chosen = qdmap[_index][2].replace('周', '').replace('岁', '') + '~' + qdmap[_index][3];
            var page_type = t.$el.find(".js-dropdown").find("option:selected").text();
            data.page.type = page_type?page_type: '全部';
            user_id = Jser.getItem('user_id');
            if(global_qd_type ==1 || global_qd_type ==2){
                var totalpage_size = 0;
                $.each(data.data, function(key, value){
                    if(value.user_id == user_id && global_qd_type ==1)totalpage_size+=1;
                    if(value.user_id != user_id && global_qd_type ==2)totalpage_size+=1;
                });
                data.page.pageSize = totalpage_size;
            }

			var html = _.template(t.template, data);
			// t.totalPage = Number(data.totalPage);
			t.$el.show().html(html);
			Jser.loadimages(t.$el);
			// t.bindEvent();
			t.$el.find(".js-dropdown").change(function() {
				var $elem = $(this).find("option:selected");
				t.doDropdown($elem.attr("data-type"));
//				$elem.parent().html($elem.parent().html());
				return false;
			});

			t.$el.find(".js-dropdown3").change(function() {
				if (!App.isLogin()) {
					return false;
				}
				var $elem = $(this).find("option:selected");
				var type = $elem.attr("data-type");
				t.doDropdown3(type);
				$elem.parent().html($elem.parent().html());
				// t.$el.find(".js-dropdown3 option").eq(-1).attr("selected", true);
				return false;
			});
		},
//		doLeft: function() {
//			var t = this;
//			var idx = Number(t.idx);
//			idx--;
//			if (idx < 1) {
//				idx = "11";
//			}
//			t.changePars({
//				"ptmin": qdmap[idx][0],
//				"ptmax": qdmap[idx][1],
//				"idx": idx
//			});
//			global_qd_type = 0;
//		},
//		doRight: function() {
//			var t = this;
//			var idx = Number(t.idx);
//			idx++;
//			if (idx > 11) {
//				idx = "1";
//			}
//			t.changePars({
//				"ptmin": qdmap[idx][0],
//				"ptmax": qdmap[idx][1],
//				"idx": idx
//			});
//			global_qd_type = 0;
//		},
		syncRender: function() {
			var t = this,
				data = t.model.toJSON();
			t.isLoad = false;
			var _html = _.template(list_tpl, data);
			t.$el.find(".js-qingdan-list").append(_html);
			Jser.loadimages(t.$el);
		},
		doSwitchQingdan: function(e) {
			// var t = this;
			// var $elm = $(e.currentTarget);
			// var type = $elm.attr("data-type");


		},
		doCheckdQingdan: function(e) {
			var $elm = $(e.currentTarget);
			var ptid = $elm.attr("data-ptid");
			var name = $elm.attr("data-name");
			if (ptid) {
				$elm = $elm.parent();
				var _data = {
						"user_id": Jser.getItem('user_id'),
						"ptid": ptid
					},
					url = "product/productTypeUserAdd";
				if ($elm.hasClass("on")) {
					url = "product/productTypeUserDelete";
				}
				$elm.toggleClass("on");
				Jser.getJSON(ST.PATH.ACTION + url, _data, function(data) {

				}, function() {
					$elm.toggleClass("on");
				}, "post");
			} else if (typeof name != "undefined") {
				if ($elm.parent().hasClass("on2")) {
					Jser.confirm("确定要删除这件商品吗？", function() {
						var _data = {
								"user_id": Jser.getItem('user_id'),
								"product_name": name
							},
							url = "product/deleteListProduct";
						Jser.getJSON(ST.PATH.ACTION + url, _data, function(data) {
							$elm.parent().remove();
						}, function() {

						}, "get");
					});
				} else {
					$elm.parent().toggleClass("on");
				}
			}
		},
        doSetPeriod: function(type){
           location.href = "/webapp/period.html"
        },
		doDropdown: function(type) {
			var t = this;
			global_qd_type = type;
			t.model.fetchData();
		},
		doDropdown3: function(type) {
			var t = this;

			if (type == 1) {
				Jser.confirm('<div class="qingdan-add"><input type="text" id="js-qingdan-add-name" placeholder="请输入需要添加的商品名称"/></div>', function() {
					var name = $.trim($("#js-qingdan-add-name").val()),
						_html;
					if (name.length != 0) {
						var _data = {
								"user_id": Jser.getItem('user_id'),
								"product_name": encodeURI(name),
                                "ptmin": qdmap[_index][0],
				                "ptmax": qdmap[_index][1]
							},
							url = "product/addListProduct";
						Jser.getJSON(ST.PATH.ACTION + url, _data, function(data) {
							// $elm.parent().remove();

							_html = '<li class="clean product js-product">' + '<div class="qd-left">' + '<p class="qd-title">' + name + '</p>' + '</div>' + '<div class="qd-right js-qd-checked" data-name="' + name + '"><div class="qd-icon del"><i class="icon"></i><i class="del-icon"></i></div></div>' + '</li>'

							t.$el.find(".js-qingdan-list").append(_html);
						}, function() {

						}, "get");
					}
				});
				t.$el.find(".js-product").removeClass("on2");

				//增加商品
			} else if (type == 2) {
				//删除商品
				t.$el.find(".js-product").addClass("on2");
			} else {
				t.$el.find(".js-product").removeClass("on2");
			}
		},
		bindEvent: function() {
			var t = this;
			t.finishScroll();
			$(window).off("scroll.qingdan").on("scroll.qingdan", t.doScroll);
		},
		doScroll: function() {
			var t = indexSelf,
				hash = window.location.hash;
			if (!t.iTimer && !t.isLoad && hash.indexOf("#qingdan/index") != -1) {
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
				};
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
			$(window).off('scroll.qingdan', t.doScroll);
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
			pars: {
				"user_id": Jser.getItem('user_id'),
				"ptmin": qdmap[_index][0],
				"ptmax": qdmap[_index][1]
//				"idx": pars.idx
			}
		});
		return new V({
			el: $("#" + pars.model + "_" + pars.action)
		});
	}
});