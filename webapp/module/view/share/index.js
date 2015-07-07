define('', '', function(require) {
	var B = require('backbone');
	var M = require('base/model');
	var H = require('text!../../../tpl/share/index.html');
    var comment_tpl = require('text!../../../tpl/share/view/comment.html');
	var model = new M({
		action: 'weixin/shareDetail'
	});
    var letters = {
        0: '众人拾柴火焰高，这是见证朋友圈友谊的时刻，我会记住你们哒～',
        20: '同志们，再不下手就被买光了，赶紧抢下你们的责任田吧～',
        50: '哎唷，这么快就过半啦，时间不容犹豫，剩下的一半就靠你们啦～',
        80: '同志们哪，加把劲呀，考验朋友圈中坚力量的时候到了～',
        100: '人品大爆发，心愿单完成啦～'
    };
    var mobileType = {
          Android: function() {
            return navigator.userAgent.match(/Android/i) ? true : false;
          },
          iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true : false;
          },
          check: function(){
              var _this = this;
              if(_this.Android()){
                  return 'android';
              }else if(this.iOS()){
                  return 'ios';
              }else{
                  return undefined;
          }
      }
    };
    var mobile = mobileType.check();
    var shareid = null;
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
            "click .js-user": "comment",
            "click .js-download": "download",
            "click .js-jd":"jd"
		},
        showAdvice: function(e){
            var t = this;
            var productid = ($(e.currentTarget).data("fid"));
            if(!t.$el.find('.comment-' + productid + ' .goshare-comment').length){
                t.reload(productid);
            }
            if(productid)t.$el.find('.comment-' + productid).show();
        },
        reload: function(productid){
            var t = this;
            var _html = '';
            var url = 'weixin/commentList';
            var data = {
                productid: productid,
                shareid: shareid
            };
            Jser.getJSON(ST.PATH.ACTION + url, data, function(data) {
                $.each(data.data.result, function(key, value){
                    _html += _.template(comment_tpl, {
                        data: {
                            photo: decodeURIComponent(value.photo),
                            username: value.weiwuyu,
                            content: value.content,
                            addtime: value.addtime
                        }
                    });

                });
                t.$el.find('.comment-' + productid + ' .js-container').html(_html);
                t.$el.find('.comment-' + productid + ' .js-count').html(data.data.result.length);
			}, function() {

			});

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
        jd : function(e){
            var target = $(e.currentTarget);
            var href = target.data("href");
            var status = target.data("status");
            if(href){
                window.location = href;
            }else{
                this.showShare();
            }
        },
        visit: function(e){
            var target = $(e.currentTarget);
            var status = target.data("status");
            var href = target.data("href");
            if(href){
                if(status){
                    window.location = href;
                }else{
                    var productid = target.data("productid");
                    var url = "weixin/shareClaim";
                    var data = {
                        shareid: shareid,
                        productid: productid,
                        username: 'weiwuyu',
                        photo: _hash.photo,
                        openid: _hash.openid
                    };
                    Jser.getJSON(ST.PATH.ACTION + url, data, function(data) {
                        window.location = href;
				    }, function() {
                        window.location = href;
				    }, "post");
                }
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
        hideFinish: function() {
            $(".js-go_finish").hide().off("mousedown.share");
        },
        gif: function(width, height){
            var can = document.getElementById('canvas');
            var ctx = can.getContext("2d");
            var img = new Image();
            img.src="resource/images/open.png";
            function timeout(x_index){
                draw(x_index);
                x_index+=640;
                if(x_index<4480){
                    setTimeout(function(){
                        timeout(x_index);
                    }, 50);
                }else{

                }

            }
            function draw(x_index){
                var _index = x_index?x_index:0;
                ctx.clearRect(0,0, width, height);
                ctx.drawImage(img, _index, 0, 640, 1137, 0, 0, width, height);
            }
            if(img.complete){
                timeout(640);
            }else{
                img.onload = function(){
                    timeout(640);
                }
            }
        },
		//待优化
        comment: function(e){
            var t = this;
            var fid = $(e.currentTarget).data("fid");
            var input = t.$el.find('.comment-' + fid + ' input').val();
            if(!input)return;
            var url = "weixin/addComment";
            var _data = {
                shareid: shareid,
                productid: fid,
                username: 'weiwuyu',
                photo: _hash.photo,
                openid: _hash.openid,
                addtime: '刚刚',
                content: input
            };
            Jser.getJSON(ST.PATH.ACTION + url, _data, function(data) {
                    _data.photo = decodeURIComponent(_hash.photo);
                    var _html = _.template(comment_tpl, {
                        data: _data
                    });
			        t.$el.find(".comment-" + fid + " .js-container").append(_html);
                    t.$el.find('.comment-' + fid + ' input').val('');
                    var count = t.$el.find('.comment-' + fid + ' .js-count').text();
                    t.$el.find('.comment-' + fid + ' .js-count').html(Number(count)+1);
		    }, function() {

			}, "post");

        },
        download: function(){
            var ua = window.navigator.userAgent.toLowerCase();
            if(ua.match(/MicroMessenger/i) == 'micromessenger'){
                this.showDownload();
            }else{
                if(mobile == 'ios'){
                    window.location.href = 'https://itunes.apple.com/cn/app/ma-mi-shou-dai/id965693126?mt=8';
                }else if(mobile == 'android'){
                    window.location.href = 'http://android.myapp.com/myapp/detail.htm?apkName=com.lamakeji.MaMaGo';
                }
            }
        },
        showDownload: function() {
            $(".js-go_download").show().on("mousedown.share", this.hideDownload);
        },
        hideDownload: function() {
            $(".js-go_download").hide().off("mousedown.share");
        },
		render: function() {
			var t = this,
				data = t.model.toJSON();
            shareid = data.data.id;
            //data = {"errorcode":0,"data":{"id":"3","itemid":"1795","templateid":"15","userid":"14","name":null,"updatetime":"2015-07-02 22:58:42","picture":"http:\/\/image.lamakeji.com\/data\/slide\/20150703msuchn.jpg","nickname":null,"photo":"http:\/\/image.lamakeji.com\/Public\/photo\/14.jpg","sex":"0","total":6,"finishd":6,"product":[{"id":"652","name":"\u3010\u7f8e\u56fd\u8fdb\u53e3\u3011Vogmask\u5a01\u9694\u9632\u96fe\u973ePM2.5\u4eb2\u5b50\u53e3\u7f69 S\u53f7 3-6\u5c81","picture":"http:\/\/img13.360buyimg.com\/n1\/jfs\/t280\/348\/1915664510\/206951\/6cb64652\/5445d94bN6b15e9ac.jpg","cateid":"141","price":"225.00","areaid":"15","isrecommend":"1","url":"http:\/\/item.jd.com\/1351304798.html","isfollow":0,"status":1,"photo":"http%3a%2f%2fwx.qlogo.cn%2fmmopen%2fgM6cP3Obem1jHDwDo0bomd1suwTXak1Ll8X6Hf0a3InknjhicicX1zQ5gfLDIEhBaiaF5EWoJhMJ9YQTlTicIvv6kuOyVG40QMMD%2f0","username":"weiwuyu","updatetime":"2015-07-06 10:53:06"},{"id":"653","name":"\u3010PM2.5\u53e3\u7f69\u30113M 8110S\u513f\u7ae5\u5934\u5e26\u5f0f\u5c0f\u53f7\u9632\u5c18\u53e3\u7f69(20\u53ea\/\u76d2)","picture":"http:\/\/img12.360buyimg.com\/n1\/g13\/M0A\/00\/00\/rBEhU1HcFZMIAAAAAAaDICkxHKwAAA5IgDcCo4ABoM4923.jpg","cateid":"141","price":"159.00","areaid":"3","isrecommend":"1","url":"http:\/\/item.jd.com\/1026632972.html","isfollow":0,"status":1,"photo":"http%3a%2f%2fwx.qlogo.cn%2fmmopen%2fgM6cP3Obem1jHDwDo0bomd1suwTXak1Ll8X6Hf0a3InknjhicicX1zQ5gfLDIEhBaiaF5EWoJhMJ9YQTlTicIvv6kuOyVG40QMMD%2f0","username":"weiwuyu","updatetime":"2015-07-06 11:27:27"},{"id":"655","name":"\u3010\u9632pm2.5\u30113M \u513f\u7ae5\u9632\u96fe\u973e\u53e3\u7f69N95\u9632\u5c18\u53e3\u7f69 10\u53ea(\u7b80\u88c5)","picture":"http:\/\/img11.360buyimg.com\/n1\/jfs\/t190\/28\/1397698052\/95432\/cbbd8da5\/53ad1352Nf999d2ce.jpg","cateid":"141","price":"60.80","areaid":"3","isrecommend":"1","url":"http:\/\/item.jd.com\/1097934806.html","isfollow":0,"status":1,"photo":"http%3a%2f%2fwx.qlogo.cn%2fmmopen%2fgM6cP3Obem1jHDwDo0bomd1suwTXak1Ll8X6Hf0a3InknjhicicX1zQ5gfLDIEhBaiaF5EWoJhMJ9YQTlTicIvv6kuOyVG40QMMD%2f0","username":"weiwuyu","updatetime":"2015-07-06 14:22:08"},{"id":"656","name":"\u3010\u65e5\u672c\u8fdb\u53e3\u3011\u4e09\u6b21\u5143\u53e3\u7f69\u9632\u5c18\u9632\u96fe\u973e\u9632PM2.5 N95\u9762\u6599\u513f\u7ae55\u7247\u88c5","picture":"http:\/\/img10.360buyimg.com\/n1\/jfs\/t601\/274\/1243202582\/229354\/77ded197\/54c0624fNbbee5667.jpg","cateid":"141","price":"39.00","areaid":"14","isrecommend":"1","url":"http:\/\/item.jd.com\/1362489095.html","isfollow":0,"status":1,"photo":"http%3a%2f%2fwx.qlogo.cn%2fmmopen%2fgM6cP3Obem1jHDwDo0bomd1suwTXak1Ll8X6Hf0a3InknjhicicX1zQ5gfLDIEhBaiaF5EWoJhMJ9YQTlTicIvv6kuOyVG40QMMD%2f0","username":"weiwuyu","updatetime":"2015-07-06 21:31:34"},{"id":"657","name":"\u3010\u65e5\u672c\u539f\u88c5\u8fdb\u53e3\u3011\u5174\u7814KOKEN\u513f\u7ae5\u9632\u5c18\u9632PM2.5\u53e3\u7f69\u5e26\u547c\u5438\u9600 ","picture":"http:\/\/img10.360buyimg.com\/n1\/jfs\/t907\/322\/446286372\/248846\/17a8c112\/5523d306N5182b291.jpg","cateid":"141","price":"135.00","areaid":"14","isrecommend":"1","url":"http:\/\/item.jd.com\/1511557455.html","isfollow":0,"status":1,"photo":"http%3a%2f%2fwx.qlogo.cn%2fmmopen%2fgM6cP3Obem1jHDwDo0bomd1suwTXak1Ll8X6Hf0a3InknjhicicX1zQ5gfLDIEhBaiaF5EWoJhMJ9YQTlTicIvv6kuOyVG40QMMD%2f0","username":"weiwuyu","updatetime":"2015-07-06 14:35:01"},{"id":"659","name":"\u3010\u65b0\u52a0\u5761\u8fdb\u53e3\u3011totobobo\u9ad8\u6863\u513f\u7ae5\u9632\u973e\u5c18\u4e8c\u624b\u70dfPM2.5\u53e3\u7f69 ","picture":"http:\/\/img12.360buyimg.com\/n1\/jfs\/t703\/318\/891818770\/384527\/fe71b4c4\/5502725bN4698b9ca.jpg","cateid":"141","price":"208.00","areaid":"13","isrecommend":"1","url":"http:\/\/item.jd.com\/1481405222.html","isfollow":0,"status":1,"photo":"http%3a%2f%2fwx.qlogo.cn%2fmmopen%2fgM6cP3Obem1jHDwDo0bomd1suwTXak1Ll8X6Hf0a3InknjhicicX1zQ5gfLDIEhBaiaF5EWoJhMJ9YQTlTicIvv6kuOyVG40QMMD%2f0","username":"weiwuyu","updatetime":"2015-07-06 14:36:18"}]}};
            data.data.rate = parseInt((data.data.finishd?data.data.finishd:0)/(data.data.total || 1) * 100);
            $.each(letters, function(key, value){
                if(data.data.rate>=key)data.data.letters = value;
            });
//            if(_hash.photo)data.data.photo = decodeURIComponent(_hash.photo);
            data.data.claims = [];

            $.each(data.data.product, function(key, value){
                var _claim = {
                    username: value.username,
                    photo: value.photo,
                    name: value.name,
                    update: value.updatetime
                };
                _claim.photo = decodeURIComponent(_claim.photo);
                data.data.claims.push(_claim);
            });
			var html = _.template(t.template, data);
			t.$el.show().html(html);
            var _height = $('.js-wrapper').height();
            var _width = $('.js-wrapper').width();

            $('.goshare-body').css('height', _height + 'px');
            if(data.data.rate!=undefined){
                t.$el.find('.progress').css('width', data.data.rate + '%');
            }

//            if(data.data.rate>=100){
//                $('.js-go_finish').append('<canvas id="canvas" width="' + _width + '" height="' +  _width * 1421.25 / 800 + '"></canvas>');
//                $(".js-go_finish").show().on("mousedown.share", this.hideFinish);
//                this.gif(_width, _width * 1421.25 / 800);
//            }

            if(data.data.rate>=100){
                $('.js-go_finish').append('<img id="finish" src="resource/images/open.png">');
                $('.js-go_finish img').width(_width * 7).height(_width * 7 * 569 / 2240);
                $(".js-go_finish").show().on("mousedown.share", this.hideFinish);
                this.slide(_width);
            }

		},
        slide: function(width){
            var img = $('.js-go_finish img')[0];
            console.log(img.complete);
            var left = 0;
            function timeout(left){
                draw(left);
                left+=width;
                if(left<width * 7){
                    setTimeout(function(){
                        timeout(left);
                    }, 50);
                }else{

                }

            }
            function draw(left){
                $(img).css('left', left * -1)
            }
            if(img.complete){
                timeout(width);
            }else{
                img.onload = function(){
                    timeout(width);
                }
            }
        }

	});
	return function(pars) {
		model.set({
			action: 'weixin/shareDetail',
            pars: {
                "id": pars.fid,
                "userid": pars.userid
		    }
		});

		return new V({
			el: $("#" + pars.model + "_" + pars.action)
		});
	}
});