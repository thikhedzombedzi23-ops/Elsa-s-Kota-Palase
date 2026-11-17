
var STORE_NAME = "Elsa's Kota Palace";
var WHATSAPP_NUMBER = "27774422100"; 
var CURRENCY = "R";

//PRODUCTS FROM GOOGLE SHEET
var SHEET_CSV_URL = "";

//DELIVERY FEES BY AREA
var DELIVERY_AREAS = [
  {name: "Tshamakhwitha", fee: 20},
  {name: "Thondoni", fee: 15},
  {name: "Masana", fee: 20},
  {name: "New Stance", fee: 20},
  {name: "Fhasi ha bada", fee: 25},
  {name: "Other places out of Muswodi",fee:0} 
];
var FREE_DELIVERY_OVER = 300; 

// 3) PAYMENT OPTIONS 
var PAYMENT_OPTIONS = [
  {id: "cash", label: "Cash", info: "Pay when you collect or when it's delivered."},
  {id: "eft", label: "EFT", info: "Bank: Your Bank\nAccount name: Your Business\nAccount no: 0000000000\nBranch code: 000000\nReference: your name\nSend proof of payment on WhatsApp."},
];

// 4) PRIVACY ON SHARED PHONES/TABLETS
var IDLE_MINUTES = 3;

// Backup product list 
var PRODUCTS = [
  {id:1,name:"Fresh bread loaf",price:22,cat:"Bakery",emoji:"🍞",desc:"Baked this morning."},
  {id:2,name:"Butter croissant",price:18,cat:"Bakery",emoji:"🥐",desc:"Flaky and golden."},
  {id:3,name:"Chocolate muffin",price:20,cat:"Bakery",emoji:"🧁",desc:"Double chocolate."},
  {id:4,name:"Free-range eggs (12)",price:48,cat:"Groceries",emoji:"🥚",desc:"Farm fresh."},
  {id:5,name:"Full-cream milk 2L",price:36,cat:"Groceries",emoji:"🥛",desc:"Cold and local."},
  {id:6,name:"Bananas (1kg)",price:25,cat:"Groceries",emoji:"🍌",desc:"Ripe and sweet."},
  {id:7,name:"Iced coffee",price:32,cat:"Drinks",emoji:"🧋",desc:"Slow-brewed, over ice."},
  {id:8,name:"Orange juice 500ml",price:24,cat:"Drinks",emoji:"🍊",desc:"Squeezed, no sugar added."}
];
// ======================================================

var cart = {}, cat = "All", KEY = "wa-store-cart", lastOrder = null, corrected = false, idleTimer = null;
var $ = function(id){return document.getElementById(id)};
function money(n){return CURRENCY + n.toFixed(2)}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function load(){try{var s=sessionStorage.getItem(KEY);if(s)cart=JSON.parse(s)||{}}catch(e){cart={}}}
function save(){try{sessionStorage.setItem(KEY,JSON.stringify(cart))}catch(e){}}
function find(id){return PRODUCTS.filter(function(p){return String(p.id)===String(id)})[0]}
function mode(){return document.querySelector("input[name=mode]:checked").value}
function payOpt(){var r=document.querySelector("input[name=pay]:checked");return PAYMENT_OPTIONS.filter(function(o){return r&&o.id===r.value})[0]||PAYMENT_OPTIONS[0]}

// ---------- Google Sheet products ----------
function parseCSV(t){
  var rows=[],row=[],f="",q=false;
  for(var i=0;i<t.length;i++){
    var c=t[i];
    if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i++}else q=false}else f+=c}
    else if(c==='"')q=true;
    else if(c===','){row.push(f);f=""}
    else if(c==='\n'||c==='\r'){if(c==='\r'&&t[i+1]==='\n')i++;row.push(f);rows.push(row);row=[];f=""}
    else f+=c;
  }
  if(f!==""||row.length){row.push(f);rows.push(row)}
  return rows;
}
function loadSheet(){
  if(!SHEET_CSV_URL)return Promise.resolve();
  $("status").textContent="Loading products…";
  return fetch(SHEET_CSV_URL+(SHEET_CSV_URL.indexOf("?")<0?"?":"&")+"t="+Date.now())
    .then(function(r){if(!r.ok)throw new Error("bad response");return r.text()})
    .then(function(t){
      var rows=parseCSV(t).filter(function(r){return r.join("").trim()});
      var h=rows.shift().map(function(x){return x.trim().toLowerCase()});
      var ix=function(n){return h.indexOf(n)};
      var list=rows.map(function(r,i){
        var price=parseFloat(String(r[ix("price")]||"").replace(/[^0-9.]/g,""));
        return {id:(ix("id")>-1&&r[ix("id")])?r[ix("id")].trim():String(i+1),
          name:(r[ix("name")]||"").trim(),price:price,
          cat:(r[ix("category")]||"Other").trim()||"Other",
          emoji:(r[ix("emoji")]||"🛒").trim()||"🛒",
          desc:(r[ix("description")]||"").trim(),
          off:/^(no|false|sold out|0)$/i.test((r[ix("available")]||"").trim())};
      }).filter(function(p){return p.name&&!isNaN(p.price)&&!p.off});
      if(!list.length)throw new Error("no rows");
      PRODUCTS=list;$("status").textContent="";
    })
    .catch(function(){$("status").textContent="Couldn't load the latest products. Showing our saved list."});
}

// ---------- Rendering ----------
function renderChips(){
  var cats=["All"];PRODUCTS.forEach(function(p){if(cats.indexOf(p.cat)<0)cats.push(p.cat)});
  if(cats.indexOf(cat)<0)cat="All";
  $("chips").innerHTML=cats.map(function(c){return '<button class="chip" data-cat="'+esc(c)+'" aria-pressed="'+(c===cat)+'">'+esc(c)+'</button>'}).join("");
}
function renderGrid(){
  $("grid").innerHTML=PRODUCTS.filter(function(p){return cat==="All"||p.cat===cat}).map(function(p){
    var q=cart[p.id]||0,n=esc(p.name);
    return '<div class="item"><div class="pic" aria-hidden="true">'+esc(p.emoji)+'</div><h3>'+n+'</h3><p>'+esc(p.desc)+'</p><div class="row"><span class="price">'+money(p.price)+'</span>'+
      (q?'<div class="qty"><button data-act="dec" data-id="'+esc(p.id)+'" aria-label="Remove one '+n+'">−</button><span>'+q+'</span><button data-act="inc" data-id="'+esc(p.id)+'" aria-label="Add one '+n+'">+</button></div>'
        :'<button class="btn" data-act="inc" data-id="'+esc(p.id)+'">Add</button>')+'</div></div>';
  }).join("");
}
function totals(){
  var ids=Object.keys(cart).filter(function(i){return cart[i]>0&&find(i)}),sub=0,count=0;
  ids.forEach(function(i){sub+=find(i).price*cart[i];count+=cart[i]});
  var fee=0,free=false,areaName="",deliver=mode()==="Delivery";
  if(deliver){
    var a=DELIVERY_AREAS[$("area").selectedIndex];
    if(a){areaName=a.name;free=FREE_DELIVERY_OVER>0&&sub>=FREE_DELIVERY_OVER;fee=free?0:a.fee}
  }
  return {ids:ids,sub:sub,count:count,fee:fee,free:free,area:areaName,deliver:deliver,total:sub+fee};
}
function renderCart(){
  var t=totals(),h="";
  if(t.ids.length){
    h=t.ids.map(function(i){var p=find(i),q=cart[i];
      return '<div class="line"><div>'+esc(p.name)+'<small>'+q+' × '+money(p.price)+'</small></div><strong>'+money(p.price*q)+'</strong></div>'}).join("");
    if(t.deliver)h+='<div class="line"><div>Delivery'+(t.area?' ('+esc(t.area)+')':'')+'</div>'+(t.free?'<strong class="free">Free</strong>':'<strong>'+money(t.fee)+'</strong>')+'</div>';
    else if(DELIVERY_AREAS.length&&FREE_DELIVERY_OVER>0){}
  }else h='<p class="empty">Nothing here yet. Tap Add on a product.</p>';
  $("lines").innerHTML=h;
  $("total").textContent=money(t.ids.length?t.total:0);
  $("barCount").textContent=t.count+(t.count===1?" item":" items");
  $("barTotal").textContent=money(t.ids.length?t.total:0);
  $("send").disabled=!t.ids.length;
}
function renderAll(){renderGrid();renderCart();save()}

function renderPay(){
  var box=$("payBox");
  if(!PAYMENT_OPTIONS.length){box.hidden=true;return}
  box.hidden=PAYMENT_OPTIONS.length<2&&!PAYMENT_OPTIONS[0].info;
  $("payOpts").innerHTML=PAYMENT_OPTIONS.map(function(o,i){
    return '<label><input type="radio" name="pay" value="'+esc(o.id)+'"'+(i===0?" checked":"")+'>'+esc(o.label)+'</label>'}).join("");
  showPayInfo();
}
function showPayInfo(){
  var o=payOpt(),b=$("payInfo");
  if(!o||(!o.info&&!o.url)){b.hidden=true;return}
  b.hidden=false;
  b.innerHTML=esc(o.info||"")+(o.url?'<br><a href="'+esc(o.url)+'" target="_blank" rel="noopener">Open payment link</a>':"");
}

// ---------- Events ----------
$("chips").addEventListener("click",function(e){var b=e.target.closest(".chip");if(!b)return;cat=b.dataset.cat;renderChips();renderGrid()});
$("grid").addEventListener("click",function(e){
  var b=e.target.closest("button[data-act]");if(!b)return;
  var id=b.dataset.id;cart[id]=(cart[id]||0)+(b.dataset.act==="inc"?1:-1);
  if(cart[id]<=0)delete cart[id];renderAll();
});
document.querySelectorAll("input[name=mode]").forEach(function(r){
  r.addEventListener("change",function(){$("addrBox").hidden=mode()!=="Delivery";renderCart()});
});
$("area").addEventListener("change",renderCart);
$("payOpts").addEventListener("change",showPayInfo);

$("send").addEventListener("click",function(){
  var name=$("name").value.trim(),addr=$("addr").value.trim(),note=$("note").value.trim(),t=totals(),err=$("err");
  err.textContent="";
  if(!t.ids.length){err.textContent="Add at least one product.";return}
  if(!name){err.textContent="Enter your name so we know who the order is for.";$("name").focus();return}
  if(t.deliver&&DELIVERY_AREAS.length&&!addr){err.textContent="Enter your street address, or switch to Collect.";$("addr").focus();return}
  var lines=t.ids.map(function(i){var p=find(i),q=cart[i];return q+" × "+p.name+" – "+money(p.price*q)});
  var msg=(corrected?"*CORRECTED order – "+STORE_NAME+"* (please ignore my earlier order)":"*New order – "+STORE_NAME+"*")+"\n\n"+lines.join("\n")+"\n\nItems: "+money(t.sub);
  if(t.deliver)msg+="\nDelivery ("+t.area+"): "+(t.free?"Free":money(t.fee));
  msg+="\n*Total: "+money(t.total)+"*\n\nName: "+name+"\n"+mode();
  if(t.deliver)msg+="\nArea: "+t.area+"\nAddress: "+addr;
  var po=PAYMENT_OPTIONS.length?payOpt():null;
  if(po)msg+="\nPayment: "+po.label;
  if(note)msg+="\nNotes: "+note;
  var snap={cart:JSON.parse(JSON.stringify(cart)),name:name,addr:addr,note:note,mode:mode(),areaIdx:$("area").selectedIndex,
    pay:po?po.id:null,payLabel:po?po.label:"",fee:t.fee,free:t.free,deliver:t.deliver,area:t.area,total:t.total,
    lines:t.ids.map(function(i){var p=find(i);return {name:p.name,q:cart[i],sub:p.price*cart[i]}})};
  window.open("https://wa.me/"+WHATSAPP_NUMBER+"?text="+encodeURIComponent(msg),"_blank","noopener");
  cart={};try{sessionStorage.removeItem(KEY)}catch(e){}
  $("name").value="";$("addr").value="";$("note").value="";
  renderAll();showSent(snap);
});

// ---------- After sending: review, fix, or finish ----------
function clearSent(){$("sentLines").innerHTML="";$("sentTotal").textContent="";$("sentInfo").textContent=""}
function showSent(o){
  lastOrder=o;corrected=false;
  $("sentLines").innerHTML=o.lines.map(function(l){return '<div class="line"><div>'+esc(l.name)+'<small>'+l.q+' × '+money(l.sub/l.q)+'</small></div><strong>'+money(l.sub)+'</strong></div>'}).join("")+
    (o.deliver?'<div class="line"><div>Delivery'+(o.area?' ('+esc(o.area)+')':'')+'</div><strong>'+(o.free?"Free":money(o.fee))+'</strong></div>':"");
  $("sentTotal").textContent=money(o.total);
  $("sentInfo").textContent="Name: "+o.name+"\n"+o.mode+(o.deliver?"\nArea: "+o.area+"\nAddress: "+o.addr:"")+(o.payLabel?"\nPayment: "+o.payLabel:"")+(o.note?"\nNotes: "+o.note:"");
  $("orderForm").hidden=true;$("sent").hidden=false;$("status").textContent="";
  $("cart").scrollIntoView({behavior:"smooth"});
}
$("fixBtn").addEventListener("click",function(){
  var o=lastOrder;if(!o)return;
  cart=o.cart;$("name").value=o.name;$("addr").value=o.addr;$("note").value=o.note;
  document.querySelector('input[name=mode][value="'+o.mode+'"]').checked=true;
  $("addrBox").hidden=o.mode!=="Delivery";$("area").selectedIndex=o.areaIdx;
  if(o.pay){var r=document.querySelector('input[name=pay][value="'+o.pay+'"]');if(r){r.checked=true;showPayInfo()}}
  corrected=true;lastOrder=null;clearSent();
  $("sent").hidden=true;$("orderForm").hidden=false;renderAll();
  $("status").textContent="Fix what's wrong, then press send again. We'll know it replaces your first order.";
});
function resetAll(msg){
  cart={};lastOrder=null;corrected=false;cat="All";
  try{sessionStorage.removeItem(KEY)}catch(e){}
  $("name").value="";$("addr").value="";$("note").value="";$("err").textContent="";
  document.querySelector('input[name=mode][value=Collection]').checked=true;
  $("addrBox").hidden=true;$("area").selectedIndex=0;
  clearSent();$("sent").hidden=true;$("orderForm").hidden=false;
  $("status").textContent=msg||"";
  renderPay();renderChips();renderAll();
}
$("newBtn").addEventListener("click",function(){resetAll();window.scrollTo({top:0})});

// Wipe everything if the page sits untouched (shared devices)
function bump(){
  clearTimeout(idleTimer);
  if(IDLE_MINUTES>0)idleTimer=setTimeout(function(){
    if(lastOrder||Object.keys(cart).length||$("name").value||$("addr").value||$("note").value)resetAll("Cleared for privacy because the page was idle.");
  },IDLE_MINUTES*60000);
}
["click","keydown","touchstart","input"].forEach(function(e){document.addEventListener(e,bump,{passive:true})});
bump();

// ---------- Start ----------
document.title=STORE_NAME+" – Order on WhatsApp";
$("storeName").textContent=STORE_NAME;
$("area").innerHTML=DELIVERY_AREAS.map(function(a){return '<option>'+esc(a.name)+' – '+money(a.fee)+'</option>'}).join("");
if(!DELIVERY_AREAS.length)$("area").parentNode.querySelector("label[for=area]").hidden=$("area").hidden=true;
load();renderPay();renderChips();renderAll();
loadSheet().then(function(){renderChips();renderAll()});
