(function(){
'use strict';
var $=window.TTSenseiApp.$, $$=window.TTSenseiApp.$$, shuffle=window.TTSenseiApp.shuffle, setGuide=window.TTSenseiApp.setGuide, awardOnce=window.TTSenseiApp.awardOnce, markModuleComplete=window.TTSenseiApp.markModuleComplete;
function polygon(cx,cy,r,sides,rotation){
  var points=[];
  for(var i=0;i<sides;i++){
    var angle=(Math.PI*2*i/sides)+(rotation||0);
    points.push((cx+r*Math.cos(angle)).toFixed(2)+','+(cy+r*Math.sin(angle)).toFixed(2));
  }
  return '<polygon points="'+points.join(' ')+'"/>';
}
var judges = [
 {id:'square-same',legacyIndex:0,name:'正方形',yes:true,a:'<rect x="30" y="40" width="45" height="45"/>',b:'<rect x="145" y="20" width="90" height="90"/>',note:'どちらも正方形。対応する角は全部90°で、対応する辺の長さはすべて2倍です。'},
 {id:'rectangle-ratio',legacyIndex:1,name:'長方形',yes:false,a:'<rect x="20" y="38" width="80" height="40"/>',b:'<rect x="135" y="23" width="120" height="80"/>',note:'たては2倍ですが、横は1.5倍です。辺の長さの割合がそろわないので、拡大図・縮図ではありません。'},
 {id:'triangle-same',legacyIndex:2,name:'三角形',yes:true,a:'<polygon points="20,90 55,30 95,90"/>',b:'<polygon points="130,105 182.5,15 242.5,105"/>',note:'対応する辺の長さはすべて1.5倍で、対応する角も等しくなっています。'},
 {id:'rhombus-angle',legacyIndex:3,name:'ひし形',yes:false,a:'<polygon points="20,60 60,20 100,60 60,100"/>',b:'<polygon points="130,60 190,30 250,60 190,90"/>',note:'4辺が等しくても、角の大きさがちがいます。対応する角がそろわないため、拡大図・縮図ではありません。'},
 {id:'pentagon-same',legacyIndex:4,name:'正五角形',yes:true,a:polygon(55,62,29,5,-Math.PI/2),b:polygon(190,62,58,5,-Math.PI/2),note:'どちらも正五角形です。対応する角は等しく、対応する辺の長さはすべて2倍です。'},
 {id:'triangle-ratio',legacyIndex:5,name:'三角形',yes:false,a:'<polygon points="20,90 55,30 95,90"/>',b:'<polygon points="140,90 190,30 250,90"/>',note:'たての長さは同じですが、底辺の割合がちがいます。辺を同じ割合にしていないため、拡大図・縮図ではありません。'}
];
judges=shuffle(judges.slice());
var judgeIndex=0,judgeLocked=false;
var overlaySvg=$('#overlaySvg'),overlayWorkbench=$('#overlayWorkbench'),overlayScaleInput=$('#overlayScale'),overlayRotateInput=$('#overlayRotate');
var overlayScale=1,overlayRotate=0,overlayX=260,overlayY=120,showOverlayAngles=false,overlayDrag=null;

function parseShape(markup){
  var rect=markup.match(/<rect\b[^>]*>/i);
  if(rect){
    var tag=rect[0];
    function attr(name){var m=tag.match(new RegExp(name+'="([^"]+)"'));return m?Number(m[1]):0;}
    var x=attr('x'),y=attr('y'),w=attr('width'),h=attr('height');
    return [[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
  }
  var match=markup.match(/points="([^"]+)"/i);
  if(!match)return [];
  return match[1].trim().split(/\s+/).map(function(pair){
    var xy=pair.split(',');
    return [Number(xy[0]),Number(xy[1])];
  });
}
function localPoints(markup){
  var pts=parseShape(markup);
  if(!pts.length)return pts;
  var xs=pts.map(function(p){return p[0];}),ys=pts.map(function(p){return p[1];});
  var cx=(Math.min.apply(null,xs)+Math.max.apply(null,xs))/2;
  var cy=(Math.min.apply(null,ys)+Math.max.apply(null,ys))/2;
  return pts.map(function(p){return [p[0]-cx,p[1]-cy];});
}
function pointString(points){
  return points.map(function(p){return p[0].toFixed(2)+','+p[1].toFixed(2);}).join(' ');
}
function angleList(points){
  return points.map(function(p,i){
    var prev=points[(i+points.length-1)%points.length],next=points[(i+1)%points.length];
    var ax=prev[0]-p[0],ay=prev[1]-p[1],bx=next[0]-p[0],by=next[1]-p[1];
    var al=Math.sqrt(ax*ax+ay*ay),bl=Math.sqrt(bx*bx+by*by);
    if(!al||!bl)return 0;
    var cos=(ax*bx+ay*by)/(al*bl);
    cos=Math.max(-1,Math.min(1,cos));
    return Math.round(Math.acos(cos)*180/Math.PI);
  });
}
function transformedPoint(p,cx,cy,scale,rotation){
  var r=rotation*Math.PI/180,cos=Math.cos(r),sin=Math.sin(r);
  return [cx+scale*(p[0]*cos-p[1]*sin),cy+scale*(p[0]*sin+p[1]*cos)];
}
function angleLabels(points,cx,cy,scale,rotation,color,offset){
  var angles=angleList(points),out='';
  points.forEach(function(p,i){
    var prev=points[(i+points.length-1)%points.length],next=points[(i+1)%points.length];
    var ax=prev[0]-p[0],ay=prev[1]-p[1],al=Math.sqrt(ax*ax+ay*ay)||1;
    var bx=next[0]-p[0],by=next[1]-p[1],bl=Math.sqrt(bx*bx+by*by)||1;
    var ix=ax/al+bx/bl,iy=ay/al+by/bl,il=Math.sqrt(ix*ix+iy*iy)||1;
    ix/=il;iy/=il;
    var world=transformedPoint(p,cx,cy,scale,rotation);
    var r=rotation*Math.PI/180,dx=(ix*Math.cos(r)-iy*Math.sin(r))*offset,dy=(ix*Math.sin(r)+iy*Math.cos(r))*offset;
    out+='<text class="overlay-angle-label" x="'+(world[0]+dx).toFixed(1)+'" y="'+(world[1]+dy+4).toFixed(1)+'" text-anchor="middle" fill="'+color+'">'+angles[i]+'°</text>';
  });
  return out;
}
function renderOverlay(){
  var q=judges[judgeIndex],a=localPoints(q.a),b=localPoints(q.b);
  var transform='translate('+overlayX.toFixed(1)+' '+overlayY.toFixed(1)+') rotate('+overlayRotate+') scale('+overlayScale.toFixed(2)+')';
  var out='<g transform="translate(100 120)" fill="rgba(35,101,204,.12)" stroke="#2365cc" stroke-width="2.5" stroke-linejoin="round"><polygon points="'+pointString(a)+'"/></g>';
  out+='<g class="overlay-candidate" data-overlay-candidate="true" transform="'+transform+'" fill="rgba(184,90,19,.13)" stroke="#b85a13" stroke-width="2.5" stroke-linejoin="round"><polygon points="'+pointString(b)+'"/></g>';
  if(showOverlayAngles){
    out+=angleLabels(a,100,120,1,0,'#2365cc',15);
    out+=angleLabels(b,overlayX,overlayY,overlayScale,overlayRotate,'#b85a13',27);
  }
  overlaySvg.innerHTML=out;
  overlaySvg.setAttribute('aria-label',q.name+'を重ねて比べる操作エリア。オレンジの図形はドラッグして動かせます。');
  $('#overlayScaleValue').textContent=Math.round(overlayScale*100)+'%';
  $('#overlayRotateValue').textContent=overlayRotate+'°';
  $('#overlayHint').textContent=showOverlayAngles
    ? '青い数字とオレンジの数字をくらべよう。図形を回したり大きさを変えたりしても、角の大きさそのものは変わらないよ。'
    : 'オレンジの図形を動かして、青い図形と比べてみよう。大きさと向きも調整できるよ。';
}
function resetOverlay(){
  overlayScale=1;overlayRotate=0;overlayX=260;overlayY=120;showOverlayAngles=false;overlayDrag=null;
  overlayScaleInput.value='100';overlayRotateInput.value='0';
  $('#overlayAngleToggle').setAttribute('aria-pressed','false');
  $('#overlayAngleToggle').textContent='角の大きさを表示';
  renderOverlay();
}
function svgCoordinates(event){
  var pt=overlaySvg.createSVGPoint();
  pt.x=event.clientX;pt.y=event.clientY;
  var matrix=overlaySvg.getScreenCTM();
  return matrix?pt.matrixTransform(matrix.inverse()):{x:event.offsetX,y:event.offsetY};
}
function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
function renderJudge(){
  resetOverlay();
  overlayWorkbench.hidden=true;
  $('#overlayToggle').textContent='重ねて確かめる';
  $('#overlayToggle').setAttribute('aria-expanded','false');
  var q=judges[judgeIndex];
  $('#judgeQ').textContent='この2つの'+q.name+'は、拡大図・縮図の関係？';
  $('#judgeNumber').textContent='第'+(judgeIndex+1)+'問 / '+judges.length;
  $('#judgeBar').style.width=(judgeIndex/judges.length*100)+'%';
  $('#judgeVisual').innerHTML='<g fill="rgba(35,101,204,.13)" stroke="#2365cc" stroke-width="2.2" stroke-linejoin="round">'+q.a+'</g><g fill="rgba(184,90,19,.13)" stroke="#b85a13" stroke-width="2.2" stroke-linejoin="round">'+q.b+'</g>';
  $('#judgeVisual').setAttribute('aria-label','左の図形と右の図形を比べる問題');
  $$('.choice').forEach(function(button){button.disabled=false;button.classList.remove('correct','incorrect');});
  $('#judgeNext').disabled=true;$('#judgeNext').textContent='次の問題';
  setGuide($('#judgeMsg'),'考えてみよう','角の大きさと、対応する辺の長さの割合を確かめよう。','hint');
  judgeLocked=false;
}
$('#overlayToggle').addEventListener('click',function(){
  var opening=overlayWorkbench.hidden;
  overlayWorkbench.hidden=!opening;
  $('#overlayToggle').setAttribute('aria-expanded',String(opening));
  $('#overlayToggle').textContent=opening?'図形を並べて見る':'重ねて確かめる';
  if(opening)renderOverlay();
});
overlayScaleInput.addEventListener('input',function(){overlayScale=Number(this.value)/100;renderOverlay();});
overlayRotateInput.addEventListener('input',function(){overlayRotate=Number(this.value);renderOverlay();});
$('#overlayCenter').addEventListener('click',function(){overlayX=100;overlayY=120;renderOverlay();});
$('#overlayAngleToggle').addEventListener('click',function(){
  showOverlayAngles=!showOverlayAngles;
  $('#overlayAngleToggle').setAttribute('aria-pressed',String(showOverlayAngles));
  $('#overlayAngleToggle').textContent=showOverlayAngles?'角の大きさを隠す':'角の大きさを表示';
  renderOverlay();
});
$('#overlayReset').addEventListener('click',resetOverlay);
overlaySvg.addEventListener('pointerdown',function(event){
  if(!event.target.closest||!event.target.closest('[data-overlay-candidate="true"]'))return;
  var p=svgCoordinates(event);
  overlayDrag={id:event.pointerId,dx:p.x-overlayX,dy:p.y-overlayY};
  try{overlaySvg.setPointerCapture(event.pointerId);}catch(ignore){}
  event.preventDefault();
});
overlaySvg.addEventListener('pointermove',function(event){
  if(!overlayDrag||overlayDrag.id!==event.pointerId)return;
  var p=svgCoordinates(event);
  overlayX=clamp(p.x-overlayDrag.dx,35,325);
  overlayY=clamp(p.y-overlayDrag.dy,25,215);
  renderOverlay();
  event.preventDefault();
});
function stopOverlayDrag(event){
  if(overlayDrag&&overlayDrag.id===event.pointerId){overlayDrag=null;}
}
overlaySvg.addEventListener('pointerup',stopOverlayDrag);
overlaySvg.addEventListener('pointercancel',stopOverlayDrag);
$$('.choice').forEach(function(button){
  button.addEventListener('click',function(){
    if(judgeLocked)return;
    judgeLocked=true;
    var q=judges[judgeIndex],answer=button.dataset.answer==='yes',good=answer===q.yes;
    $$('.choice').forEach(function(choice){
      choice.disabled=true;
      if(choice.dataset.answer===(q.yes?'yes':'no'))choice.classList.add('correct');
      else if(choice===button)choice.classList.add('incorrect');
    });
    if(good){awardOnce('judge-'+q.id,10,'judge-'+q.legacyIndex);setGuide($('#judgeMsg'),'正解！',q.note,'correct','good');}
    else{setGuide($('#judgeMsg'),'おしい！','正解は'+(q.yes?'〇　なっている':'×　なっていない')+'。'+q.note,'retry','retry');}
    $('#judgeBar').style.width=((judgeIndex+1)/judges.length*100)+'%';
    $('#judgeNext').disabled=false;
    $('#judgeNext').textContent=judgeIndex===judges.length-1?'作図へ進む':'次の問題';
  });
});
$('#judgeNext').addEventListener('click',function(){
  if(!judgeLocked)return;
  if(judgeIndex<judges.length-1){judgeIndex++;renderJudge();}
  else{markModuleComplete('judge');window.location.href='draw.html';}
});
$('#judgeRestart').addEventListener('click',function(){judges=shuffle(judges.slice());judgeIndex=0;renderJudge();});
renderJudge();
})();