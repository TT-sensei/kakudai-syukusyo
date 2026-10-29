(function(){
'use strict';
var $=function(selector){return document.querySelector(selector);};
var $$=function(selector){return Array.prototype.slice.call(document.querySelectorAll(selector));};
var NAVI_ROOT='https://tt-sensei.github.io/navi-character-/assets/web/characters/';
var GROUP_SHAPES='https://tt-sensei.github.io/navi-character-/assets/web/groups/learning/group-learning-math-shapes.webp';
var characterIds=['riku','sora','kai','saku','tsuki','nami'];
var scoreStoreKey='kakudai-syukusyo:score:v1';
var awardsStoreKey='kakudai-syukusyo:awards:v1';
var progressStoreKey='kakudai-syukusyo:completed:v1';
function readStored(key,fallback){try{var value=localStorage.getItem(key);return value===null?fallback:JSON.parse(value);}catch(error){return fallback;}}
function writeStored(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch(error){/* 保存できない環境でも学習は続けられる */}}
var score=Number(readStored(scoreStoreKey,0))||0;
var earnedAwards=new Set(readStored(awardsStoreKey,[]));
var moduleIds=['explore','judge','draw','scale'];
var moduleLabels={explore:'形のきまり',judge:'見分ける',draw:'作図ラボ',scale:'縮尺ミッション'};
var learningProgress=null;
var completedThisSession=new Set();
var persistedCompleted=new Set(readStored(progressStoreKey,[]));
if($('#score'))$('#score').textContent=String(score);
function addScore(points){score+=points;if($('#score'))$('#score').textContent=String(score);writeStored(scoreStoreKey,score);}
function awardOnce(key,points,legacyKey){
  if(earnedAwards.has(key)||(legacyKey&&earnedAwards.has(legacyKey))){
    if(!earnedAwards.has(key)){earnedAwards.add(key);writeStored(awardsStoreKey,Array.from(earnedAwards));}
    return false;
  }
  earnedAwards.add(key);writeStored(awardsStoreKey,Array.from(earnedAwards));addScore(points);return true;
}
function renderProgress(){
  moduleIds.forEach(function(id){
    var status=$('#status-'+id);if(!status)return;
    var done=completedThisSession.has(id)||persistedCompleted.has(id)||(learningProgress&&learningProgress.isCompleted(id));
    status.textContent=done?'✓ 練習済み':'';
    var card=$$('a.tab').filter(function(item){return item.getAttribute('href')===(id+'.html');})[0];
    if(card)card.setAttribute('aria-label',moduleLabels[id]+(done?'、練習済み':''));
  });
}
function markModuleComplete(id){
  completedThisSession.add(id);persistedCompleted.add(id);writeStored(progressStoreKey,Array.from(persistedCompleted));
  if(learningProgress)learningProgress.complete(id);renderProgress();
}
function areAllMissionsDone(){return moduleIds.every(function(id){return completedThisSession.has(id)||persistedCompleted.has(id)||(learningProgress&&learningProgress.isCompleted(id));});}
function randomCharacter(){return characterIds[Math.floor(Math.random()*characterIds.length)];}
function setGuide(container,title,message,mood,extraClass){
  if(!container)return;
  var img=container.querySelector('.navi-face'),text=container.querySelector('.navi-text');
  container.className='message'+(extraClass?' '+extraClass:'');
  if(img){img.style.display='';img.onerror=function(){img.style.display='none';};img.src=NAVI_ROOT+randomCharacter()+'/fullbody/'+(mood||'hint')+'.webp';}
  if(text)text.innerHTML='<strong>'+title+'</strong>'+message;
}
function shuffle(items){for(var i=items.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),temp=items[i];items[i]=items[j];items[j]=temp;}return items;}
var groupImage=$('#groupImage');
if(groupImage)groupImage.addEventListener('error',function(){if(this.dataset.fallback){this.style.display='none';return;}this.dataset.fallback='1';this.src=GROUP_SHAPES;});
window.TTSenseiApp={$: $, $$: $$, shuffle:shuffle, setGuide:setGuide, awardOnce:awardOnce, addScore:addScore, markModuleComplete:markModuleComplete, renderProgress:renderProgress, areAllMissionsDone:areAllMissionsDone, readStored:readStored};
renderProgress();
import('https://tt-sensei.github.io/edu-components/index.js').then(function(module){
  var storage=new module.StorageManager('kakudai-syukusyo');
  learningProgress=new module.ProgressManager({storage:storage,ids:moduleIds});
  moduleIds.forEach(function(id){if(learningProgress.isCompleted(id))persistedCompleted.add(id);});
  writeStored(progressStoreKey,Array.from(persistedCompleted));
  completedThisSession.forEach(function(id){learningProgress.complete(id);});
  persistedCompleted.forEach(function(id){learningProgress.complete(id);});
  renderProgress();
}).catch(function(){renderProgress();});
})();
