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
function renderJudge(){
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
