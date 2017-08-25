window.yx={
	g:function(name){
		return document.querySelector(name);
	},
	ga:function(name){
		return document.querySelectorAll(name);
	},
	addEvent:function(obj,ev,fn){
		if(obj.addEventListener){
			obj.addEventListener(ev,fn);
		}else{
			obj.attachEvent('on'+ev,fn);
		}
	},
	removeEvent:function(obj,ev,fn){
		if(obj.removeEventListener){
			obj.removeEventListener(ev,fn);
		}else{
			obj.detachEvent('on'+ev,fn);
		}
	},
	getTopValue:function(obj){		//获取元素离html的距离
		var top=0;
		while(obj.offsetParent){
			top+=obj.offsetTop;
			obj=obj.offsetParent;
		}
		
		return top;
	},
	cutTime:function(target){	//倒计时
		var currentDate=new Date();
		var v=Math.abs(target-currentDate);
		
		return {
			d:parseInt(v/(24*3600000)),
			h:parseInt(v%(24*3600000)/3600000),
			m:parseInt(v%(24*3600000)%3600000/60000),
			s:parseInt(v%(24*3600000)%3600000%60000/1000)
		};
	},
	format:function(v){		//给时间补0
		return v<10?'0'+v:v;
	},
	formatDate:function(time){
		var d=new Date(time);
		return d.getFullYear()+'-'+yx.format(d.getMonth()+1)+'-'+yx.format(d.getDate())+' '+yx.format(d.getHours())+':'+yx.format(d.getMinutes());
	},
	parseUrl:function(url){		//把url后面的参数解析成对象
		//id=1143021
		var reg=/(\w+)=(\w+)/ig;
		var result={};
		
		url.replace(reg,function(a,b,c){
			result[b]=c;
		});
		
		return result;
	},
	public:{
		navFn:function(){		//导航功能
			var nav=yx.g('.nav');
			var lis=yx.ga('.navBar li');
			var subNav=yx.g('.subNav');
			var uls=yx.ga('.subNav ul');
			var newLis=[];			//存储实际有用的li
			
			//首页是没有hover状态，所以要从1开始循环，后面的三个li也没有hover状态
			for(var i=1;i<lis.length-3;i++){
				newLis.push(lis[i]);
			}
			
			for(var i=0;i<newLis.length;i++){
				newLis[i].index=uls[i].index=i;
				newLis[i].onmouseenter=uls[i].onmouseenter=function(){
					newLis[this.index].className='active';
					subNav.style.opacity=1;
					uls[this.index].style.display='block';
				};
				newLis[i].onmouseleave=uls[i].onmouseleave=function(){
					newLis[this.index].className='';
					subNav.style.opacity=0;
					uls[this.index].style.display='none';
				};
			}
			
			yx.addEvent(window,'scroll',setNavPos);
			setNavPos();
			function setNavPos(){
				nav.id=window.pageYOffset>nav.offsetTop?'navFix':'';
			}
		},
		shopFn(){		//购物车功能
			/*
			 * localStorage		本地存储
			 * 	可以把数据存储在用户的浏览器缓存里面，相当于在用户的本地创建了一个数据库，存储的形式是一个对象
			 * 	localStorage.setItem(key,value)		存储一条数据
			 * 	localStorage.getItem(key)			获取某条数据
			 * 	localStorage.removeItem(key)			删除某条数据
			 * 	localStorage.clear()					删除所有数据
			 * 	localStorage.length					获取数据的长度
			 * 	localStorage.key(i)					获取某条数据的key
			 * 
			 * 生命周期		只要不清除就一直存在
			 * 注意：
			 * 	1、IE不支持本地操作，需要放在服务器环境下。尽量都在服务器环境下操作
			 * 	2、如果设置的是重复的key，不会增加，而是修改已有的数据
			 * 			
			 */
			
			/*localStorage.setItem('kaivon','陈学辉');
			localStorage.setItem('QQ','356985332');
			localStorage.setItem('网站','http://www.kaivon.cn');
			//console.log(localStorage.getItem('kaivon'));
			
			for(var i=0;i<localStorage.length;i++){
				//console.log(localStorage.key(i));
			}
			localStorage.removeItem('网站');
			
			localStorage.clear();
			console.log(localStorage);*/
			
			
			//购物车添加商品展示
			var productNum=0;		//买了几个商品
			(function(local){
				var totalPrice=0;		//商品合计
				var ul=yx.g('.cart ul');
				var li='';
				ul.innerHTML='';
				
				for(var i=0;i<local.length;i++){
					var attr=local.key(i);			//取到每个key
					var value=JSON.parse(local[attr]);
					
					if(value&&value.sign=='productLocal'){
						//这个条件成立说明现在拿到的local就是我们主动添加的local
						li+='<li data-id="'+value.id+'">'+
								'<a href="#" class="img"><img src="'+value.img+'"/></a>'+
								'<div class="message">'+
									'<p><a href="#">'+value.name+'</a></p>'+
									'<p>'+value.spec.join(' ')+' x '+value.num+'</p>'+
								'</div>'+
								'<div class="price">¥'+value.price+'.00</div>'+
								'<div class="close">X</div>'+
							'</li>';
							
						totalPrice+=parseFloat(value.price)*Number(value.num);
					}
				}
				ul.innerHTML=li;
				
				productNum=ul.children.length;			//买了几个商品
				yx.g('.cartWrap i').innerHTML=productNum;	//更新商品数量的值
				yx.g('.cartWrap .total span').innerHTML='¥'+totalPrice+'.00';	//更新总价格
				
				//删除商品功能
				var colseBtns=yx.ga('.cart .list .close');
				for(var i=0;i<colseBtns.length;i++){
					colseBtns[i].onclick=function(){
						localStorage.removeItem(this.parentNode.getAttribute('data-id'));
						
						yx.public.shopFn();
						
						if(ul.children.length==0){
							yx.g('.cart').style.display='none';
						}
					};
				}
				
				//给小红圈添加事件
				var cartWrap=yx.g('.cartWrap');
				var timer;		//为了解决购物车与弹出层之间的间隙会触发leave事件的问题
				
				cartWrap.onmouseenter=function(){
					clearTimeout(timer);
					yx.g('.cart').style.display='block';
					scrollFn();
				};
				cartWrap.onmouseleave=function(){
					timer=setTimeout(function(){
						yx.g('.cart').style.display='none';	
					},100);
				};
				
				
			})(localStorage);
			
			
			//购物车的滚动条功能
			
			function scrollFn(){
				var contentWrap=yx.g('.cart .list');
				var content=yx.g('.cart .list ul');
				var scrollBar=yx.g('.cart .scrollBar');
				var slide=yx.g('.cart .slide');
				var slideWrap=yx.g('.cart .slideWrap');
				var btns=yx.ga('.scrollBar span');
				var timer;
				
				//倍数（用来设置滚动条的高度）
				var beishu=content.offsetHeight/contentWrap.offsetHeight;
				//设置滚动条显示与否
				scrollBar.style.display=beishu<=1?'none':'block';
				
				//给倍数一下最大值
				if(beishu>20){
					beishu=20;
				}
				
				//内容与内容的父级的倍数与滑块与滑块父级的倍数是相等的
				slide.style.height=slideWrap.offsetHeight/beishu+'px';
				
				
				//滑块拖拽
				var scrollTop=0;		//滚动条走的距离
				var maxHeight=slideWrap.offsetHeight-slide.offsetHeight;		//滑块能够走的最大距离
				
				slide.onmousedown=function(ev){
					var disY=ev.clientY-slide.offsetTop;
					
					document.onmousemove=function(ev){
						scrollTop=ev.clientY-disY;
						scroll();
					};
					document.onmouseup=function(){
						this.onmousemove=null;
					};
					
					ev.cancelBubble=true;
					return false;
				};
				
				//滚轮滚动的功能
				myScroll(contentWrap,function(){
					scrollTop-=10;
					scroll();
					
					clearInterval(timer);
				},function(){
					scrollTop+=10;
					scroll();
					
					clearInterval(timer);
				});
				
				//上下箭头点击的功能
				for(var i=0;i<btns.length;i++){
					btns[i].index=i;
					btns[i].onmousedown=function(){
						var n=this.index;
						timer=setInterval(function(){
							scrollTop=n?scrollTop+5:scrollTop-5;
							scroll();
						},16);
						
					};
					btns[i].onmouseup=function(){
						clearInterval(timer);
					};
				}
				
				//滑块区域点击的功能
				slideWrap.onmousedown=function(ev){
					timer=setInterval(function(){
						var slideTop=slide.getBoundingClientRect().top+slide.offsetHeight/2;
						if(ev.clientY<slideTop){
							//这个条件成立说明现在鼠标在滑块的上面，滚动条应该往上走
							scrollTop-=5;
						}else{
							scrollTop+=5;
						}
						
						//如果他们俩的差的绝对值小于5了，我就认为到达了终点，这个时候清除掉定时器就能够解决闪动的问题
						if(Math.abs(ev.clientY-slideTop)<=5){
							clearInterval(timer);
						}
						
						scroll();
					},16);
				};
				
				//滚动条的主体功能
				function scroll(){
					if(scrollTop<0){
						scrollTop=0;
					}else if(scrollTop>maxHeight){
						scrollTop=maxHeight;
					}
					
					var scaleY=scrollTop/maxHeight;
					
					slide.style.top=scrollTop+'px';
					content.style.top=-(content.offsetHeight-contentWrap.offsetHeight)*scaleY+'px';
				}
				
				//滚轮事件
				function myScroll(obj,fnUp,fnDown){
					obj.onmousewheel=fn;
					obj.addEventListener('DOMMouseScroll',fn);
					
					function fn(ev){
						if(ev.wheelDelta>0 || ev.detail<0){
							fnUp.call(obj);
						}else{
							fnDown.call(obj);
						}
						
						ev.preventDefault();
						return false;
					}
				}
			}
		},
		lazyImgFn:function(){		//图片懒加载功能
			yx.addEvent(window,'scroll',delayImg);
			delayImg();
			function delayImg(){
				var originals=yx.ga('.original');		//所有要懒加载的图片
				var scrollTop=window.innerHeight+window.pageYOffset;		//这个距离是可视区的高度与滚动条的距离之和
				
				for(var i=0;i<originals.length;i++){
					//如果图片离html的上边的距离小于滚动条的距离与可视区的距离之和的话，就表示图片已经进入到可视区了
					if(yx.getTopValue(originals[i])<scrollTop){
						originals[i].src=originals[i].getAttribute('data-original');
						originals[i].removeAttribute('class');	//如果这个图片的地址已经换成真实的地址了，那就把它身上的class去掉，为了再次获取不到这张图片
					}
				}
				
				if(originals[originals.length-1].getAttribute('src')!='images/empty.gif'){
					//当这个条件成立的时候，说明现在所有的图片的地址都已经换成真实的地址了，这个时候就不需要再执行这个函数了
					yx.removeEvent(window,'scroll',delayImg);
				}
			}
		},
		backUpFn:function(){			//回到顶部功能
			var back=yx.g('.back');
			var timer;
			back.onclick=function(){
				var top=window.pageYOffset;
				
				timer=setInterval(function(){
					top-=150;
					if(top<=0){
						top=0;
						clearInterval(timer);
					}
					
					window.scrollTo(0,top);
				},16);
			};
		}
	}
}
