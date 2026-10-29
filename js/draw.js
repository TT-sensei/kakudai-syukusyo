(function(){
'use strict';
var $=window.TTSenseiApp.$, $$=window.TTSenseiApp.$$, setGuide=window.TTSenseiApp.setGuide, awardOnce=window.TTSenseiApp.awardOnce, markModuleComplete=window.TTSenseiApp.markModuleComplete;
var drawShapes=[
  {id:'right-triangle',name:'直角三角形',vertices:['A','B','C'],points:{A:[0,0],B:[4,0],C:[0,2]},rightAngleAtA:true},
  {id:'isosceles-triangle',name:'二等辺三角形',vertices:['A','B','C'],points:{A:[0,0],B:[4,0],C:[2,4]}},
  {id:'scalene-triangle',name:'三角形',vertices:['A','B','C'],points:{A:[0,0],B:[6,0],C:[2,4]}},
  {id:'trapezoid',name:'台形',vertices:['A','B','C','D'],points:{A:[0,0],B:[6,0],C:[4,2],D:[2,2]}},
  {id:'parallelogram',name:'平行四辺形',vertices:['A','B','C','D'],points:{A:[0,0],B:[4,0],C:[6,2],D:[2,2]}},
  {id:'rhombus',name:'ひし形',vertices:['A','B','C','D'],points:{A:[0,0],B:[4,-2],C:[8,0],D:[4,2]}},
  {id:'rectangle',name:'長方形',vertices:['A','B','C','D'],points:{A:[0,0],B:[6,0],C:[6,2],D:[0,2]},rightAngleAtA:true},
  {id:'square',name:'正方形',vertices:['A','B','C','D'],points:{A:[0,0],B:[4,0],C:[4,4],D:[0,4]},rightAngleAtA:true}
];
var drawMultipliers=[0.5,1.5,2];
function randomInteger(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
function shuffle(items){
  for(var i=items.length-1;i>0;i--){
    var j=Math.floor(Math.random()*(i+1)),temp=items[i];
    items[i]=items[j];items[j]=temp;
  }
  return items;
}
function createDrawProblems(){
  return shuffle(drawShapes.slice()).map(function(shape){
    var k=drawMultipliers[Math.floor(Math.random()*drawMultipliers.length)];
    var bounds={minX:Infinity,maxX:-Infinity,minY:Infinity,maxY:-Infinity};
    shape.vertices.forEach(function(v){
      var p=shape.points[v];
      [p,[p[0]*k,p[1]*k]].forEach(function(q){
        bounds.minX=Math.min(bounds.minX,q[0]);
        bounds.maxX=Math.max(bounds.maxX,q[0]);
        bounds.minY=Math.min(bounds.minY,q[1]);
        bounds.maxY=Math.max(bounds.maxY,q[1]);
      });
    });
    var minOriginX=Math.ceil(1-bounds.minX),maxOriginX=Math.floor(17-bounds.maxX);
    var minOriginY=Math.ceil(1-bounds.minY),maxOriginY=Math.floor(9-bounds.maxY);
    if(minOriginX>maxOriginX||minOriginY>maxOriginY)throw new Error('方眼に収まらない図形があります: '+shape.name);
    return {shape:shape,k:k,origin:[randomInteger(minOriginX,maxOriginX),randomInteger(minOriginY,maxOriginY)]};
  });
}
var drawProblems=createDrawProblems(),D=null,drawIndex=0;
function multiplierText(k){return k===0.5?'1/2倍':k===1.5?'1.5倍':k+'倍';}
function pointString(point){return point[0]+','+point[1];}
function relativePositionText(dx,dy){
  var parts=[];
  if(dx>0)parts.push('右へ'+dx+'マス');
  else if(dx<0)parts.push('左へ'+Math.abs(dx)+'マス');
  if(dy>0)parts.push('下へ'+dy+'マス');
  else if(dy<0)parts.push('上へ'+Math.abs(dy)+'マス');
  return parts.join('、')||'Aと同じ位置';
}
function startDraw(index){
  drawIndex=index;
  var problem=drawProblems[index],shape=problem.shape,k=problem.k,origin=problem.origin,abs={},ans={};
  shape.vertices.forEach(function(v){
    var p=shape.points[v];
    abs[v]=[origin[0]+p[0],origin[1]+p[1]];
  });
  var centerPoint=abs.A;
  shape.vertices.forEach(function(v){
    ans[v]=[centerPoint[0]+k*(abs[v][0]-centerPoint[0]),centerPoint[1]+k*(abs[v][1]-centerPoint[1])];
  });
  D={shape:shape,vertices:shape.vertices,center:'A',k:k,abs:abs,ans:ans,centerPoint:centerPoint,target:shape.vertices.filter(function(v){return v!=='A';}),placed:{},active:shape.vertices.filter(function(v){return v!=='A';})[0],hintLevel:0,done:false};
  renderDraw();
}
function renderDraw(){
  var targets=D.target;
  $('#drawQ').textContent='第'+(drawIndex+1)+'問　'+D.shape.name+'をAを中心に'+multiplierText(D.k)+(D.k>1?'拡大':'縮小')+'しよう';
  $('#drawNumber').textContent=(drawIndex+1)+' / '+drawProblems.length;
  $('#drawBar').style.width=((drawIndex+(D.done?1:0))/drawProblems.length*100)+'%';
  $('#drawHelp').textContent='Aを中心に'+multiplierText(D.k)+'。Aから見た各頂点の向きと距離を、同じ倍率にしよう。';
  $('#drawFormula').innerHTML='<b>中心からの位置を同じ倍率にする</b>'+targets.map(function(v){
    var p=D.shape.points[v],x=p[0]*D.k,y=p[1]*D.k;
    return '<p class="mini"><b>A→'+v+'：</b>'+relativePositionText(p[0],p[1])+' → <b>A→'+v+'′：</b>'+relativePositionText(x,y)+'</p>';
  }).join('');
  $('#chips').innerHTML=targets.map(function(v){
    var isPlaced=!!D.placed[v];
    return '<button type="button" class="chip'+(D.active===v?' active':'')+(isPlaced?' done':'')+'" data-v="'+v+'" aria-pressed="'+(D.active===v)+'">'+v+'′ '+(isPlaced?'●':'を置く')+'</button>';
  }).join('');
  $$('.chip').forEach(function(button){button.addEventListener('click',function(){D.active=button.dataset.v;renderDraw();});});
  $('#drawNext').hidden=!D.done;
  $('#drawNext').textContent=drawIndex===drawProblems.length-1?'縮尺ミッションへ':'次の問題';
  $('#drawCheck').disabled=D.done;
  $('#drawHint').textContent=D.hintLevel===0?'ヒント① 方向':D.hintLevel===1?'ヒント② 距離':'ヒントを確認済み';
  $('#drawHint').disabled=D.hintLevel>=2||D.done;
  drawBoard();
}
function drawBoard(){
  var svg=$('#board'),markup='';
  for(var x=0;x<=17;x++)markup+='<line x1="'+x+'" y1="0" x2="'+x+'" y2="9" stroke="#d5dfeb" stroke-width=".045"/>';
  for(var y=0;y<=9;y++)markup+='<line x1="0" y1="'+y+'" x2="17" y2="'+y+'" stroke="#d5dfeb" stroke-width=".045"/>';
  if(D.hintLevel>0){
    D.target.forEach(function(v){
      var a=D.abs[v],cx=D.centerPoint[0],cy=D.centerPoint[1];
      var factor=1.2;
      markup+='<line x1="'+cx+'" y1="'+cy+'" x2="'+(cx+(a[0]-cx)*factor)+'" y2="'+(cy+(a[1]-cy)*factor)+'" stroke="#b85a13" stroke-width=".09" stroke-dasharray=".22 .18"/>';
    });
  }
  markup+='<polygon points="'+D.vertices.map(function(v){return pointString(D.abs[v]);}).join(' ')+'" fill="rgba(35,101,204,.12)" stroke="#2365cc" stroke-width=".12"/>';
  var a=D.centerPoint;
  if(D.shape.rightAngleAtA){
    markup+='<path d="M '+(a[0]+.38)+' '+a[1]+' L '+(a[0]+.38)+' '+(a[1]+.38)+' L '+a[0]+' '+(a[1]+.38)+'" fill="none" stroke="#2365cc" stroke-width=".1"/>';
  }
  D.vertices.forEach(function(v){
    markup+='<text x="'+D.abs[v][0]+'" y="'+(D.abs[v][1]-.42)+'" text-anchor="middle" font-size=".66" font-weight="bold" fill="#174fa9">'+v+'</text>';
  });
  var points={};
  D.vertices.forEach(function(v){points[v]=v===D.center?D.centerPoint:D.placed[v];});
  var allTargetPointsPlaced=D.vertices.every(function(v){return !!points[v];});
  if(allTargetPointsPlaced){
    markup+='<polygon points="'+D.vertices.map(function(v){return pointString(points[v]);}).join(' ')+'" fill="rgba(184,90,19,.16)" stroke="#b85a13" stroke-width=".12"/>';
    if(D.shape.rightAngleAtA){
      var ta=points[D.center];
      markup+='<path d="M '+(ta[0]+.28)+' '+ta[1]+' L '+(ta[0]+.28)+' '+(ta[1]+.28)+' L '+ta[0]+' '+(ta[1]+.28)+'" fill="none" stroke="#b85a13" stroke-width=".1"/>';
    }
  }else{
    for(var edge=0;edge<D.vertices.length;edge++){
      var from=points[D.vertices[edge]],to=points[D.vertices[(edge+1)%D.vertices.length]];
      if(from&&to)markup+='<line x1="'+from[0]+'" y1="'+from[1]+'" x2="'+to[0]+'" y2="'+to[1]+'" stroke="#b85a13" stroke-width=".12" stroke-linecap="round"/>';
    }
  }
  D.target.forEach(function(v){
    var p=points[v];
    if(p){
      markup+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r=".22" fill="#b85a13"/><text x="'+p[0]+'" y="'+(p[1]-.42)+'" text-anchor="middle" font-size=".66" font-weight="bold" fill="#b85a13">'+v+'′</text>';
    }
  });
  markup+='<circle cx="'+D.centerPoint[0]+'" cy="'+D.centerPoint[1]+'" r=".32" fill="none" stroke="#a93d3d" stroke-width=".1"/>';
  svg.innerHTML=markup;
}
$('#board').addEventListener('pointerdown',function(event){
  if(!D||D.done)return;
  var svg=event.currentTarget,point=svg.createSVGPoint();
  point.x=event.clientX;point.y=event.clientY;
  var transformed=point.matrixTransform(svg.getScreenCTM().inverse());
  if(transformed.x < -0.1 || transformed.x > 17.1 || transformed.y < -0.1 || transformed.y > 9.1)return;
  var x=Math.max(0,Math.min(17,Math.round(transformed.x))),y=Math.max(0,Math.min(9,Math.round(transformed.y)));
  D.placed[D.active]=[x,y];
  var next=D.target.filter(function(v){return !D.placed[v];})[0];
  if(next)D.active=next;
  setGuide($('#drawMsg'),'点を置いたよ','ほかの点も置いたら、チェックしよう。','hint');
  renderDraw();
});
$('#drawCheck').addEventListener('click',function(){
  if(!D.target.every(function(v){return !!D.placed[v];})){
    setGuide($('#drawMsg'),'点がまだ足りないよ',''+D.target.filter(function(v){return !D.placed[v];}).map(function(v){return v+'′';}).join('・')+'を置こう。','retry','retry');
    return;
  }
  var wrong=D.target.filter(function(v){return D.placed[v][0]!==D.ans[v][0]||D.placed[v][1]!==D.ans[v][1];});
  if(wrong.length){
    wrong.forEach(function(v){delete D.placed[v];});D.active=wrong[0];
    var advice=wrong.map(function(v){
      var p=D.ans[v];
      return v+'′は、Aから'+relativePositionText(p[0]-D.centerPoint[0],p[1]-D.centerPoint[1])+'の交点だよ。';
    }).join(' ');
    setGuide($('#drawMsg'),'ここを見直そう',advice,'retry','retry');
    renderDraw();
  }else{
    D.done=true;window.TTSenseiApp.recordCorrectAnswer('draw',D.shape.id);awardOnce('draw-'+D.shape.id+'-'+D.k,D.hintLevel>0?7:10);
    setGuide($('#drawMsg'),'正解！','Aから各頂点までの横・たての位置が、すべて'+multiplierText(D.k)+'になっているよ。','complete','good');
    renderDraw();
  }
});
$('#drawHint').addEventListener('click',function(){
  if(D.done||D.hintLevel>=2)return;
  D.hintLevel++;
  if(D.hintLevel===1){
    setGuide($('#drawMsg'),'ヒント① 方向','Aから各頂点に向かう方向へ置こう。拡大ならAから遠く、縮小なら近くなるよ。','hint');
  }else{
    var details=D.target.map(function(v){
      var p=D.shape.points[v],target=D.ans[v],a=D.centerPoint;
      return v+'：'+relativePositionText(p[0],p[1])+' → '+v+'′：'+relativePositionText(target[0]-a[0],target[1]-a[1]);
    }).join('。');
    setGuide($('#drawMsg'),'ヒント② 距離',details+'。それぞれの横・たての距離に倍率をかけよう。','hint');
  }
  renderDraw();
});
$('#drawReset').addEventListener('click',function(){startDraw(drawIndex);});
$('#drawNext').addEventListener('click',function(){
  if(drawIndex<drawProblems.length-1)startDraw(drawIndex+1);
  else{markModuleComplete('draw');window.location.href='scale.html';}
});
$('#drawAnotherSet').addEventListener('click',function(){
  drawProblems=createDrawProblems();
  startDraw(0);
  setGuide($('#drawMsg'),'新しい作図セット！','図形・倍率・位置が変わったよ。もう一度チャレンジしよう。','hint');
});
startDraw(0);
setGuide($('#drawMsg'),'作図のポイント','Aから各頂点までの向きと距離を見よう。','hint');


})();
