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
var badgeStoreKey='kakudai-syukusyo:badges:v1';
var correctAnswerStoreKey='kakudai-syukusyo:correct-answers:v1';
var pendingBadgeStoreKey='kakudai-syukusyo:pending-badges:v1';
var badgeDefinitions=Array.isArray(window.KAKUDAI_BADGES)?window.KAKUDAI_BADGES:[];
var badgeById=Object.create(null);
badgeDefinitions.forEach(function(badge){badgeById[badge.id]=badge;});
var badgeManager=null;
var fallbackAwardedBadges=new Set();
var savedBadgeIds=readStored(badgeStoreKey,[]);
if(Array.isArray(savedBadgeIds))savedBadgeIds.forEach(function(id){if(badgeById[id])fallbackAwardedBadges.add(id);});

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
function dispatchBadgeChange(){
  if(typeof CustomEvent==='function')document.dispatchEvent(new CustomEvent('tt:badgeschange',{detail:{awardedCount:fallbackAwardedBadges.size}}));
}
function getAwardedBadgeIds(){return Array.from(fallbackAwardedBadges);}
function getBadgeDefinitions(){return badgeDefinitions.slice();}
function hasBadge(id){return fallbackAwardedBadges.has(id);}
function queueBadgeNotice(id){
  var pending=readStored(pendingBadgeStoreKey,[]);
  if(!Array.isArray(pending))pending=[];
  if(pending.indexOf(id)===-1){pending.push(id);writeStored(pendingBadgeStoreKey,pending);}
}
function clearBadgeNotice(){
  writeStored(pendingBadgeStoreKey,[]);
  var notice=$('#badgeRewardNotice');
  if(notice)notice.remove();
}
function showBadgeRewardNotice(){
  var pending=readStored(pendingBadgeStoreKey,[]);
  if(!Array.isArray(pending))pending=[];
  pending=pending.filter(function(id,index){return badgeById[id]&&pending.indexOf(id)===index;});
  var existing=$('#badgeRewardNotice');
  if(!pending.length){if(existing)existing.remove();return;}
  var app=document.querySelector('.app');
  if(!app)return;
  var notice=existing;
  if(!notice){
    notice=document.createElement('aside');
    notice.id='badgeRewardNotice';
    notice.className='badge-reward-notice';
    notice.setAttribute('role','status');
    notice.setAttribute('aria-live','polite');
    notice.innerHTML='<div class="badge-reward-copy"><strong>バッジをゲット！</strong><span class="badge-reward-count"></span></div><div class="badge-reward-items"></div><div class="badge-reward-actions"><button type="button" class="btn badge-reward-view">コレクションを見る</button><button type="button" class="btn secondary badge-reward-close">閉じる</button></div>';
    var header=app.querySelector('header');
    if(header&&header.parentNode===app)header.insertAdjacentElement('afterend',notice);
    else app.insertBefore(notice,app.firstChild);
    notice.querySelector('.badge-reward-close').addEventListener('click',clearBadgeNotice);
    notice.querySelector('.badge-reward-view').addEventListener('click',function(){
      clearBadgeNotice();
      var collection=$('#badgeCollection');
      if(collection){
        collection.open=true;
        collection.scrollIntoView({behavior:'smooth',block:'start'});
      }else{
        window.location.href='index.html#badgeCollection';
      }
    });
  }
  notice.querySelector('.badge-reward-count').textContent=pending.length+'個の新しいバッジを獲得したよ。';
  var items=notice.querySelector('.badge-reward-items');
  items.textContent='';
  pending.slice(0,6).forEach(function(id){
    var badge=badgeById[id];
    var item=document.createElement('div');
    item.className='badge-reward-item';
    var img=document.createElement('img');
    img.src=badge.image;img.alt=badge.name;img.loading='lazy';
    var label=document.createElement('span');label.textContent=badge.name;
    item.appendChild(img);item.appendChild(label);items.appendChild(item);
  });
  if(pending.length>6){
    var more=document.createElement('span');
    more.className='badge-reward-more';more.textContent='ほか '+(pending.length-6)+' 個';
    items.appendChild(more);
  }
}
function awardBadge(id,notify){
  var badge=badgeById[id];
  if(!badge||fallbackAwardedBadges.has(id))return false;
  fallbackAwardedBadges.add(id);
  writeStored(badgeStoreKey,Array.from(fallbackAwardedBadges));
  if(notify!==false)queueBadgeNotice(id);
  if(badgeManager){
    try{if(!badgeManager.has(id))badgeManager.award(id);}catch(error){/* localStorage側の保存でもコレクションを維持する */}
  }else if(typeof CustomEvent==='function'){
    document.dispatchEvent(new CustomEvent('edu:badge',{detail:{id:id,badge:badge,awardedCount:fallbackAwardedBadges.size}}));
  }
  dispatchBadgeChange();
  if(notify!==false)showBadgeRewardNotice();
  return true;
}
var badgeThresholds={
  judge:[{count:1,id:'judge-first'},{count:3,id:'judge-three'},{count:6,id:'judge-six'}],
  draw:[{count:1,id:'draw-first'},{count:4,id:'draw-four'},{count:8,id:'draw-eight'}],
  scale:[{count:1,id:'scale-first'},{count:4,id:'scale-four'},{count:8,id:'scale-eight'},{count:12,id:'scale-twelve'}]
};
function recordCorrectAnswer(moduleId,taskId){
  if(moduleIds.indexOf(moduleId)===-1||taskId===undefined||taskId===null)return false;
  var data=readStored(correctAnswerStoreKey,{});
  if(!data||typeof data!=='object'||Array.isArray(data))data={};
  var list=Array.isArray(data[moduleId])?data[moduleId].slice():[];
  var key=String(taskId);
  if(list.indexOf(key)!==-1)return false;
  list.push(key);data[moduleId]=list;
  writeStored(correctAnswerStoreKey,data);
  var total=moduleIds.reduce(function(count,id){return count+(Array.isArray(data[id])?data[id].length:0);},0);
  if(total===1)awardBadge('first-correct',true);
  (badgeThresholds[moduleId]||[]).forEach(function(rule){
    if(list.length>=rule.count)awardBadge(rule.id,true);
  });
  return true;
}
var missionBadges={explore:'mission-explore',judge:'mission-judge',draw:'mission-draw',scale:'mission-scale'};
var missionMilestones=[
  {count:1,id:'first-mission'},
  {count:2,id:'second-mission'},
  {count:3,id:'third-mission'},
  {count:4,id:'all-missions'}
];
function isModuleCompleted(id){
  return completedThisSession.has(id)||persistedCompleted.has(id)||(learningProgress&&learningProgress.isCompleted(id));
}
function syncHistoricalBadges(notify){
  var completed=moduleIds.filter(isModuleCompleted);
  completed.forEach(function(id){if(missionBadges[id])awardBadge(missionBadges[id],notify);});
  if(completed.indexOf('explore')!==-1)awardBadge('classification',notify);
  missionMilestones.forEach(function(rule){if(completed.length>=rule.count)awardBadge(rule.id,notify);});
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
  if(moduleIds.indexOf(id)===-1)return;
  completedThisSession.add(id);persistedCompleted.add(id);writeStored(progressStoreKey,Array.from(persistedCompleted));
  if(learningProgress)learningProgress.complete(id);
  syncHistoricalBadges(true);
  renderProgress();
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
window.TTSenseiApp={$: $, $: $, shuffle:shuffle, setGuide:setGuide, awardOnce:awardOnce, addScore:addScore, markModuleComplete:markModuleComplete, renderProgress:renderProgress, areAllMissionsDone:areAllMissionsDone, readStored:readStored, awardBadge:awardBadge, recordCorrectAnswer:recordCorrectAnswer, getBadgeDefinitions:getBadgeDefinitions, getAwardedBadgeIds:getAwardedBadgeIds, hasBadge:hasBadge};
renderProgress();
syncHistoricalBadges(false);
showBadgeRewardNotice();
import('https://tt-sensei.github.io/edu-components/index.js').then(function(module){
  var storage=new module.StorageManager('kakudai-syukusyo');
  learningProgress=new module.ProgressManager({storage:storage,ids:moduleIds});
  badgeManager=new module.BadgeManager({storage:storage,storageKey:'badges',badges:badgeDefinitions,eventTarget:document});
  badgeManager.getAwarded().forEach(function(id){if(badgeById[id])fallbackAwardedBadges.add(id);});
  writeStored(badgeStoreKey,Array.from(fallbackAwardedBadges));
  fallbackAwardedBadges.forEach(function(id){if(!badgeManager.has(id))badgeManager.award(id);});
  moduleIds.forEach(function(id){if(learningProgress.isCompleted(id))persistedCompleted.add(id);});
  writeStored(progressStoreKey,Array.from(persistedCompleted));
  completedThisSession.forEach(function(id){learningProgress.complete(id);});
  persistedCompleted.forEach(function(id){learningProgress.complete(id);});
  syncHistoricalBadges(false);
  renderProgress();
  dispatchBadgeChange();
  showBadgeRewardNotice();
}).catch(function(){renderProgress();});
})();
