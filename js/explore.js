(function(){
'use strict';
var $=window.TTSenseiApp.$, $$=window.TTSenseiApp.$$, setGuide=window.TTSenseiApp.setGuide, awardOnce=window.TTSenseiApp.awardOnce, markModuleComplete=window.TTSenseiApp.markModuleComplete;
var shapes = [
 {id:'isosceles',name:'二等辺三角形',ok:false,svg:'<polygon points="18,79 50,20 82,79"/><polygon points="110,79 131,48 162,79"/>',why:'二等辺三角形は、頂角の大きさがちがうものがあります。2本の辺が等しいだけでは、形は1つに決まりません。'},
 {id:'equilateral',name:'正三角形',ok:true,svg:'<polygon points="18,80 50,24 82,80"/><polygon points="112,80 130,49 148,80"/>',why:'正三角形は、どれも角が60°です。辺の割合もそろうので、同じ正三角形どうしは、いつでも拡大図・縮図になります。'},
 {id:'rectangle',name:'長方形',ok:false,svg:'<rect x="15" y="31" width="48" height="39"/><rect x="103" y="40" width="62" height="30"/>',why:'長方形の角は全部90°ですが、たてと横の割合がちがうものがあります。角だけが同じでも、拡大図・縮図とは限りません。'},
 {id:'square',name:'正方形',ok:true,svg:'<rect x="20" y="20" width="61" height="61"/><rect x="112" y="39" width="42" height="42"/>',why:'正方形は角が全部90°で、4辺もすべて等しい図形です。同じ正方形どうしは、いつでも拡大図・縮図になります。'},
 {id:'rhombus',name:'ひし形',ok:false,svg:'<polygon points="18,51 50,19 82,51 50,83"/><polygon points="108,51 137,13 166,51 137,89"/>',why:'ひし形は4辺がすべて等しい図形ですが、角の大きさがちがうものがあります。辺が等しいだけでは、同じ形とは限りません。'},
 {id:'pentagon',name:'正五角形',ok:true,svg:'<polygon points="50,13 82,36 70,74 30,74 18,36"/><polygon points="137,33 158,48 150,73 124,73 116,48"/>',why:'正五角形は、5辺も5つの角もそれぞれ等しい図形です。同じ正五角形どうしは、いつでも拡大図・縮図になります。'},
 {id:'circle',name:'円',ok:true,svg:'<circle cx="48" cy="51" r="33"/><circle cx="137" cy="51" r="21"/>',why:'円は大きさがちがっても形は同じです。どの円どうしも、拡大図・縮図の関係になります。'}
];
var exploreSelection = {};
var exploreAwarded = false;
var inspectIndex = 0;
function shapeSvg(markup){return '<svg viewBox="0 0 180 100" aria-hidden="true"><g fill="rgba(8,126,139,.12)" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round">'+markup+'</g></svg>';}
function renderShapes(){
  $('#shapeGrid').innerHTML = shapes.map(function(shape){
    var selected = !!exploreSelection[shape.id];
    return '<button type="button" class="shape-card'+(selected?' selected':'')+'" data-shape="'+shape.id+'" aria-pressed="'+selected+'"><span class="mark"></span>'+shapeSvg(shape.svg)+'<strong>'+shape.name+'</strong></button>';
  }).join('');
  $$('.shape-card').forEach(function(button){
    button.addEventListener('click',function(){
      var id = button.dataset.shape;
      exploreSelection[id] = !exploreSelection[id];
      if(!exploreSelection[id]) delete exploreSelection[id];
      renderShapes();
    });
  });
}
function showInspect(){
  var shape = shapes[inspectIndex];
  $('#inspectTitle').textContent = '調べる：'+shape.name;
  $('#inspectVisual').innerHTML = shapeSvg(shape.svg);
  $('#inspectText').innerHTML = '<strong>'+(shape.ok?'〇 いつでもなる':'△ いつでもとは限らない')+'</strong>'+shape.why;
  $('#inspectPrev').disabled = inspectIndex===0;
  $('#inspectNext').textContent = inspectIndex===shapes.length-1?'見分けるへ進む':'次の図形 →';
}
$('#exploreCheck').addEventListener('click',function(){
  var correct = shapes.filter(function(shape){return shape.ok;}).map(function(shape){return shape.id;});
  var selected = Object.keys(exploreSelection).filter(function(id){return exploreSelection[id];});
  var good = correct.every(function(id){return selected.indexOf(id)!==-1;}) && selected.every(function(id){return correct.indexOf(id)!==-1;});
  renderShapes();
  $$('.shape-card').forEach(function(button){
    var shape = shapes.filter(function(item){return item.id===button.dataset.shape;})[0];
    var mark = button.querySelector('.mark');
    if(shape.ok){button.classList.add('correct');mark.textContent='〇';}
    else if(exploreSelection[shape.id]){button.classList.add('wrong');mark.textContent='×';}
  });
  if(good){
    window.TTSenseiApp.recordCorrectAnswer('explore','shape-classification');
    markModuleComplete('explore');
    if(!exploreAwarded){awardOnce('explore-perfect',20);exploreAwarded=true;}
    setGuide($('#exploreMsg'),'大正解！','正三角形・正方形・正五角形・円だよ。どこが共通しているか、一つずつ調べよう。','correct','good');
  }else{
    setGuide($('#exploreMsg'),'もう一度考えよう','「同じ名前なら、どんな形でも必ず」という言葉が大切。選んだ図形と、選ばなかった図形を比べてみよう。','retry','retry');
  }
  inspectIndex=0;$('#inspectCard').hidden=false;showInspect();
});
$('#exploreReset').addEventListener('click',function(){
  exploreSelection={};$('#inspectCard').hidden=true;renderShapes();
  setGuide($('#exploreMsg'),'見つけるポイント','角の大きさと、辺の長さの割合に注目しよう。','hint');
});
$('#inspectPrev').addEventListener('click',function(){inspectIndex=Math.max(0,inspectIndex-1);showInspect();});
$('#inspectNext').addEventListener('click',function(){
  if(inspectIndex<shapes.length-1){inspectIndex++;showInspect();}
  else{window.location.href='judge.html';}
});
renderShapes();
})();
