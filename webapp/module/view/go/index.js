define('', '', function(require) {
	var B = require('backbone');
	var M = require('base/model');
	var H = require('text!../../../tpl/go/index.html');
	var model = new M({
		pars: {
			"user_id": Jser.getItem("user_id"),
			"fromflag": "myselfandshare"
		}
	});
	var _x = "";
	var V = B.View.extend({
		model: model,
		template: H,
		events: {
			// "click .js-golist-remove": "doRemove"
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
			var html = _.template(t.template, data);
			t.$el.show().html(html);
			var h = Math.max($(document).height() - t.$el.height() - 20, 20);
			t.$el.find(".js-go-new").css("transform", "translateY(" + h + "px)");
			t.bindEvent();
			if (!App.isLogin()) {
				return false;
			}
		},
		bindEvent: function() {
			var t = this;
			var aLi = t.$el.find(".js-go-list li");
			var start = {},
				isScrolling;
			var noop = function() {}; // simple no operation function
			var offloadFn = function(fn) {
				setTimeout(fn || noop, 0)
			}; //
            var timeout = undefined;
            var touchend = true;
			var events = {

				handleEvent: function(event) {

					switch (event.type) {
						case 'touchstart':
							this.start(event);
							break;
						case 'touchmove':
							this.move(event);
							break;
						case 'touchend':
							offloadFn(this.end(event));
							break;
					}
					event.stopPropagation();

				},
				start: function(event) {

					var touches = event.touches[0];

					// measure start values
					// 获取初始坐标
					start = {

						// get initial touch coords
						x: touches.pageX,
						y: touches.pageY,

						// store time to determine touch duration
						// 获取开始时间戳
						time: +new Date()

					};

					// used for testing first move event
					isScrolling = undefined;

					// reset delta and end measurements
					delta = {};

					// attach touchmove and touchend listeners
					event.currentTarget.addEventListener('touchmove', this, false);
					event.currentTarget.addEventListener('touchend', this, false);

				},
				move: function(event) {

					// ensure swiping with one touch and not pinching
					if (event.touches.length > 1 || event.scale && event.scale !== 1) return
						// alert(options.disableScroll)
						// event.preventDefault();

					var touches = event.touches[0];

					// measure change in x and y
					delta = {
						x: touches.pageX - start.x,
						y: touches.pageY - start.y
					}

					// determine if scrolling test has run - one time test
					if (!isScrolling) {
						_x = Math.abs(delta.x);
//						console.log(_x)
						isScrolling = _x > 30 && _x > Math.abs(delta.y);
					} else {
						event.preventDefault();

						t.translate(event.currentTarget, delta.x + event.currentTarget.slidePos, 0);
					}
					// console.log(isScrolling);
					// if user is not trying to scroll vertically


				},
				end: function(event) {
					_x = delta.x;
					if (Math.abs(_x) > 30) {
						if (_x < 0) {
							t.move(event.currentTarget, -100, 400);
						} else {
							t.move(event.currentTarget, 0, 400);
						}
					}
					event.currentTarget.removeEventListener('touchmove', events, false)
					event.currentTarget.removeEventListener('touchend', events, false)

				}
			}
			aLi.each(function() {
				if (!$(this).data("is_recommend")) {
					this.addEventListener('touchstart', events, false);
					this.slidePos = 0;
				}
			});

			$(".js-golist-remove").on("touchstart", function(event) {
                event.preventDefault();
                event.stopPropagation();
                if(touchend){
                  touchend = false;
                  timeout = setTimeout(function(){
                    if($(event.currentTarget).data('userid') == '1'){
                        Jser.alert("默认的心愿单不能删除");
                    }else{
                        t.doRemove(event);
                    }
                    touchend = true;
                  }, 750);
                }

				// event.preventDefault();
			});

            $(".js-golist-remove").on("touchend", function(event) {
               clearTimeout(timeout);
//                console.log(event.target);
               if(!touchend)location.href = '#golist/index/fid:' + $(event.target).data('fid');
               touchend = true;
			});


		},
		move: function(elem, dist, speed) {
			this.translate(elem, dist, speed);
			elem.slidePos = dist;

		},
		translate: function(elem, dist, speed) {
			if (dist < -100) {
				dist = -100;
			} else if (dist > 0) {
				dist = 0;
			}

			var style = elem && elem.style;
			if (!style) return;

			style.webkitTransitionDuration =
				style.MozTransitionDuration =
				style.msTransitionDuration =
				style.OTransitionDuration =
				style.transitionDuration = speed + 'ms';
			// 3D加速
			style.webkitTransform = 'translate(' + dist + 'px,0)' + 'translateZ(0)';
			style.msTransform =
				style.MozTransform =
				style.OTransform = 'translateX(' + dist + 'px)';

		},
		doRemove: function(e) {
			var t = this;
			var $elem = $(e.currentTarget);
            var _data = {fid: $elem.attr("data-fid"), type: 1, user_id: Jser.getItem("user_id")};
			Jser.confirm("确定要删除此go单么？", function() {
				Jser.getJSON(ST.PATH.ACTION + "favorite/favoriteDelete", _data, function(data) {
					$elem.parent().remove();
				});
			});
			return false;
		},
		doNew: function() {

		},
		changePars: function() {
			var t = this;
			t.model.fetchData();
		}
	});
	return function(pars) {
		model.set({
			action: 'favorite/favoriteMyList',
            pars: {
			    "user_id": Jser.getItem("user_id"),
			    "fromflag": "myselfandshare"
		    }
		});
		return new V({
			el: $("#" + pars.model + "_" + pars.action)
		});
	}
});