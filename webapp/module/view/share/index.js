define('', '', function(require) {
	var B = require('backbone');
	var M = require('base/model');
	var H = require('text!../../../tpl/share/index.html');
    var comment_tpl = require('text!../../../tpl/share/view/comment.html');
	var model = new M({
		pars: {

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
            if(href){
                window.location = href;
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
			var html = _.template(t.template, data);
			t.$el.show().html(html);
            var _height = $('.js-wrapper').height() - 44;
            $('.goshare-body').css('height', _height + 'px');
		}
	});
	return function(pars) {
		model.set({
			action: 'favorite/favoriteMyList',
            pars: {

		    }
		});
		return new V({
			el: $("#" + pars.model + "_" + pars.action)
		});
	}
});