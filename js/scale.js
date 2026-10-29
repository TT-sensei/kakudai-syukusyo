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
      if(good){window.TTSenseiApp.recordCorrectAnswer('scale',q.id);awardOnce('scale-'+q.id,10,q.legacyIndex===undefined?null:'scale-'+q.legacyIndex);setGuide($('#scaleMsg'),'正解！',q.note,'correct','good');}
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
