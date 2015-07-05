define('', '', function(require) {
	var B = require('backbone');
	var M = require('base/model');
	var H = require('text!../../../tpl/share/index.html');
    var comment_tpl = require('text!../../../tpl/share/view/comment.html');
	var model = new M({
		action: 'weixin/shareDetail'
	});
//	var model2 = new M({
//		pars: {
//
//		}
//	});
    var hash = window.location.hash.replace('#share/index/', '');
    var _hash = {};
            $.each(hash.split('/'), function(key, value){
                if(value.indexOf(':')>=1){
                    var _pars = value.split(':');
                    _hash[_pars[0]] = _pars[1];
                }
            });
	var V = B.View.extend({
		model: model,
		template: H,
		events: {
            "click .js-advice": "showAdvice",
            "click .js-notice": "hideAdvice",
            "click .js-visit": "visit",
            "click .js-user": "comment"
		},
        showAdvice: function(e){
            var t = this;
            var commentid = ($(e.currentTarget).data("fid"));
            if(commentid)t.$el.find('.comment-' + commentid).show();
        },
        hideAdvice: function(e){
            var t = this;
            var commentid = ($(e.currentTarget).data("fid"));
            if(commentid)t.$el.find('.comment-' + commentid).hide();
        },

		initialize: function() {
			var t = this;
			t.listenTo(t.model, "sync", function() {
				t.render();
			});
		},

        visit: function(e){
            var href = $(e.currentTarget).data("href");
            var url = "weixin/ido";
            if(href){
                Jser.getJSON(ST.PATH.ACTION + url, {}, function(data) {
                    window.location = href;
				}, function() {

				}, "post");

            }else{
                this.showShare();
            }
        },
        showShare: function() {
            $(".js-go_share").show().on("mousedown.share", this.hideShare);
        },
        hideShare: function() {
            $(".js-go_share").hide().off("mousedown.share");
        },
		//待优化
        comment: function(e){
            var t = this;
            var fid = $(e.currentTarget).data("fid");
            var input = t.$el.find('.comment-' + fid + ' input').val();
            if(!input)return;
            var _html = _.template(comment_tpl, {
                data: {
                    img: 'http://lama.piapiapiapia.com/webapp/resource/images/xiaomeng.png',
                    user: 'kelly',
                    text: input
                }
            });
			t.$el.find(".comment-" + fid + " .js-container").append(_html);
        },

		render: function() {
			var t = this,
				data = t.model.toJSON();
            if(data.data.total){
                data.data.rate = (data.data.finished?data.data.finished:0)/data.data.total * 100;
            }
            if(_hash.photo)data.data.photo = decodeURIComponent(_hash.photo);
			var html = _.template(t.template, data);
			t.$el.show().html(html);
            var _height = $('.js-wrapper').height() - 44;
            $('.goshare-body').css('height', _height + 'px');
            if(data.data.rate!=undefined){
                t.$el.find('.progress').css('width', data.data.rate + '%');
            }

		}
	});
	return function(pars) {
		model.set({
			action: 'weixin/shareDetail',
            pars: {
                "id": pars.id,
                "userid": pars.userid
		    }
		});

		return new V({
			el: $("#" + pars.model + "_" + pars.action)
		});
	}
});