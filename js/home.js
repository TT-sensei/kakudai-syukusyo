(function(){
'use strict';
var $=window.TTSenseiApp.$,App=window.TTSenseiApp;
var query=new URLSearchParams(window.location.search);
if(query.get('complete')==='scale'){
  var notice=$('#homeNotice');
  if(notice){var done=App.areAllMissionsDone();notice.hidden=false;App.setGuide(notice,done?'4つのミッション達成！':'縮尺ミッション達成！',done?'形を見つけ、見分け、作図し、くらしの場面で使うところまで取り組めたね。':'縮尺をくらしの中で使えたね。気になるミッションを選んで、さらに練習しよう。','correct','good');}
}
})();
