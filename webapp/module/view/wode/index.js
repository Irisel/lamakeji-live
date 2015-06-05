define('', '', function(require) {
	var B = require('backbone');
	var M = require('base/model');
	var H = require('text!../../../tpl/wode/index.html');
	var model = new M({
        logged: !!Jser.getItem('user_id'),
		pars: {
			"user_id": Jser.getItem("user_id")
		}
	});
	var V = B.View.extend({
		model: model,
		template: H,
		events: {
			"click .js-sure": "doSure",
            "click .js-logout": "doLogout"
		},
		initialize: function() {
			var t = this;
			t.listenTo(t.model, "sync", function() {
				t.render();
			});
		},
		//待优化
		render: function() {
            var status = {
                'born': '已出生',
                'during': '怀孕中',
                'prepare': '备孕中',
                'wondering': '随便逛逛'
            };
            var gender = {
                'female': '女',
                'male': '男'
            };
            var qdmap = {
		      prepare: ["-365", "-280"],
		      during: ["-280", "-0"],
		      born: ["0", ""],
		      wondering: ["", ""]
	        };
			var t = this,
				data = t.model.toJSON();
            if(Jser.getItem('user_id')){
                var user_status = '';
                var lama_json = {};

                $.each(qdmap, function(key, value){
                    if(data.data[0].ptmin == value[0] && data.data[0].ptmax == value[1]){
                        user_status = key;
                        lama_json.xinxistatus = user_status;
                    }
                })
                if(user_status == 'born' || user_status == 'during')data.data[0].moreInfo = true;
                if(user_status == 'born'){
                    data.data[0].data_type = '宝宝生日';
                    data.data[0].showGender = data.data[0].sex == '1'?'女孩':'男孩';
                }else if(user_status == 'during'){
                    data.data[0].data_type = '预产期';
                }
                lama_json.xinxichoosen = data.data[0].birthday;
                lama_json.xinxigender = data.data[0].sex == '1'?'female':'male';
                lama_json.signed = true;
                Jser.setItem('lama', JSON.stringify(lama_json));
                data.data[0].xinxichoosen = data.data[0].birthday;
                data.data[0].showStatus = status[user_status];
            }
            else if(window.localStorage){
                var lama = Jser.getItem('lama');
                if(lama){
                    lama = JSON.parse(lama);
                    if(lama.xinxistatus == 'during' || lama.xinxistatus == 'born')lama.moreInfo = true;
                    lama.showStatus = status[lama.xinxistatus];
                    if(lama.xinxistatus == 'born')lama.showGender = gender[lama.xinxigender];
                    if(!Jser.getItem('user_id'))data.data.push(lama);
                }
            }
			var html = _.template(t.template, data);
			t.$el.show().html(html);
			t.bindEvent();
			if (!App.isLogin()) {
				return false;
			}
		},
        doLogout: function(){
            Jser.setItem('user_id', "");
            Jser.setItem('lama', JSON.stringify({}));
            window.location.reload();
            window.location.href = '#login/index';
        },
		changePars: function(pars) {
			var t = this;
			var data = $.extend({}, t.model.get("pars"));
			$.extend(data, pars);
			t.model.set("pars", data);
			t.model.fetchData();
		},
		bindEvent: function() {
			var t = this;
			t.$el.find(".js-name").blur(function() {

			}).focus(function() {
				t.$el.find(".js-sure").show();
			});
		},
		doSure: function(e) {
			if (!App.isLogin()) {
				return false;
			}
			var t = this;
			var $elem = $(e.currentTarget);
			if ($elem.hasClass("modified")) {
				$elem.removeClass("modified").text("保存");
				t.$el.find(".js-name").removeAttr("disabled").focus();
			} else {
				var v1 = $.trim(t.$el.find(".js-name").val());
				if (v1.length != 0) {
					var _data = {
						"babynickname": v1,
						"user_id": Jser.getItem("user_id")
					};
					Jser.getJSON(ST.PATH.ACTION + "user/perfectUserInfo", _data, function(data) {
						// Jser.alert(data.msg);
						$elem.addClass("modified").text("修改");
						t.$el.find(".js-name").attr("disabled", true).blur();
					}, function() {

					}, "post");
				} else {
					Jser.alert("请输入宝宝昵称");
				}
			}

		}
	});
	return function(pars) {
		model.set({
			action: 'user/getUserInfo',
            pars: {
			    "user_id": Jser.getItem("user_id")
		    }
		});
		return new V({
			el: $("#" + pars.model + "_" + pars.action)
		});
	}
});