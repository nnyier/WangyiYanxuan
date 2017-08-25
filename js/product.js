//公用方法调用
yx.public.navFn();
yx.public.backUpFn();

console.log(productList);


//解析url
var params=yx.parseUrl(window.location.href);
var pageId=params.id;				//产品对应的id
var curData=productList[pageId];		//产品对应的数据
if(!pageId || !curData){
	//这个就是404页面出现在条件
	window.location.href='404.html';
}

//面包屑的功能
var positionFn=yx.g('#position');
positionFn.innerHTML='<a href="#">首页</a> >';
for(var i=0;i<curData.categoryList.length;i++){
	positionFn.innerHTML+=' <a href="#">'+curData.categoryList[i].name+'</a> >';
}
positionFn.innerHTML+=curData.name;
//http://www.kaivon.cn/getData.php?id=1131017


//产品图功能
(function(){
	//左边图片切换功能
	var bigImg=yx.g('#productImg .left img');
	var smallImgs=yx.ga('#productImg .smallImg img');
	
	bigImg.src=smallImgs[0].src=curData.primaryPicUrl;
	
	var last=smallImgs[0];		//上一张图片
	for(var i=0;i<smallImgs.length;i++){
		if(i){
			//这个条件满足的话，说明现在是后四张图片
			smallImgs[i].src=curData.itemDetail['picUrl'+i];
		}
		
		smallImgs[i].index=i;
		smallImgs[i].onmouseover=function(){
			bigImg.src=this.src;
			last.className='';
			this.className='active';
			
			last=this;
		};
	}
	
	//右边图片相关信息更换
	yx.g('#productImg .info h2').innerHTML=curData.name;
	yx.g('#productImg .info p').innerHTML=curData.simpleDesc;
	yx.g('#productImg .info .price').innerHTML='<div><span>售价</span><strong>¥'+curData.retailPrice+'.00</strong></div><div><span>促销</span><a href="'+curData.hdrkDetailVOList[0].huodongUrlPc+'" class="tag">'+curData.hdrkDetailVOList[0].activityType+'</a><a href="'+curData.hdrkDetailVOList[0].huodongUrlPc+'" class="discount">'+curData.hdrkDetailVOList[0].name+'</a></div><div><span>服务</span><a href="#" class="service"><i></i>30天无忧退货<i></i>48小时快速退款<i></i>满88元免邮费<i></i>网易自营品牌</a></div>';
	
	//创建规格DOM
	var format=yx.g('#productImg .fomat');
	var dds=[];			//把所有的dd标签存起来，为了后面要用
	for(var i=0;i<curData.skuSpecList.length;i++){
		var dl=document.createElement("dl");
		var dt=document.createElement("dt");
		dt.innerHTML=curData.skuSpecList[i].name;
		dl.appendChild(dt);
		
		for(var j=0;j<curData.skuSpecList[i].skuSpecValueList.length;j++){
			var dd=document.createElement("dd");
			dd.innerHTML=curData.skuSpecList[i].skuSpecValueList[j].value;
			dd.setAttribute('data-id',curData.skuSpecList[i].skuSpecValueList[j].id)
			
			dd.onclick=function(){
				changeProduct.call(this);
			};
			
			dds.push(dd);
			dl.appendChild(dd);
		}
		
		format.appendChild(dl);
	}
	
	//点击规格功能
	function changeProduct(){
		//如果不能点击的话就返回
		if(this.className.indexOf('noclick')!=-1){
			return;
		}
		
		var curId=this.getAttribute('data-id');		//点的那个id
		var othersDd=[];			//对方所有的dd（操作他们的class）
		var mergeId=[];			//与点击的id组合到的所有id（用来去数据里查一下这个组合的产品余量是否为0）
		
		//找对方的dd以及组合后的id
		//数据对象里的key是“点击的id;对方的id”，所以只要能查到点的id的，它就包含了所有对方的id。
		for(var attr in curData.skuMap){
			if(attr.indexOf(curId)!=-1){
				//这个条件成立，说明在数据里找到了当前点的id能组合到的所有id
				
				//1132095;1132097		1132097
				var otherId=attr.replace(curId,'').replace(';','');
				
				//通过对方的id找到对方的dd
				for(var i=0;i<dds.length;i++){
					if(dds[i].getAttribute('data-id')==otherId){
						othersDd.push(dds[i]);
					}
				}
				
				mergeId.push(attr);		//把找到的所有组合的id放在数组里
			}
		}
		
		
		//点击的功能
		/*
		 * 点击的时候判断
		 * 	1、自己是末选中状态
		 * 		1、兄弟节点
		 * 			有选中的话要取消选中，有不能点击的不用处理
		 * 		2、自己选中
		 * 		3、对方节点
		 * 			先去掉有noclick的class的元素，再给不能点击的加上noclick
		 * 		
		 * 	2、自己是选中状态
		 * 		1、取消自己选中
		 * 			（兄弟节点不用处理）
		 * 		2、对方节点
		 * 			如果有不能点击的要去掉noclick的class
		 */
		
		var brothers=this.parentNode.querySelectorAll('dd');		//兄弟节点
		if(this.className=='active'){
			//选中状态
			this.className='';
			
			for(var i=0;i<othersDd.length;i++){
				if(othersDd[i].className=='noclick'){
					othersDd[i].className='';
				}
			}
		}else{
			//末选中状态
			for(var i=0;i<brothers.length;i++){
				if(brothers[i].className=='active'){
					brothers[i].className='';
				}
			}
			
			this.className='active';
			
			for(var i=0;i<othersDd.length;i++){
				if(othersDd[i].className=='noclick'){
					othersDd[i].className='';
				}
				if(curData.skuMap[mergeId[i]].sellVolume==0){
					othersDd[i].className='noclick';
				}
			}
		}
		
		addNum();
	}
	
	//加减功能
	addNum();
	function addNum(){
		var actives=yx.ga('#productImg .fomat .active');
		var btnParent=yx.g('#productImg .number div');
		var btns=btnParent.children;
		var ln=curData.skuSpecList.length;		//规格的数量
		
		//是否打开加减功能
		//console.log(actives.length,ln)
		if(actives.length==ln){
			//这个条件成立说明用户选中所有的规格了，这个时候就要把加减的功能打开
			btnParent.className='';
		}else{
			btnParent.className='noClick';
		}
		
		//减号点击
		btns[0].onclick=function(){
			if(btnParent.className){
				return;
			}
			
			btns[1].value--;
			if(btns[1].value<0){
				btns[1].value=0;
			}
		};
		
		//input点击
		btns[1].onfocus=function(){
			if(btnParent.className){
				//如果父级是不能点击的时候，就要让输入框永远失去焦点
				this.blur();
			}
		};
		
		//加号点击
		btns[2].onclick=function(){
			if(btnParent.className){
				return;
			}
			
			btns[1].value++;
		};
	}
})();


//加入购物车功能
(function(){
	yx.public.shopFn();
	
	var joinBtn=yx.g('#productImg .join');		//加入购物车按钮
	joinBtn.onclick=function(){
		var actives=yx.ga('#productImg .fomat .active');			//选中规格的数量
		var selectNum=yx.g('#productImg .number input').value;	//用户选中的产品个数
		
		if(actives.length<curData.skuSpecList.length || selectNum<1){
			alert('请选择正确的规格以及数量');
			return;
		}
		
		var id='';			//用拼接的id做为key
		var spec=[];			//规格有多个，所以放在一个数组里
		
		for(var i=0;i<actives.length;i++){
			id+=actives[i].getAttribute('data-id')+';';
			spec.push(actives[i].innerHTML);
		}
		id=id.substring(0,id.length-1);
		
		var select={
			"id":id,
			"name":curData.name,
			"price":curData.retailPrice,
			"num":selectNum,
			"spec":spec,
			"img":curData.skuMap[id].picUrl,
			"sign":"productLocal"		//给自己的local取一个标识，避免取到其它人的local
		};
		
		//把声明的对象存到localStorage里面
		localStorage.setItem(id,JSON.stringify(select));
		yx.public.shopFn();
		
		var cartWrap=yx.g('.cartWrap');
		cartWrap.onmouseenter();
		setTimeout(function(){
			yx.g('.cart').style.display='none';
		},2000);
		
	};
})();


//大家都在看
(function(){
	var ul=yx.g('#look ul');
	var str='';
	
	for(var i=0;i<recommendData.length;i++){
		str+='<li>'+
				'<a href="#"><img src="'+recommendData[i].listPicUrl+'"/></a>'+
				'<a href="#">'+recommendData[i].name+'</a>'+
				'<span>¥'+recommendData[i].retailPrice+'</span>'+
			'</li>';
	}
	ul.innerHTML=str;
	
	var allLook=new Carousel();
	allLook.init({
		id:'allLook',
		autoplay:false,
		intervalTime:3000,
		loop:false,
		totalNum:8,
		moveNum:4,
		circle:false,
		moveWay:'position'
	});
})();


//详情功能
(function(){
	//详情与评价选项卡
	var as=yx.ga('#bottom .title a');
	var tabs=yx.ga('#bottom .content>div');
	var ln=0;
	
	for(var i=0;i<as.length;i++){
		as[i].index=i;
		as[i].onclick=function(){
			as[ln].className='';
			tabs[ln].style.display='none';
			
			this.className='active';
			tabs[this.index].style.display='block';
			
			ln=this.index;
		};
	}
	
	
	//详情内容产品参数
	var tbody=yx.g('.details tbody');
	for(var i=0;i<curData.attrList.length;i++){
		/*
		 * 1、共有6条数据，需要创建3个tr，12个td
		 * 2、一个对象里包含两个数据，就需要两个td，所以每循环一次要创建两个td
		 * 3、一个tr里包含了四个td，所以循环两次创建一个tr
		 * 
		 */
		
		if(i%2==0){
			//这个条件是2的倍数
			var tr=document.createElement("tr");
		}
		
		var td1=document.createElement("td");
		td1.innerHTML=curData.attrList[i].attrName;
		var td2=document.createElement("td");
		td2.innerHTML=curData.attrList[i].attrValue;
		
		tr.appendChild(td1);
		tr.appendChild(td2);
		
		tbody.appendChild(tr);
	}
	
	//详情图片列表
	var img=yx.g('.details .img');
	img.innerHTML=curData.itemDetail.detailHtml;
})();


//评价功能
(function(){
	console.log(commentData);
	//修改标题上的文字
	var evaluateNum=commentData[pageId].data.result.length;		//当前评论的数量
	var evaluateText=evaluateNum>1000?'999+':evaluateNum;
	yx.ga('#bottom .title a')[1].innerHTML='评价<span>（'+evaluateText+'）</span>';
	
	var allData=[[],[]];			//第一个代表全部评价，第二个代表有图的评价
	for(var i=0;i<evaluateNum;i++){
		allData[0].push(commentData[pageId].data.result[i]);
		
		if(commentData[pageId].data.result[i].picList.length){
			allData[1].push(commentData[pageId].data.result[i]);
		}
	}
	yx.ga('#bottom .eTitle span')[0].innerHTML='全部（'+allData[0].length+'）';
	yx.ga('#bottom .eTitle span')[1].innerHTML='有图（'+allData[1].length+'）';
	
	
	var curData=allData[0];			//代表当前显示的那个数据
	var btns=yx.ga('#bottom .eTitle div');
	var ln=0;
	
	for(var i=0;i<btns.length;i++){
		btns[i].index=i;
		btns[i].onclick=function(){
			btns[ln].className='';
			this.className='active';
			
			ln=this.index;
			
			curData=allData[this.index];
			showComment(10,0);
			
			createPage(10,curData.length);			//生成页码
		};
	}
	
	
	//显示评价数据
	showComment(10,0);
	function showComment(pn,cn){
		//pn			一页显示几条
		//cn			现在是哪页
		
		var ul=yx.g('#bottom .border>ul');
		var dataStart=pn*cn;			//数据起始的值
		var dataEnd=dataStart+pn;	//数据结束的值
		
		//如果结束的值大于了数据的总量，循环的时候就会报错，所以要把结束的值改成数量总量
		if(dataEnd>curData.length){
			dataEnd=curData.length;
		}
		
		//主体结构
		var str='';
		ul.innerHTML='';
		for(var i=dataStart;i<dataEnd;i++){
			var avatart=curData[i].frontUserAvatar?curData[i].frontUserAvatar:'images/avatar.png';				//头像地址
			
			var smallImg='';		//小图的父级，要放在if外面
			var dialog='';		//轮播图的父级，要放在if外面
			
			if(curData[i].picList.length){
				//这个条件满足的话，说明这条评论有小图以及轮播图
				var span='';			//小图片的父级是个span标签
				var li='';			//轮播图图片的父级是个li标签
				for(var j=0;j<curData[i].picList.length;j++){
					span+='<span><img src="'+curData[i].picList[j]+'" alt=""></span>';
					li+='<li><img src="'+curData[i].picList[j]+'" alt=""></li>';
				}
				
				smallImg='<div class="smallImg clearfix">'+span+'</div>';
				dialog='<div class="dialog" id="commmetImg'+i+'" data-imgnum="'+curData[i].picList.length+'"><div class="carouselImgCon"><ul>'+li+'</ul></div><div class="close">X</div></div>';
			}
			
			str+='<li>'+
					'<div class="avatar">'+
						'<img src="'+avatart+'" alt="">'+
						'<a href="#" class="vip1"></a><span>'+curData[i].frontUserName+'</span>'+
					'</div>'+
					'<div class="text">'+
						'<p>'+curData[i].content+'</p>'+smallImg+
						'<div class="color clearfix">'+
							'<span class="left">'+curData[i].skuInfo+'</span>'+
							'<span class="right">'+yx.formatDate(curData[i].createTime)+'</span>'+
						'</div>'+dialog+
					'</div>'+
				'</li>';
		}
		
		ul.innerHTML=str;
		
		showImg();
	}
	
	//调用轮播图组件
	function showImg(){
		var spans=yx.ga('#bottom .smallImg span');
		for(var i=0;i<spans.length;i++){
			spans[i].onclick=function(){
				var dialog=this.parentNode.parentNode.lastElementChild;
				dialog.style.opacity=1;
				dialog.style.height='510px';
				
				var en=0;
				dialog.addEventListener('transitionend',function(){
					en++;
					if(en==1){
						var id=this.id;
						var commentImg=new Carousel();
						commentImg.init({
							id:id,
							totalNum:dialog.getAttribute('data-imgnum'),
							autoplay:false,
							loop:false,
							moveNum:1,
							circle:false,
							moveWay:'position'
						});
					}
				});
				
				var closeBtn=dialog.querySelector('.close');
				closeBtn.onclick=function(){
					dialog.style.opacity=0;
					dialog.style.height=0;
				};
			};
		}
	}
	
	//页码功能
	createPage(10,curData.length);
	function createPage(pn,tn){
		//pn			显示页码的数量
		//tn			数据的总数
		var page=yx.g('.page');
		var totalNum=Math.ceil(tn/pn);		//最多能显示的页码数量
		
		//如果用户给的页数比总页数还要大，就改成总数
		if(pn>totalNum){
			pn=totalNum;
		}
		page.innerHTML='';
		
		var cn=0;		//当前点击的页码的索引
		var spans=[];	//把数字的页码都放在一个数组里，其它的地方要用到
		var div=document.createElement("div");
		div.className='mainPage';
		
		//创建首页页码
		var indexPage=pageFn('首页',function(){
			for(var i=0;i<pn;i++){
				spans[i].innerHTML=i+1;
			}
			cn=0;
			
			showComment(10,0);
			changePage();
		});
		if(indexPage){		//避免页码的数量小于2的时候，返回值是个undefined，这里就会报错
			indexPage.style.display='none';
		}
		
		//创建上一页页码
		var prvePage=pageFn('<上一页',function(){
			/*cn--;
			if(cn<0){
				cn=0;
			}*/
			
			if(cn>0){
				cn--;
			}
			
			showComment(10,spans[cn].innerHTML-1);
			changePage();
		});
		if(prvePage){
			prvePage.style.display='none';
		}
		
		
		//创建数字页码
		for(var i=0;i<pn;i++){
			var span=document.createElement("span");
			span.index=i;
			span.innerHTML=i+1;
			spans.push(span);
			
			//给第1个页码加上class
			span.className=i?'':'active';
			
			span.onclick=function(){
				cn=this.index;
				showComment(10,this.innerHTML-1);
				changePage();
			};
			
			div.appendChild(span);
		}
		page.appendChild(div);
		
		
		//创建下一页页码
		var nextPage=pageFn('下一页>',function(){
			/*cn++;
			if(cn>spans.length-1){
				cn=spans.length-1;
			}*/

			if(cn<spans.length-1){
				cn++;
			}
			
			showComment(10,spans[cn].innerHTML-1);
			changePage();
		});
		
		//创建尾页页码
		var endPage=pageFn('尾页',function(){
			var end=totalNum;
			for(var i=pn-1;i>=0;i--){
				spans[i].innerHTML=end--;
			}
			cn=spans.length-1;
			
			showComment(10,totalNum-1);
			changePage();
		});
		
		
		//更新页码功能
		function changePage(){
			var cur=spans[cn];				//当前点击的那个页码
			var curInner=cur.innerHTML;		//因为后面会修改，所以存一下当前的页码的内容
			
			//拿最后的页码数字减去第一个页码的数字算出的差，就是页码要增加或者减少的数量，同时能保证点击的那个页码会出现在更新后的页码里面
			var differ=spans[spans.length-1].innerHTML-spans[0].innerHTML;
			
			//点击的是最后面的页码（页码要增加）
			if(cur.index==spans.length-1){
				if(Number(cur.innerHTML)+differ>totalNum){
					//如果加上差值后的页码要比总页码还要大，说明右边已经超过总页码了，那就需要重新设置一下差值
					differ=totalNum-cur.innerHTML;
				}
			}
			
			//点击的是最前面的页码（页码要减少）
			if(cur.index==0){
				if(cur.innerHTML-differ<1){
					//如果减去差值的页码比1还小，说明左边已经到头了。那就让页码从1开始
					differ=cur.innerHTML-1;
				}
			}
			
			for(var i=0;i<spans.length;i++){
				//点击的是最后面的页码，所有的页码都需要增加
				if(cur.index==spans.length-1){
					spans[i].innerHTML=Number(spans[i].innerHTML)+differ;
				}
				//点击的是最前面的页码，所有的页码都要减少
				if(cur.index==0){
					spans[i].innerHTML-=differ;
				}
				
				
				//设置class
				spans[i].className='';
				if(spans[i].innerHTML==curInner){
					spans[i].className='active';
					cn=spans[i].index;
				}
			}
			
			//显示与隐藏功能页码（当页码里面有功能页码才去执行下面的代码）
			if(pn>1){
				//点的是第一个页码，就让首页与上一页隐藏
				var dis=curInner==1?'none':'inline-block';
				indexPage.style.display=prvePage.style.display=dis;
				
				//点击的是最后一个页码，就让下一页与尾页隐藏
				var dis=curInner==totalNum?'none':'inline-block';
				nextPage.style.display=endPage.style.display=dis;
			}
			
		}
		
		//创建页码的公用函数
		function pageFn(inner,fn){
			if(pn<2){			//如果页码数量没超过2页就不创建功能页码
				return;
			}
			
			var span=document.createElement("span");
			span.innerHTML=inner;
			span.onclick=fn;
			page.appendChild(span);
			
			return span;			//把创建的标签返回出去，在外面能用得到
		}
	};
})();
