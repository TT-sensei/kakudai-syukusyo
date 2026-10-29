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
    D.done=true;awardOnce('draw-'+D.shape.id+'-'+D.k,D.hintLevel>0?7:10);
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

var scaleQuestions=[
 {id:'map-25000-4cm',legacyIndex:0,title:'遠足マップの道のり',scene:'map',sceneText:'遠足の目的地まで、地図で道のりをたどろう。',facts:['縮尺 1：25,000','地図上 4cm'],question:'地図上で道のりが4cm。実際の道のりは？',lead:'地図上の4cmを、実際の長さに直そう。',options:['100m','1km','10km'],correct:1,note:'4 × 25,000 ＝ 100,000cm。100,000cm ＝ 1,000m ＝ 1kmです。'},
 {id:'drawing-500-3cm',legacyIndex:1,title:'校庭マップの通路',scene:'school',sceneText:'校庭の通路を、縮尺つきの案内図で表したよ。',facts:['縮尺 1：500','図の長さ 3cm'],question:'通路の長さは、実際には何m？',lead:'図の長さに縮尺の分母をかけて、mに直そう。',options:['1.5m','15m','150m'],correct:1,note:'3 × 500 ＝ 1,500cm。1,500cm ÷ 100 ＝ 15mです。'},
 {id:'actual-600m-20000',legacyIndex:2,title:'道を地図に描こう',scene:'map',sceneText:'実際の道のりが分かっているので、地図に表す長さを求めるよ。',facts:['実際 600m','縮尺 1：20,000'],question:'地図では、道のりを何cmで描けばいい？',lead:'600mを先にcmに直してから、縮尺の分母で割ろう。',options:['2cm','3cm','12cm'],correct:1,note:'600m ＝ 60,000cm。60,000 ÷ 20,000 ＝ 3cmです。'},
 {id:'drawing-1000-2-4cm',legacyIndex:3,title:'校舎の配置図',scene:'school',sceneText:'校舎と校庭の位置関係を、配置図にまとめたよ。',facts:['縮尺 1：1,000','図の長さ 2.4cm'],question:'図の2.4cmは、実際には何m？',lead:'まずcmで実際の長さを求め、そのあとmに直そう。',options:['2.4m','24m','240m'],correct:1,note:'2.4 × 1,000 ＝ 2,400cm。2,400cm ÷ 100 ＝ 24mです。'},
 {id:'drawing-500-8cm',legacyIndex:4,title:'校庭の通路の長さ',scene:'field',sceneText:'広い校庭の通路も、縮尺があれば図から長さを求められるよ。',facts:['縮尺 1：500','図の長さ 8cm'],question:'通路の実際の長さは何m？',lead:'8cmに縮尺の分母をかけよう。',options:['4m','40m','400m'],correct:1,note:'8 × 500 ＝ 4,000cm。4,000cm ÷ 100 ＝ 40mです。'},
 {id:'school-map-18m-300',title:'校内案内図を作ろう',scene:'school',sceneText:'図書室から体育館までの案内図を作るよ。',facts:['実際 18m','縮尺 1：300'],question:'図の上では、18mを何cmで表す？',lead:'18mをcmに直し、縮尺の分母で割ろう。',options:['0.6cm','6cm','54cm'],correct:1,note:'18m ＝ 1,800cm。1,800 ÷ 300 ＝ 6cmです。'},
 {id:'park-plan-scale',title:'公園の設計図',scene:'plan',sceneText:'すべり台から砂場までの距離を、設計図に表したよ。',facts:['図の長さ 4cm','実際 8m'],question:'この設計図の縮尺は、どれかな？',lead:'実際の8mをcmに直し、「図：実際」を1：□の形にしよう。',options:['1：20','1：200','1：2,000'],correct:1,note:'8m ＝ 800cm。実際の長さは図の長さの800 ÷ 4 ＝ 200倍。縮尺は1：200です。'},
 {id:'room-plan-table',title:'部屋の間取り図',scene:'room',sceneText:'家具を買う前に、間取り図で置ける長さを確かめよう。',facts:['縮尺 1：50','実際 1.8m'],question:'実際の長さが1.8mの机は、図では何cm？',lead:'1.8mを180cmに直してから、50で割ろう。',options:['1.8cm','3.6cm','9cm'],correct:1,note:'1.8m ＝ 180cm。180 ÷ 50 ＝ 3.6cmです。'},
 {id:'garden-plan-100',title:'花だんの配置図',scene:'garden',sceneText:'花だんの幅を、花の植え方を考える配置図にまとめるよ。',facts:['縮尺 1：100','実際 3.5m'],question:'幅3.5mの花だんは、図では何cm？',lead:'3.5mをcmに直して、100で割ろう。',options:['0.35cm','3.5cm','35cm'],correct:1,note:'3.5m ＝ 350cm。350 ÷ 100 ＝ 3.5cmです。'},
 {id:'route-75000cm',title:'ハイキングの地図',scene:'map',sceneText:'歩くルートの長さを見積もって、出発前の計画を立てよう。',facts:['縮尺 1：20,000','地図上 7.5cm'],question:'地図上で7.5cmのルートは、実際には何km？',lead:'まずcmで実際の長さを求めてから、kmに直そう。',options:['150m','1.5km','15km'],correct:1,note:'7.5 × 20,000 ＝ 150,000cm。150,000cm ＝ 1,500m ＝ 1.5kmです。'},
 {id:'gym-plan-200',title:'体育館のレイアウト',scene:'plan',sceneText:'行事の準備で、体育館に机やいすをどう並べるか考えるよ。',facts:['縮尺 1：200','図の長さ 12cm'],question:'図で12cmの壁は、実際には何m？',lead:'12cmに200をかけて、mに直そう。',options:['2.4m','24m','240m'],correct:1,note:'12 × 200 ＝ 2,400cm。2,400cm ÷ 100 ＝ 24mです。'},
 {id:'hall-plan-scale',title:'体育館の図を調べよう',scene:'plan',sceneText:'実際の体育館の長さと図の長さから、縮尺を見つけるよ。',facts:['実際 30m','図の長さ 6cm'],question:'この図の縮尺は、どれかな？',lead:'30mをcmに直し、実際の長さが図の何倍かを調べよう。',options:['1：50','1：500','1：5,000'],correct:1,note:'30m ＝ 3,000cm。3,000 ÷ 6 ＝ 500なので、縮尺は1：500です。'}
];
})();
