/*
 * 组件api说明
 * 	1、依赖move.js，组件前一定要引入move.js
 * 	2、轮播图需要有一个父级，这个父级一定要给一个id
 */

;(function(window,undefined){
	var Carousel=function(){
		this.settings={
			id:'pic',				//轮播图父级的id，必需传的参数
			autoplay:true,			//自动播放，true为自动，false为不自动，默认为true
			intervalTime:1000,		//间隔时间，运动后停顿的时间，默认1s
			loop:true,				//循环播放，true为循环，false为不循环，默认为true
			totalNum:5,				//图片总量
			moveNum:1,				//单次运动的图片数量（图片总量必须为运动数量的整倍数）
			circle:true,				//小圆点功能，true为显示，false为不显示，默认显示
			moveWay:'opacity'		//运动方式，opacity为透明度过渡，position为位置过渡
		};
	};
	
	Carousel.prototype={
		constructor:Carousel,
		init:function(opt){
			var opt=opt||this.settings;
			
			for(var attr in opt){
				this.settings[attr]=opt[attr];
			}
			
			this.createDom();
		},
		createDom:function(){			//创建结构
			var This=this;
			this.box=document.getElementById(this.settings.id);
			
			//创建上一个按钮
			this.prevBtn=document.createElement("div");
			this.prevBtn.className='prev';
			this.prevBtn.innerHTML='<';
			this.prevBtn.onclick=function(){
				This.prev();
				This.trigger('leftClick');
			};
			this.box.appendChild(this.prevBtn);
			
			
			//创建下一个按钮
			this.nextBtn=document.createElement("div");
			this.nextBtn.className='next';
			this.nextBtn.innerHTML='>';
			this.nextBtn.onclick=function(){
				This.next();
				This.trigger('rightClick');
			};
			this.box.appendChild(this.nextBtn);
			
			
			//创建圆点
			this.circleWrap=document.createElement("div");
			this.circleWrap.className='circle';
			this.circles=[];		//存圆点，后面需要修改圆点的class，弄一个数组存起来会方便些
			
			//如果每次走一屏的话，圆点数量就不能是总量了，所以要拿总量除以走的图片的数量
			for(var i=0;i<this.settings.totalNum/this.settings.moveNum;i++){
				var span=document.createElement("span");
				span.index=i;
				
				span.onclick=function(){
					This.cn=this.index;
					This[This.settings.moveWay+'Fn']();
				};
				
				this.circleWrap.appendChild(span);
				this.circles.push(span);
			}
			
			this.circles[0].className='active';
			
			if(this.settings.circle){
				this.box.appendChild(this.circleWrap);
			}
			
			this.moveInit();
		},
		moveInit:function(){			//运动初始化功能
			this.cn=0;				//当前的索引
			this.ln=0;				//上一个的索引
			this.canClick=true;		//是否可以再次点击
			this.endNum=this.settings.totalNum/this.settings.moveNum;//停止条件
			this.opacityItem=this.box.children[0].children;			//运动透明度的所有元素
			this.positionItemWrap=this.box.children[0].children[0];	//运动位置的元素的父级
			this.positionItem=this.positionItemWrap.children;		//运动位置的所有元素
			
			switch(this.settings.moveWay){
				case 'opacity':		//如果走的是透明度，需要设置透明度与transition
					for(var i=0;i<this.opacityItem.length;i++){
						this.opacityItem[i].style.opacity=0;
						this.opacityItem[i].style.transition='.3s opacity';
					}
					this.opacityItem[0].style.opacity=1;
					
					break;
				
				case 'position':		//如果走的是位置，需要设置父级的宽度
					//这里需要注意一下，一定要加上元素的margin
					var leftMargin=parseInt(getComputedStyle(this.positionItem[0]).marginLeft);
					var rightMargin=parseInt(getComputedStyle(this.positionItem[0]).marginRight);
					
					//一个运动元素的实际宽度
					this.singleWidth=leftMargin+this.positionItem[0].offsetWidth+rightMargin;
					
					//如果运动是循环的，需要复制一份内容
					if(this.settings.loop){
						this.positionItemWrap.innerHTML+=this.positionItemWrap.innerHTML;
					}
					
					//复制内容后才能设置宽度
					this.positionItemWrap.style.width=this.singleWidth*this.positionItem.length+'px';
			}
			
			if(this.settings.autoplay){
				this.autoPlay();
			}
		},
		opacityFn:function(){			//透明度运动方式
			//左边到头
			if(this.cn<0){
				if(this.settings.loop){
					//循环
					this.cn=this.endNum-1;
				}else{
					//不循环
					this.cn=0;
					this.canClick=true;		//解决点击头一张或者最后一张后，不能再次点击。是因为canClick是在transitionend里面设置的，如果不循环的话就会停在最后。再次点击的时候transitionend就不会发生，所以canClick的值就不会改变
				}
			}
			
			//右边到头
			if(this.cn>this.endNum-1){
				if(this.settings.loop){
					//循环
					this.cn=0;
				}else{
					//不循环
					this.cn=this.endNum-1;
					this.canClick=true;
				}
			}
			
			
			this.opacityItem[this.ln].style.opacity=0;
			this.circles[this.ln].className='';
			
			this.opacityItem[this.cn].style.opacity=1;
			this.circles[this.cn].className='active';
			
			var This=this;
			var en=0;
			
			this.opacityItem[this.cn].addEventListener('transitionend',function(){
				en++;
				if(en==1){
					This.canClick=true;
					This.ln=This.cn;
					
					This.endFn();				//调用自定义事件
				}
			});
		},
		positionFn:function(){
			//左边到头
			if(this.cn<0){
				if(this.settings.loop){
					//循环
					/*
					 * 在这里需要做两件事情
					 * 	1、先让运动的父级的位置到中间，为了往右走不会出现空白
					 * 	2、同时需要修改索引值（到了中间了，并不是停在那了，而是要运动出前一排，所以cn的值要减个1，为了就是能运动）
					 */
					//console.log(this.endNum);
					this.positionItemWrap.style.left=-this.positionItemWrap.offsetWidth/2+'px';
					this.cn=this.endNum-1;
				}else{
					//不循环
					this.cn=0;
				}
			}
			
			//右边到头
//			if(this.cn>this.endNum-1){
//				if(this.settings.loop){
//					//循环，这里不用做任何事情。需要在运动结束后去做条件判断
//				}else{
//					//不循环
//					this.cn=this.endNum-1;
//				}
//			}
			//这是上面的简写形式
			if(this.cn>this.endNum-1 && !this.settings.loop){
				this.cn=this.endNum-1;
			}
			
			
			//修改圆点，只有不循环的时候才去修改圆点
			if(!this.settings.loop){
				this.circles[this.ln].className='';
				this.circles[this.cn].className='active';
			}
			
			//运动
			//left的值=一个元素的宽度*当前cn的值*一次运动元素的个数
			var This=this;
			move(this.positionItemWrap,{left:-this.cn*this.singleWidth*this.settings.moveNum},300,'linear',function(){
				//当走到第二份的第一屏的时候就需要让运动的父级的left值变成0
				if(This.cn==This.endNum){
					//这个条件成立，说明现在已经到了第二份的第一屏了
					this.style.left=0;
					This.cn=0;
				}
				
				This.endFn();				//调用自定义事件
				
				This.canClick=true;
				This.ln=This.cn;
			});
		},
		prev:function(){			//上一个按钮点击功能
			//能否进行下一次点击，要放在这里面去判断
			if(!this.canClick){
				return;
			}
			this.canClick=false;
			
			this.cn--;
			this[this.settings.moveWay+'Fn']();
		},
		next:function(){			//下一个按钮点击功能
			if(!this.canClick){
				return;
			}
			this.canClick=false;
			
			this.cn++;
			this[this.settings.moveWay+'Fn']();
		},
		autoPlay:function(){			//自动播放功能
			var This=this;
			this.timer=setInterval(function(){
				This.next();
			},this.settings.intervalTime);
			
			//鼠标放上去的时候停止
			this.box.onmouseenter=function(){
				clearInterval(This.timer);
				This.timer=null;
			};
			
			//鼠标离开的时候继续播放
			this.box.onmouseleave=function(){
				This.autoPlay();
			};
		},
		on:function(type,listener){		//添加自定义事件
			this.events=this.events||{};
			this.events[type]=this.events[type]||[];
			this.events[type].push(listener);
		},
		trigger:function(type){			//调用自定义事件
			//因为有的组件有自定义事件，有的没有。所以需要做一个判断，只有有调用自定义事件的实例才能执行下面的代码
			if(this.events&&this.events[type]){
				for(var i=0;i<this.events[type].length;i++){
					this.events[type][i].call(this);
				}
			}
		},
		endFn:function(){
			//统一添加自定义事件的函数，要在运动完成以后添加。并且需要加给不循环的运动
			if(!this.settings.loop){
				if(this.cn==0){
					//这个条件满足的时候说明左边的运动已经到头了
					this.trigger('leftEnd');
				}
				
				if(this.cn==this.endNum-1){
					//这个条件满足的时候说明右边已经运动到头了
					this.trigger('rightEnd');
				}
			}
		}
	};
		
	window.Carousel=Carousel;
})(window,undefined);
