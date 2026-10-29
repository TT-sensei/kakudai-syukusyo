(function(){
'use strict';
var $=window.TTSenseiApp.$, $$=window.TTSenseiApp.$$, shuffle=window.TTSenseiApp.shuffle, setGuide=window.TTSenseiApp.setGuide, awardOnce=window.TTSenseiApp.awardOnce, markModuleComplete=window.TTSenseiApp.markModuleComplete;
function scaleSceneArt(kind){
  var arts={
    map:'<svg viewBox="0 0 150 78" role="img" aria-label="地図上のルート"><path d="M9 60 Q35 18 63 43 T136 18" fill="none" stroke="#c3d9cd" stroke-width="14" stroke-linecap="round"/><path d="M9 60 Q35 18 63 43 T136 18" fill="none" stroke="#2365cc" stroke-width="3" stroke-dasharray="4 5" stroke-linecap="round"/><circle cx="10" cy="60" r="6" fill="#177245" stroke="#fff" stroke-width="2"/><path d="M136 9l9 18h-18z" fill="#b85a13"/><text x="9" y="75" font-size="8" fill="#1c2d42">出発</text><text x="113" y="39" font-size="8" fill="#1c2d42">目的地</text></svg>',
    school:'<svg viewBox="0 0 150 78" role="img" aria-label="校内の配置図"><path d="M10 62H140" stroke="#a3c9b2" stroke-width="12" stroke-linecap="round"/><rect x="22" y="13" width="40" height="37" rx="3" fill="#eaf2ff" stroke="#2365cc" stroke-width="2"/><path d="M17 16L42 3l25 13" fill="#d7e7ff" stroke="#2365cc" stroke-width="2" stroke-linejoin="round"/><rect x="88" y="21" width="39" height="29" rx="3" fill="#fff2e5" stroke="#b85a13" stroke-width="2"/><path d="M63 42Q75 56 88 42" fill="none" stroke="#087e8b" stroke-width="3" stroke-dasharray="3 3"/><text x="26" y="34" font-size="8" fill="#174fa9">校舎</text><text x="92" y="38" font-size="8" fill="#8c440d">体育館</text></svg>',
    plan:'<svg viewBox="0 0 150 78" role="img" aria-label="設計図"><rect x="12" y="9" width="126" height="60" rx="2" fill="#fff" stroke="#2365cc" stroke-width="2"/><path d="M72 9V45H138M12 43H72M42 43V69M100 45V69" stroke="#2365cc" stroke-width="2"/><rect x="20" y="16" width="42" height="20" fill="#e5f5f6" stroke="#087e8b"/><rect x="80" y="16" width="49" height="20" fill="#fff2e5" stroke="#b85a13"/><path d="M19 61H33M19 57V65M33 57V65" stroke="#b85a13" stroke-width="1.4"/></svg>',
    room:'<svg viewBox="0 0 150 78" role="img" aria-label="部屋の間取り図"><rect x="10" y="8" width="130" height="62" fill="#fff" stroke="#2365cc" stroke-width="2"/><path d="M84 8V43H140M10 44H84M48 44V70" fill="none" stroke="#2365cc" stroke-width="2"/><rect x="20" y="17" width="53" height="18" rx="2" fill="#e5f5f6" stroke="#087e8b" stroke-width="1.5"/><rect x="94" y="51" width="35" height="11" rx="2" fill="#fff2e5" stroke="#b85a13" stroke-width="1.5"/><path d="M20 38H73" stroke="#b85a13" stroke-dasharray="3 3"/></svg>',
    garden:'<svg viewBox="0 0 150 78" role="img" aria-label="花だんの配置図"><rect x="12" y="8" width="126" height="62" rx="5" fill="#e8f7ef" stroke="#177245" stroke-width="2"/><path d="M22 24H128M22 39H128M22 54H128" stroke="#a3d7ad" stroke-width="2"/><g fill="#177245"><circle cx="30" cy="18" r="4"/><circle cx="55" cy="18" r="4"/><circle cx="80" cy="18" r="4"/><circle cx="105" cy="18" r="4"/><circle cx="42" cy="32" r="4"/><circle cx="67" cy="32" r="4"/><circle cx="92" cy="32" r="4"/><circle cx="117" cy="32" r="4"/><circle cx="30" cy="47" r="4"/><circle cx="55" cy="47" r="4"/><circle cx="80" cy="47" r="4"/><circle cx="105" cy="47" r="4"/><circle cx="42" cy="61" r="4"/><circle cx="67" cy="61" r="4"/><circle cx="92" cy="61" r="4"/><circle cx="117" cy="61" r="4"/></g></svg>',
    field:'<svg viewBox="0 0 150 78" role="img" aria-label="校庭の地図"><rect x="11" y="7" width="128" height="64" rx="12" fill="#e8f7ef" stroke="#177245" stroke-width="2"/><rect x="28" y="17" width="94" height="44" rx="5" fill="none" stroke="#7dbb8b" stroke-width="1.5"/><path d="M75 17V61M28 39H122" stroke="#7dbb8b" stroke-width="1.5"/><circle cx="75" cy="39" r="8" fill="none" stroke="#7dbb8b" stroke-width="1.5"/><path d="M19 65Q46 43 68 58T129 16" fill="none" stroke="#b85a13" stroke-width="3" stroke-dasharray="4 4"/></svg>'
  };
  return arts[kind]||arts.plan;
}
function renderScaleScene(q){
  var box=$('#scaleScene');
  box.innerHTML='<div class="scene-art">'+scaleSceneArt(q.scene)+'</div><div class="scene-copy"><span class="scene-kicker">活用ミッション</span><p>'+q.sceneText+'</p><div class="scene-facts">'+q.facts.map(function(fact){return '<span>'+fact+'</span>';}).join('')+'</div></div>';
}
scaleQuestions=shuffle(scaleQuestions.slice());
var scaleIndex=0,scaleLocked=false;
function renderScale(){
  var q=scaleQuestions[scaleIndex];
  $('#scaleQ').textContent=q.title;
  renderScaleScene(q);
  $('#scaleLead').textContent=q.question;
  $('#scaleNumber').textContent='第'+(scaleIndex+1)+'問 / '+scaleQuestions.length;
  $('#scaleBar').style.width=(scaleIndex/scaleQuestions.length*100)+'%';
  var optionItems=q.options.map(function(option,index){return {label:option,correct:index===q.correct};});
  shuffle(optionItems);
  $('#scaleOptions').innerHTML=optionItems.map(function(option){
    return '<button type="button" class="scale-option" data-correct="'+option.correct+'">'+option.label+'</button>';
  }).join('');
  $$('.scale-option').forEach(function(button){
    button.addEventListener('click',function(){
      if(scaleLocked)return;
      scaleLocked=true;
      var good=button.dataset.correct==='true';
      $$('.scale-option').forEach(function(optionButton){
        optionButton.disabled=true;
        if(optionButton.dataset.correct==='true')optionButton.classList.add('correct');
        else if(optionButton===button)optionButton.classList.add('incorrect');
      });
      if(good){awardOnce('scale-'+q.id,10,q.legacyIndex===undefined?null:'scale-'+q.legacyIndex);setGuide($('#scaleMsg'),'正解！',q.note,'correct','good');}
      else{setGuide($('#scaleMsg'),'いっしょに確かめよう',q.note,'retry','retry');}
      $('#scaleBar').style.width=((scaleIndex+1)/scaleQuestions.length*100)+'%';
      $('#scaleNext').disabled=false;
      $('#scaleNext').textContent=scaleIndex===scaleQuestions.length-1?'ミッションをふり返る':'次のミッション';
    });
  });
  setGuide($('#scaleMsg'),'考えるヒント',q.lead,'hint');
  $('#scaleNext').disabled=true;$('#scaleNext').textContent=scaleIndex===scaleQuestions.length-1?'ミッションをふり返る':'次のミッション';
  scaleLocked=false;
}
$('#scaleNext').textContent='次のミッション';
$('#scaleNext').addEventListener('click',function(){
  if(!scaleLocked)return;
  if(scaleIndex<scaleQuestions.length-1){scaleIndex++;renderScale();}
  else{markModuleComplete('scale');window.location.href='index.html?complete=scale';}
});
$('#scaleRestart').textContent='別の問題セット';
$('#scaleRestart').addEventListener('click',function(){scaleQuestions=shuffle(scaleQuestions.slice());scaleIndex=0;renderScale();setGuide($('#scaleMsg'),'新しいセット！','問題の順番も選択肢の順番も変わったよ。場面に合わせて考えよう。','hint');});
renderScale();
})();
