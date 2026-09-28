(function(){
'use strict';

/* ---------- sample catalog built from lexasport.com sports and fabrics ---------- */
var SPORT_CODE={Soccer:'SOC',Baseball:'BSB',Basketball:'BKB',Hats:'HAT'};
var PLAN=[
  ['Soccer','Jersey','JRS',['Cool Dry','to90','Striped','Recycled Cool Dry']],
  ['Soccer','Shorts','SHT',['Cool Dry','Butterfly Mesh']],
  ['Soccer','Goalkeeper Jersey','GKJ',['Waffle','Cool Dry']],
  ['Baseball','Jersey','JRS',['Cool Dry','Waffle','Striped']],
  ['Baseball','Pants','PNT',['Cool Dry','Recycled Cool Dry']],
  ['Basketball','Jersey','JRS',['Butterfly Mesh','Waffle','Cool Dry']],
  ['Basketball','Shorts','SHT',['Butterfly Mesh','Cool Dry']],
  ['Basketball','Shooting Shirt','SHS',['Cool Dry','Recycled Cool Dry']],
  ['Hats','Snapback','SNP',['Structured','Mesh Back']],
  ['Hats','Trucker','TRK',['Mesh Back']],
  ['Hats','Beanie','BNE',['Knit']]
];
var FAB_CODE={'Cool Dry':'CD','to90':'T9','Striped':'ST','Recycled Cool Dry':'RC','Butterfly Mesh':'BM','Waffle':'WF','Structured':'SR','Mesh Back':'MB','Knit':'KN'};
var FIELDS=[['info','Info','LEXA team'],['img','Images','LEXA team'],['cad','CAD','CAD designer'],['size','Size chart','Factory'],['spec','Factory check','Factory']];
var ORDER=['missing','requested','progress','done'];
var LABEL={missing:'Missing',requested:'Requested',progress:'In progress',done:'Done'};
/* names as they might exist today, before the naming pass */
var MESSY={'SOC-JRS-T9-01':'soccer jersey to90','SOC-JRS-ST-01':'Soccer Jersey - T090 Striped','BSB-JRS-CD-01':'Baseball Jersey - Cool dry','BKB-SHT-BM-01':'Basketball Shorts Butterfly mesh','BKB-JRS-WF-01':'BASKETBALL JERSEY - WAFFLE','HAT-SNP-SR-01':'Hats Snapback - Structured'};

var seed=7;function rnd(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646}
function pickStatus(bias){var r=rnd()+bias;return r>1.05?'done':r>.8?'progress':r>.6?'requested':r>.35?'missing':'done'}

function build(){
  seed=7;var list=[];
  PLAN.forEach(function(p){p[3].forEach(function(f){
    var sku=SPORT_CODE[p[0]]+'-'+p[2]+'-'+FAB_CODE[f]+'-01';
    var std=p[0]+' '+p[1]+' - '+f;
    var s={sku:sku,sport:p[0],garment:p[1],fabric:f,std:std,name:MESSY[sku]||std,live:false,st:{},since:{}};
    FIELDS.forEach(function(fd,i){var b=[.25,.1,-.15,-.05,0][i];var v=pickStatus(b);s.st[fd[0]]=v;if(v==='requested')s.since[fd[0]]=1+Math.floor(rnd()*6)});
    list.push(s);
  })});
  /* a few fully complete, some already live */
  ['SOC-JRS-CD-01','BSB-PNT-CD-01','BKB-SHT-CD-01','HAT-TRK-MB-01','SOC-SHT-CD-01'].forEach(function(k,i){
    var s=find(list,k);FIELDS.forEach(function(fd){s.st[fd[0]]='done'});s.since={};s.name=s.std;if(i<3)s.live=true});
  return list;
}
function find(list,sku){for(var i=0;i<list.length;i++)if(list[i].sku===sku)return list[i]}
var SKUS=build();

function $(s){return document.querySelector(s)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function doneCount(s){return FIELDS.filter(function(f){return s.st[f[0]]==='done'}).length}
function ready(s){return doneCount(s)===FIELDS.length}
function toast(t){var el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(function(){el.classList.remove('show')},2200)}
var flashSku=null;

/* ---------- summary ---------- */
function renderSummary(){
  var total=SKUS.length,rd=SKUS.filter(ready).length,live=SKUS.filter(function(s){return s.live}).length;
  var miss={cad:0,size:0,img:0};SKUS.forEach(function(s){['cad','size','img'].forEach(function(k){if(s.st[k]!=='done')miss[k]++})});
  var h='<div class="overall"><b>'+rd+' of '+total+' SKUs ready</b><p>'+live+' live on Shopify. Still open: '+miss.cad+' CAD drawings, '+miss.size+' size charts, '+miss.img+' image sets.</p></div><div class="bars">';
  Object.keys(SPORT_CODE).forEach(function(sp){var g=SKUS.filter(function(s){return s.sport===sp}),r=g.filter(ready).length;
    h+='<div class="bar"><span>'+sp+'<b>'+r+'/'+g.length+'</b></span><div class="track"><i style="width:'+(r/g.length*100)+'%"></i></div></div>'});
  $('#summary').innerHTML=h+'</div>';
}

/* ---------- table ---------- */
function filtered(){
  var q=$('#q').value.trim().toLowerCase(),sp=$('#fSport').value,sh=$('#fShow').value;
  return SKUS.filter(function(s){
    if(q&&(s.sku+' '+s.name).toLowerCase().indexOf(q)<0)return false;
    if(sp&&s.sport!==sp)return false;
    if(sh==='notready'&&ready(s))return false;
    if(sh==='ready'&&!(ready(s)&&!s.live))return false;
    if(sh==='live'&&!s.live)return false;
    if(sh==='cad'&&s.st.cad==='done')return false;
    if(sh==='size'&&s.st.size==='done')return false;
    if(sh==='img'&&s.st.img==='done')return false;
    return true;
  });
}
function renderRows(){
  var list=filtered(),h='';
  list.forEach(function(s){
    var named=s.name===s.std;
    h+='<tr data-sku="'+s.sku+'"'+(flashSku===s.sku?' class="flash"':'')+'><td class="prod"><b>'+esc(s.name)+'</b><small>'+s.sku+(named?'':' <em>name needs fixing</em>')+'</small><button class="link" data-preview="'+s.sku+'">Customer preview</button></td>';
    FIELDS.forEach(function(f){var v=s.st[f[0]];
      var lab=LABEL[v]+(v==='requested'&&s.since[f[0]]?' '+s.since[f[0]]+'d':'');
      h+='<td><button class="st s-'+v+'" data-cell="'+s.sku+'|'+f[0]+'" aria-label="'+f[1]+': '+LABEL[v]+'. Click to change.">'+lab+'</button></td>'});
    var n=doneCount(s),state;
    if(s.live)state='<span class="state live">Live</span>';
    else if(n===FIELDS.length)state='<button class="btn sm pri" data-publish="'+s.sku+'">Publish</button>';
    else state='<span class="state part">'+n+' of 5</span>';
    h+='<td>'+state+'</td></tr>';
  });
  $('#rows').innerHTML=h;
  $('#empty').hidden=list.length>0;
  flashSku=null;
}

/* ---------- follow-ups ---------- */
var OWNERS=['CAD designer','Factory','LEXA team'];
function ownerItems(o){
  var items=[];
  SKUS.forEach(function(s){FIELDS.forEach(function(f){if(f[2]===o&&s.st[f[0]]!=='done')items.push({s:s,f:f,v:s.st[f[0]],d:s.since[f[0]]||0})})});
  return items;
}
function message(o,items){
  var open=items.filter(function(i){return i.v==='missing'||i.v==='requested'});
  var byType={};open.forEach(function(i){(byType[i.f[1]]=byType[i.f[1]]||[]).push(i.s.sku+'  '+i.s.std)});
  var greet={'CAD designer':'Hi, quick update on the CAD queue.','Factory':'Hello, we need a few specs confirmed for the catalog.','LEXA team':'Quick catalog update, a few items need your input.'}[o];
  var t=greet+'\n';
  Object.keys(byType).forEach(function(k){t+='\n'+k+' ('+byType[k].length+'):\n'+byType[k].map(function(x){return '- '+x}).join('\n')+'\n'});
  t+='\nCould you send these by Friday? Anything you can share earlier helps, and I can take partial batches.\n\nThanks,\nJosinaldo';
  return t;
}
function renderFollow(){
  var h='';
  OWNERS.forEach(function(o){
    var items=ownerItems(o);
    var missing=items.filter(function(i){return i.v==='missing'}).length;
    var due=items.filter(function(i){return i.v==='requested'&&i.d>=3}).length;
    var waiting=items.filter(function(i){return i.v==='requested'||i.v==='progress'}).length;
    h+='<div class="owner"><div class="row"><b>'+o+'</b><span class="cnt">'+items.length+' open</span></div>';
    if(!items.length){h+='<p class="allclear">Nothing waiting on '+o.toLowerCase()+'.</p></div>';return}
    h+='<div class="cnt">'+missing+' not yet requested, '+waiting+' in their hands'+(due?', <span class="due">'+due+' due for a follow-up</span>':'')+'</div>';
    h+='<div class="acts">'+(missing?'<button class="btn sm" data-request="'+o+'">Request '+missing+' missing</button>':'')+'<button class="btn sm" data-copy="'+o+'">Copy follow-up</button></div>';
    h+='<details><summary>Preview message</summary><pre>'+esc(message(o,items))+'</pre></details></div>';
  });
  $('#follow').innerHTML=h;
}

/* ---------- naming ---------- */
function renderNaming(){
  var bad=SKUS.filter(function(s){return s.name!==s.std});
  if(!bad.length){$('#naming').innerHTML='<p class="allclear">Every product name follows the standard.</p>';return}
  var h=bad.map(function(s){return '<div class="issue"><s>'+esc(s.name)+'</s><div>'+esc(s.std)+'</div><button class="btn sm" data-rename="'+s.sku+'">Apply name</button></div>'}).join('');
  h+='<div class="issue"><button class="btn sm pri" id="renameAll">Apply all '+bad.length+'</button></div>';
  $('#naming').innerHTML=h;
}

/* ---------- preview drawer ---------- */
function flat(g){
  var stroke='stroke="#202124" stroke-width="2" fill="#fff" stroke-linejoin="round"';
  if(/Shorts|Pants/.test(g)){
    return g==='Pants'
      ?'<svg viewBox="0 0 120 120"><path d="M36 12h48l6 100H68L60 44l-8 68H30z" '+stroke+'/><path d="M36 20h48" stroke="#202124" stroke-width="2"/></svg>'
      :'<svg viewBox="0 0 120 120"><path d="M28 24h64l8 62H66l-6-20-6 20H20z" '+stroke+'/><path d="M28 32h64" stroke="#202124" stroke-width="2"/></svg>';
  }
  if(/Snapback|Trucker/.test(g))return '<svg viewBox="0 0 120 120"><path d="M24 72c0-26 16-40 36-40s36 14 36 40z" '+stroke+'/><path d="M24 72h84c-6 8-24 10-44 8" '+stroke+'/><path d="M60 32v40" stroke="#202124" stroke-width="1.5"/></svg>';
  if(g==='Beanie')return '<svg viewBox="0 0 120 120"><path d="M30 78c0-30 12-46 30-46s30 16 30 46z" '+stroke+'/><rect x="26" y="74" width="68" height="16" rx="3" '+stroke+'/><circle cx="60" cy="27" r="6" '+stroke+'/></svg>';
  var tank=g==='Tank';
  var body=tank?'M42 14c4 8 32 8 36 0l8 4c-4 10-4 20 4 28v62H30V46c8-8 8-18 4-28z':'M44 16c4 6 28 6 32 0l14 8v84H30V24z';
  var sleeves=tank?'':'<path d="M30 24L12 40l10 14 8-6" '+stroke+'/><path d="M90 24l18 16-10 14-8-6" '+stroke+'/>';
  return '<svg viewBox="0 0 120 120"><path d="'+body+'" '+stroke+'/>'+sleeves+'<path d="'+(tank?'M42 14c4 12 32 12 36 0':'M44 16c4 10 28 10 32 0')+'" fill="none" stroke="#202124" stroke-width="2"/></svg>';
}
var SIZES=[['S','19','27'],['M','20','28'],['L','21.5','29'],['XL','23','30'],['2XL','24.5','31']];
function openPreview(sku){
  var s=find(SKUS,sku),h='<div class="dbg" id="dbg"><div class="drawer" role="dialog" aria-modal="true" aria-label="Customer preview">';
  h+='<div class="dhead"><div><h2>'+esc(s.name)+'</h2><small>'+s.sku+'</small></div><button class="x" id="dclose" aria-label="Close preview">×</button></div>';
  h+='<p class="dnote">How this product would look to a customer right now. Anything dashed is still missing.</p>';
  h+='<div class="media">'+(s.st.img==='done'?'<div class="slot">Product photos<br>front, back, detail</div>':'<div class="slot gap">Photos missing<br>'+LABEL[s.st.img].toLowerCase()+'</div>')+
     (s.st.cad==='done'?'<div class="slot">'+flat(s.sport==='Basketball'&&s.garment==='Jersey'?'Tank':s.garment)+'</div>':'<div class="slot gap">CAD drawing missing<br>'+LABEL[s.st.cad].toLowerCase()+' with designer</div>')+'</div>';
  h+='<div class="dsec"><h3>Fabric</h3><p style="margin:0;font-size:14px">'+esc(s.fabric)+'</p></div>';
  h+='<div class="dsec"><h3>Size chart</h3>';
  if(s.st.size==='done'&&s.sport!=='Hats')h+='<table class="size"><thead><tr><th>Size</th><th>Chest width (in)</th><th>Length (in)</th></tr></thead><tbody>'+SIZES.map(function(r){return '<tr><td>'+r[0]+'</td><td>'+r[1]+'</td><td>'+r[2]+'</td></tr>'}).join('')+'</tbody></table><p class="dnote" style="margin-top:6px">Sample measurements for the demo only.</p>';
  else if(s.st.size==='done')h+='<p style="margin:0;font-size:14px">One size, adjustable. Confirmed by factory.</p>';
  else h+='<div class="gapline">Size chart missing: '+LABEL[s.st.size].toLowerCase()+' with the factory. Customers can\'t pick a size confidently without it.</div>';
  h+='</div><div class="dsec"><h3>Launch checklist</h3><ul class="checks">';
  FIELDS.forEach(function(f){var ok=s.st[f[0]]==='done';h+='<li><span>'+f[1]+'</span><span class="'+(ok?'ok':'no')+'">'+(ok?'Done':LABEL[s.st[f[0]]])+'</span></li>'});
  var nm=s.name===s.std;h+='<li><span>Product name</span><span class="'+(nm?'ok':'no')+'">'+(nm?'Standard':'Needs fixing')+'</span></li></ul></div>';
  h+='</div></div>';
  $('#drawer').innerHTML=h;
  $('#dclose').focus();
}
function closePreview(){$('#drawer').innerHTML=''}

/* ---------- export ---------- */
function exportCSV(){
  var list=SKUS.filter(ready);
  if(!list.length){toast('No SKUs are ready yet. Finish all five items on a row first.');return}
  var rows=[['Handle','Title','Vendor','Type','Tags','Variant SKU','Published','Status']];
  list.forEach(function(s){rows.push([s.std.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),s.std,'LEXA Sport',s.garment,s.sport+', '+s.fabric,s.sku,s.live?'TRUE':'FALSE',s.live?'active':'draft'])});
  var csv=rows.map(function(r){return r.map(function(c){return '"'+String(c).replace(/"/g,'""')+'"'}).join(',')}).join('\n');
  var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='lexa-shopify-ready.csv';
  document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500);
  toast('Exported '+list.length+' ready SKUs');
}

function renderAll(){renderSummary();renderRows();renderFollow();renderNaming()}

/* ---------- events ---------- */
document.addEventListener('click',function(e){
  if(e.target.id==='dbg'){closePreview();return}
  var t=e.target.closest('button');if(!t)return;var d=t.dataset;
  if(d.page){showPage(d.page);return}
  if(d.cell){var p=d.cell.split('|'),s=find(SKUS,p[0]),v=s.st[p[1]],n=ORDER[(ORDER.indexOf(v)+1)%ORDER.length];
    s.st[p[1]]=n;if(n==='requested')s.since[p[1]]=0;else delete s.since[p[1]];
    if(n!=='done')s.live=false;
    if(ready(s))toast(s.sku+' is ready to publish');
    renderAll();return}
  if(d.publish){var s2=find(SKUS,d.publish);s2.live=true;flashSku=s2.sku;toast(s2.std+' published');renderAll();return}
  if(d.preview){openPreview(d.preview);return}
  if(t.id==='dclose'){closePreview();return}
  if(d.request){var c=0;SKUS.forEach(function(s){FIELDS.forEach(function(f){if(f[2]===d.request&&s.st[f[0]]==='missing'){s.st[f[0]]='requested';s.since[f[0]]=0;c++}})});toast('Requested '+c+' items from '+d.request.toLowerCase());renderAll();return}
  if(d.copy){var txt=message(d.copy,ownerItems(d.copy));
    (navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(function(){toast('Follow-up copied')},function(){toast('Open "Preview message" to copy it')});return}
  if(d.rename){var r=find(SKUS,d.rename);r.name=r.std;flashSku=r.sku;toast('Renamed '+r.sku);renderAll();return}
  if(t.id==='renameAll'){var k=0;SKUS.forEach(function(s){if(s.name!==s.std){s.name=s.std;k++}});toast('Renamed '+k+' products');renderAll();return}
  if(t.id==='export'){exportCSV();return}
});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&$('#dbg'))closePreview()});
['#q','#fSport','#fShow'].forEach(function(id){$(id).addEventListener('input',renderRows)});

/* ---------- tabs ---------- */
function showPage(p){
  ['tracker','plan','audit'].forEach(function(id){$('#'+id).hidden=id!==p;document.querySelector('[data-page="'+id+'"]').setAttribute('aria-selected',String(id===p))});
  try{history.replaceState(null,'','#'+p)}catch(err){}
  window.scrollTo(0,0);
}
document.querySelector('.tabs').addEventListener('keydown',function(e){
  if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;
  var tabs=[].slice.call(this.querySelectorAll('[role=tab]')),i=tabs.indexOf(document.activeElement);if(i<0)return;
  var n=tabs[(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length];n.focus();n.click();
});

Object.keys(SPORT_CODE).forEach(function(sp){var o=document.createElement('option');o.value=sp;o.textContent=sp;$('#fSport').appendChild(o)});
renderAll();
var h=(location.hash||'').slice(1);if(h==='plan'||h==='audit')showPage(h);
})();
