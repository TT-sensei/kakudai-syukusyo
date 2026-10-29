(function(){
'use strict';
var $=window.TTSenseiApp.$,App=window.TTSenseiApp;
var query=new URLSearchParams(window.location.search);
if(query.get('complete')==='scale'){
  var notice=$('#homeNotice');
  if(notice){var done=App.areAllMissionsDone();notice.hidden=false;App.setGuide(notice,done?'4つのミッション達成！':'縮尺ミッション達成！',done?'形を見つけ、見分け、作図し、くらしの場面で使うところまで取り組めたね。':'縮尺をくらしの中で使えたね。気になるミッションを選んで、さらに練習しよう。','correct','good');}
}
function renderBadgeCollection(){
  var grid=$('#badgeGrid'),countLabel=$('#badgeCount'),progress=$('#badgeProgressFill'),track=$('#badgeProgressTrack');
  if(!grid||!App.getBadgeDefinitions||!App.getAwardedBadgeIds)return;
  var definitions=App.getBadgeDefinitions(),awarded=new Set(App.getAwardedBadgeIds());
  var count=definitions.filter(function(badge){return awarded.has(badge.id);}).length;
  if(countLabel)countLabel.textContent='獲得 '+count+' / '+definitions.length;
  if(progress)progress.style.width=(definitions.length?count/definitions.length*100:0)+'%';
  if(track)track.setAttribute('aria-valuenow',String(count));
  grid.innerHTML=definitions.map(function(badge){
    var earned=awarded.has(badge.id);
    return '<article class="badge-item '+(earned?'is-earned':'is-locked')+'">'+
      '<img src="'+badge.image+'" alt="'+badge.name+'" loading="lazy">'+
      '<strong>'+badge.name+'</strong>'+
      '<p>'+badge.description+'</p>'+
      '<span class="badge-status">'+(earned?'✓ 獲得':'未獲得')+'</span>'+
      '</article>';
  }).join('');
}
document.addEventListener('tt:badgeschange',renderBadgeCollection);
renderBadgeCollection();
if(window.location.hash==='#badgeCollection'){
  var collection=$('#badgeCollection');
  if(collection){collection.open=true;collection.scrollIntoView({block:'start'});}
}
})();