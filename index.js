import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();

const app = express();
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json());

const ADMIN_USER = process.env.ADMIN_USER || "SHADOWKING:TV-MOBIL-PC-OPENED:ADMIN";
const ADMIN_PASS = process.env.ADMIN_PASS || "SHADOWKING_TV_FREEAPP-49578Y588bs538";
const JWT_SECRET = process.env.JWT_SECRET || "TITAN_FINAL_JWT_LIVE";

// Vercel fix: /tmp writable
const DATA_FILE = path.join('/tmp', 'titan_data_full.json');
let store = { licenses: [], trash: [], logs: [] };

function loadStore(){
  try{ if(fs.existsSync(DATA_FILE)) store = JSON.parse(fs.readFileSync(DATA_FILE,'utf8')); }catch(e){}
  if(!store.licenses || store.licenses.length === 0){
    const now = new Date();
    store.licenses = [
      { id:'def1', admin:'USER_00OYG', pass:'2baoqlz578', maxDevices:5, days:365, expiresAt:new Date(now.getTime()+365*24*60*60*1000), notes:'Default - ABUUD', wallet:0, ghost:false, devices:[], frozen:false, lastActive:now, createdAt:now },
      { id:'def2', admin:'SHADOWKING:TV-MOBIL-PC-OPENED:ADMIN', pass:'SHADOWKING_TV_FREEAPP-49578Y588bs538', maxDevices:10, days:365, expiresAt:new Date(now.getTime()+365*24*60*60*1000), notes:'Admin default', wallet:0, ghost:false, devices:[], frozen:false, lastActive:now, createdAt:now },
      { id:'def3', admin:'ABUUD', pass:'ABUUD-8K-MASTER', maxDevices:100, days:999, expiresAt:new Date(now.getTime()+999*24*60*60*1000), notes:'ABUUD MASTER 8K - POWERED BY ABUUD', wallet:0, ghost:false, devices:[], frozen:false, lastActive:now, createdAt:now }
    ];
    saveStore();
  }
}
function saveStore(){ try{ fs.writeFileSync(DATA_FILE, JSON.stringify(store)); }catch(e){} }
loadStore();

function auth(req,res,next){
  const h = req.headers.authorization;
  if(!h) return res.status(401).json({error:'No token'});
  try{ jwt.verify(h.replace('Bearer ','').trim(), JWT_SECRET); next(); }catch{ res.status(401).json({error:'Invalid token'}); }
}

// FULL SECURE DASHBOARD WITH ALL FEATURES - لا يوجد أدمن ظاهر
const DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>POWERED BY ABUUD - IPTV - FULL DASHBOARD</title><script src="https://cdn.tailwindcss.com"></script><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet"><style>*{font-family:'Cairo',sans-serif}.mono{font-family:'JetBrains Mono',monospace}.glass{background:rgba(15,15,20,0.8);backdrop-filter:blur(20px)}@keyframes marquee{0%{transform:translateX(-15%)}100%{transform:translateX(15%)}}.marquee-track{animation:marquee 8s ease-in-out infinite alternate;display:inline-block}.marquee-text{font-family:'Orbitron',sans-serif;font-weight:900;background:linear-gradient(90deg,#6366F1,#06B6D4);-webkit-background-clip:text;-webkit-text-fill-color:transparent}</style></head>
<body class="bg-[#050507] text-white min-h-screen">
<div id="loginPage" class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
  <img src="https://images.unsplash.com/photo-1536240478700-b869070f9279?w=1920" class="absolute inset-0 w-full h-full object-cover opacity-10">
  <div class="absolute inset-0 bg-gradient-to-l from-black via-black/50 to-transparent"></div>
  <div class="relative w-full max-w-[380px] glass border border-white/10 rounded-[22px] p-6 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
    <div class="overflow-hidden rounded-xl mb-4 bg-gradient-to-r from-violet-600/20 to-cyan-500/20 border border-violet-500/20 py-2"><div class="marquee-track"><span class="marquee-text text-[12px]">POWERED BY ABUUD - IPTV • POWERED BY ABUUD - IPTV • POWERED BY ABUUD - IPTV</span></div></div>
    <div class="text-center mb-5"><div class="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-violet-600 to-cyan-400 flex items-center justify-center text-xl mb-2">🔐</div><div class="text-[10px] tracking-[0.3em] opacity-40">SECURE • FULL FEATURES • 8K • 7680x4320</div></div>
    <div class="space-y-3"><div><div class="text-[11px] opacity-60 mb-1">اسم المستخدم</div><input id="adminUser" type="text" placeholder="اسم المستخدم" class="w-full h-[46px] rounded-xl bg-black/60 border border-white/10 px-4 text-[13px] text-center focus:border-violet-500 outline-none"></div><div><div class="text-[11px] opacity-60 mb-1">كلمة المرور</div><input id="adminPass" type="password" placeholder="كلمة المرور" class="w-full h-[46px] rounded-xl bg-black/60 border border-white/10 px-4 text-[13px] text-center focus:border-violet-500 outline-none"></div></div>
    <div id="loginErr" class="hidden mt-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center text-[12px] text-red-400"></div>
    <button onclick="doLogin()" id="loginBtn" class="w-full mt-5 h-[48px] rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 font-bold">تسجيل دخول آمن</button>
    <div class="mt-3 text-center text-[8px] opacity-20">🔒 بدون أدمن ظاهر • كل المميزات موجودة • Vercel Fixed</div>
  </div>
</div>
<div id="dashPage" class="hidden min-h-screen flex-col"><div class="h-[48px] bg-[#0d0e14] border-b border-white/10 flex items-center px-0 overflow-hidden"><div class="marquee-track"><span class="marquee-text text-[11px]">POWERED BY ABUUD - IPTV • FULL DASHBOARD • ALL FEATURES • 8K • POWERED BY ABUUD - IPTV • TRASH • CLONE • RENEW • FREEZE • NUKE • EDIT • GHOST</span></div></div><div class="h-[56px] bg-[#0d0e14] border-b border-white/10 flex items-center justify-between px-6"><div class="font-black text-sm tracking-widest">POWERED BY ABUUD - FULL</div><div class="flex gap-2"><span id="licCount" class="bg-white/10 px-3 py-1 rounded-full text-[11px]">0</span><span id="trashCount" class="bg-red-500/20 px-3 py-1 rounded-full text-[11px]">🗑️ 0</span><button onclick="doLogout()" class="w-8 h-8 rounded-full bg-red-500/20">🚪</button></div></div><div class="flex-1 p-4 max-w-[1600px] mx-auto w-full"><div class="grid grid-cols-1 xl:grid-cols-4 gap-4 mb-4"><div class="xl:col-span-3 bg-[#0f0f14] border border-white/10 rounded-2xl p-4"><div class="font-bold mb-3 flex items-center justify-between"><span>➕ إضافة / تعديل ترخيص</span><span class="text-[10px] opacity-40">كل المميزات موجودة</span></div><div class="grid grid-cols-2 md:grid-cols-4 gap-2"><input id="newAdmin" placeholder="اسم المستخدم" class="h-10 rounded-xl bg-black/50 border border-white/10 px-3 text-[12px] mono"><input id="newPass" placeholder="كود التفعيل" class="h-10 rounded-xl bg-black/50 border border-white/10 px-3 text-[12px] mono"><input id="newDays" placeholder="الأيام" type="number" class="h-10 rounded-xl bg-black/50 border border-white/10 px-3 text-[12px]"><input id="newMax" placeholder="الأجهزة" type="number" class="h-10 rounded-xl bg-black/50 border border-white/10 px-3 text-[12px]"></div><div class="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2"><input id="newNotes" placeholder="ملاحظات" class="h-10 rounded-xl bg-black/50 border border-white/10 px-3 text-[12px]"><input id="newWallet" placeholder="المحفظة" type="number" class="h-10 rounded-xl bg-black/50 border border-white/10 px-3 text-[12px]"><label class="flex items-center gap-2 h-10 px-3 rounded-xl bg-black/50 border border-white/10 text-[11px]"><input id="newGhost" type="checkbox" class="w-4 h-4"> Ghost</label></div><div class="flex gap-2 mt-3"><button onclick="addLicense()" class="flex-1 h-11 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 font-bold text-[12px]">➕ إضافة</button><button onclick="clearForm()" class="px-6 h-11 rounded-xl bg-white/10 text-[12px]">مسح</button><button onclick="nukeExpired()" class="px-6 h-11 rounded-xl bg-red-500/20 text-[12px]">☢️ Nuke منتهي</button></div></div><div class="bg-[#0f0f14] border border-white/10 rounded-2xl p-4"><div class="font-bold mb-3 text-[13px]">🧪 اختبار API + 📊 إحصائيات</div><div id="stats" class="text-[11px] opacity-70 mono space-y-1 mb-3"></div><div class="border-t border-white/5 pt-3"><input id="testAdmin" placeholder="اسم المستخدم" class="w-full h-9 rounded-lg bg-black/50 border border-white/10 px-3 text-[11px] mb-2 mono"><input id="testPass" placeholder="كود التفعيل" class="w-full h-9 rounded-lg bg-black/50 border border-white/10 px-3 text-[11px] mb-2 mono"><div class="grid grid-cols-2 gap-2"><button onclick="testCheck()" class="h-9 rounded-lg bg-white/10 text-[10px]">/check</button><button onclick="testVerify()" class="h-9 rounded-lg bg-white/10 text-[10px]">/verify</button></div><div id="testResult" class="mt-2 text-[10px] bg-black/50 rounded-lg p-2 min-h-[50px] mono"></div></div></div></div><div class="grid grid-cols-1 xl:grid-cols-3 gap-4"><div class="xl:col-span-2 bg-[#0f0f14] border border-white/10 rounded-2xl p-4"><div class="flex items-center justify-between mb-3"><div class="font-bold text-[13px]">📋 التراخيص الحية</div><div class="flex gap-2"><input id="searchLic" oninput="filterLic()" placeholder="بحث..." class="h-8 rounded-full bg-black/50 border border-white/10 px-4 text-[11px] w-[160px]"><button onclick="loadLicenses()" class="h-8 px-4 rounded-full bg-white/10 text-[11px]">🔄</button></div></div><div id="licList" class="space-y-2 max-h-[700px] overflow-y-auto"></div></div><div class="bg-[#0f0f14] border border-white/10 rounded-2xl p-4 border-red-500/10"><div class="flex items-center justify-between mb-3"><div class="font-bold text-[13px]">🗑️ سلة المحذوفات</div><button onclick="loadTrash()" class="h-8 px-4 rounded-full bg-red-500/10 text-[11px]">🔄</button></div><div id="trashList" class="space-y-2 max-h-[700px] overflow-y-auto"></div></div></div></div></div>
<script>
let TOKEN=localStorage.getItem('titan_token')||'';let ALL_LICS=[];
if(TOKEN){document.getElementById('loginPage').classList.add('hidden');document.getElementById('dashPage').classList.remove('hidden');document.getElementById('dashPage').classList.add('flex');loadLicenses();loadTrash();}
async function doLogin(){const u=document.getElementById('adminUser').value.trim();const p=document.getElementById('adminPass').value.trim();const e=document.getElementById('loginErr');const b=document.getElementById('loginBtn');if(!u||!p){e.textContent='❌ أدخل البيانات';e.classList.remove('hidden');return;}b.textContent='جاري...';b.disabled=true;try{const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})});const d=await r.json();if(r.ok&&d.token){TOKEN=d.token;localStorage.setItem('titan_token',TOKEN);document.getElementById('loginPage').classList.add('hidden');document.getElementById('dashPage').classList.remove('hidden');document.getElementById('dashPage').classList.add('flex');loadLicenses();loadTrash();}else{e.textContent='❌ '+(d.error||'خطأ');e.classList.remove('hidden');}}catch(err){e.textContent='❌ '+err.message;e.classList.remove('hidden');}b.textContent='تسجيل دخول آمن';b.disabled=false;}
function doLogout(){localStorage.removeItem('titan_token');location.reload();}
async function loadLicenses(){try{const r=await fetch('/api/licenses',{headers:{'Authorization':'Bearer '+TOKEN}});if(r.status===401){doLogout();return;}ALL_LICS=await r.json();document.getElementById('licCount').textContent=ALL_LICS.length+' ترخيص';document.getElementById('stats').innerHTML='العدد: '+ALL_LICS.length+'<br>مجمد: '+ALL_LICS.filter(l=>l.frozen).length+'<br>منتهي: '+ALL_LICS.filter(l=>new Date(l.expiresAt)<new Date()).length+'<br>أجهزة: '+ALL_LICS.reduce((s,l)=>s+l.devices.length,0);renderLic(ALL_LICS);}catch(e){document.getElementById('licList').innerHTML='<div class=text-red-400>خطأ: '+e.message+'</div>';}}
function renderLic(list){document.getElementById('licList').innerHTML=list.map(l=>{const exp=new Date(l.expiresAt);const isExp=exp<new Date();return \`<div class="flex flex-col bg-black/40 border border-white/5 rounded-xl p-3 \${l.frozen?'opacity-50':''} \${isExp?'border-red-500/30':''}"><div class="flex items-start justify-between"><div class="flex-1 min-w-0"><div class="font-bold text-[12px] mono truncate">\${l.admin}</div><div class="text-[10px] opacity-60 mono truncate">\${l.pass} • \${l.days}d • \${exp.toLocaleDateString('ar-EG')} • \${l.maxDevices} dev • \${l.devices.length} used \${l.ghost? '• 👻 Ghost':''} \${isExp?'<span class=text-red-400>• EXPIRED</span>':''}</div><div class="text-[10px] opacity-40 truncate">\${l.notes||''} \${l.wallet? '• Wallet:'+l.wallet:''}</div></div><div class="flex flex-col gap-1 ml-2"><div class="flex gap-1"><button onclick="editLic('\${l.id}')" class="w-7 h-7 rounded-lg bg-blue-500/20 text-[10px]" title="تعديل">✏️</button><button onclick="freezeLic('\${l.id}')" class="w-7 h-7 rounded-lg bg-yellow-500/20 text-[10px]" title="تجميد">\${l.frozen?'🔓':'❄️'}</button><button onclick="cloneLic('\${l.id}')" class="w-7 h-7 rounded-lg bg-green-500/20 text-[10px]" title="نسخ">📋</button><button onclick="deleteLic('\${l.id}')" class="w-7 h-7 rounded-lg bg-red-500/20 text-[10px]" title="حذف">🗑️</button></div><div class="flex gap-1"><button onclick="renewLic('\${l.id}',30)" class="px-2 h-6 rounded bg-white/10 text-[9px]">+30</button><button onclick="renewLic('\${l.id}',90)" class="px-2 h-6 rounded bg-white/10 text-[9px]">+90</button><button onclick="copyLic('\${l.admin}:\${l.pass}')" class="px-2 h-6 rounded bg-violet-500/20 text-[9px]">Copy</button></div></div></div></div>\`;}).join('')||'<div class=text-center opacity-30 py-10>لا يوجد</div>';}
function filterLic(){const q=document.getElementById('searchLic').value.toLowerCase();renderLic(ALL_LICS.filter(l=>l.admin.toLowerCase().includes(q)||l.pass.toLowerCase().includes(q)));}
async function loadTrash(){try{const r=await fetch('/api/trash',{headers:{'Authorization':'Bearer '+TOKEN}});const list=await r.json();document.getElementById('trashCount').textContent='🗑️ '+list.length;document.getElementById('trashList').innerHTML=list.map(l=>\`<div class="flex items-center justify-between bg-red-500/5 border border-red-500/10 rounded-xl p-2"><div class="text-[11px] mono truncate flex-1">\${l.admin} / \${l.pass}</div><button onclick="restoreLic('\${l.id}')" class="w-7 h-7 rounded-lg bg-green-500/20 text-[10px]">♻️</button></div>\`).join('')||'<div class=text-center opacity-30 py-6>فارغة</div>';}catch(e){}}
async function addLicense(){const admin=document.getElementById('newAdmin').value.trim()||'ADMIN_'+Math.floor(1000+Math.random()*9000);const pass=document.getElementById('newPass').value.trim()||'PASS_'+Math.random().toString(36).substr(2,6).toUpperCase();const days=document.getElementById('newDays').value||'30';const maxDevices=document.getElementById('newMax').value||'1';const notes=document.getElementById('newNotes').value||'';const wallet=document.getElementById('newWallet').value||'0';const ghost=document.getElementById('newGhost').checked;try{const r=await fetch('/api/licenses',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+TOKEN},body:JSON.stringify({admin,pass,days,maxDevices,notes,wallet,ghost})});if(r.ok){clearForm();loadLicenses();}else alert('❌ '+(await r.text()));}catch(e){alert('❌ '+e.message);}}
function clearForm(){document.getElementById('newAdmin').value='';document.getElementById('newPass').value='';document.getElementById('newDays').value='';document.getElementById('newMax').value='';document.getElementById('newNotes').value='';document.getElementById('newWallet').value='';document.getElementById('newGhost').checked=false;}
async function editLic(id){const admin=prompt('اسم المستخدم الجديد:');const pass=prompt('كود التفعيل الجديد:');const days=prompt('الأيام:');const maxDevices=prompt('عدد الأجهزة:');const notes=prompt('ملاحظات:');const body={};if(admin)body.admin=admin;if(pass)body.pass=pass;if(days)body.days=days;if(maxDevices)body.maxDevices=maxDevices;if(notes!==null)body.notes=notes;await fetch('/api/licenses/'+id,{method:'PUT',headers:{'Content-Type':'application/json','Authorization':'Bearer '+TOKEN},body:JSON.stringify(body)});loadLicenses();}
async function freezeLic(id){await fetch('/api/licenses/'+id+'/freeze',{method:'POST',headers:{'Authorization':'Bearer '+TOKEN}});loadLicenses();}
async function cloneLic(id){await fetch('/api/licenses/'+id+'/clone',{method:'POST',headers:{'Authorization':'Bearer '+TOKEN}});loadLicenses();}
async function deleteLic(id){if(!confirm('حذف ونقل للسلة؟'))return;await fetch('/api/licenses/'+id,{method:'DELETE',headers:{'Authorization':'Bearer '+TOKEN}});loadLicenses();loadTrash();}
async function restoreLic(id){await fetch('/api/trash/'+id+'/restore',{method:'POST',headers:{'Authorization':'Bearer '+TOKEN}});loadLicenses();loadTrash();}
async function renewLic(id,days){await fetch('/api/licenses/'+id+'/renew',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+TOKEN},body:JSON.stringify({days})});loadLicenses();}
async function nukeExpired(){if(!confirm('حذف كل المنتهي ونقله للسلة؟'))return;await fetch('/api/nuke',{method:'POST',headers:{'Authorization':'Bearer '+TOKEN}});loadLicenses();loadTrash();}
function copyLic(t){navigator.clipboard.writeText(t);alert('✅ نسخ: '+t);}
async function testCheck(){const admin=document.getElementById('testAdmin').value.trim();const pass=document.getElementById('testPass').value.trim();const out=document.getElementById('testResult');out.textContent='جاري...';try{const r=await fetch('/api/check',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({admin,pass})});const d=await r.json();out.textContent=JSON.stringify(d,null,2);}catch(e){out.textContent='خطأ: '+e.message;}}
async function testVerify(){const admin=document.getElementById('testAdmin').value.trim();const pass=document.getElementById('testPass').value.trim();const out=document.getElementById('testResult');out.textContent='جاري...';try{const r=await fetch('/api/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:admin,code:pass})});const d=await r.json();out.textContent=JSON.stringify(d,null,2);}catch(e){out.textContent='خطأ: '+e.message;}}
</script></body></html>`;

app.get('/api/debug', (req,res)=> res.json({ licensesCount: store.licenses.length, trashCount: store.trash.length, licenses: store.licenses.map(l=>({admin:l.admin, pass:l.pass, expiresAt:l.expiresAt, frozen:l.frozen, devices:l.devices.length})), tmpExists: fs.existsSync(DATA_FILE) }));

app.post('/api/admin/login', (req,res)=>{
  const {username,password} = req.body;
  if(username!==ADMIN_USER || password!==ADMIN_PASS) return res.status(401).json({error:'Invalid TITAN'});
  const token = jwt.sign({role:'GOD'}, JWT_SECRET, {expiresIn:'12h'});
  res.json({token});
});

app.get('/api/licenses', auth, (req,res)=> res.json(store.licenses));
app.get('/api/trash', auth, (req,res)=> res.json(store.trash));

app.post('/api/licenses', auth, (req,res)=>{
  const {admin,pass,maxDevices,days,notes,wallet,ghost} = req.body;
  const daysNum = parseInt(days) || 30;
  const lic = { id:Date.now().toString(), admin: admin || 'ADMIN_'+Math.floor(1000+Math.random()*9000), pass: pass || 'PASS_'+Math.random().toString(36).substr(2,6).toUpperCase(), maxDevices: parseInt(maxDevices)||1, days: daysNum, expiresAt:new Date(Date.now()+daysNum*24*60*60*1000), notes: notes||'', wallet: parseInt(wallet)||0, ghost: !!ghost, devices:[], frozen:false, lastActive:new Date(), createdAt:new Date() };
  store.licenses.push(lic); saveStore(); res.json(lic);
});

app.put('/api/licenses/:id', auth, (req,res)=>{
  const lic = store.licenses.find(l=>l.id===req.params.id); if(!lic) return res.status(404).json({error:'Not found'});
  const {admin,pass,maxDevices,days,notes,wallet,ghost} = req.body;
  if(admin) lic.admin=admin; if(pass) lic.pass=pass; if(maxDevices) lic.maxDevices=parseInt(maxDevices);
  if(days){ const d=parseInt(days); if(!isNaN(d)){ lic.days=d; lic.expiresAt=new Date(Date.now()+d*24*60*60*1000); } }
  if(notes!==undefined) lic.notes=notes; if(wallet!==undefined) lic.wallet=parseInt(wallet); if(ghost!==undefined) lic.ghost=!!ghost;
  saveStore(); res.json(lic);
});

app.post('/api/licenses/:id/renew', auth, (req,res)=>{
  const lic = store.licenses.find(l=>l.id===req.params.id); if(!lic) return res.status(404).json({error:'Not found'});
  const add = parseInt(req.body.days) || 30; lic.expiresAt=new Date(new Date(lic.expiresAt).getTime()+add*24*60*60*1000); lic.days=parseInt(lic.days)+add; saveStore(); res.json(lic);
});

app.post('/api/licenses/:id/freeze', auth, (req,res)=>{
  const lic = store.licenses.find(l=>l.id===req.params.id); if(!lic) return res.status(404).json({error:'Not found'});
  lic.frozen=!lic.frozen; saveStore(); res.json(lic);
});

app.post('/api/licenses/:id/clone', auth, (req,res)=>{
  const lic = store.licenses.find(l=>l.id===req.params.id); if(!lic) return res.status(404).json({error:'Not found'});
  const clone={...lic, id:Date.now().toString(), admin:'ADMIN_'+Math.floor(1000+Math.random()*9000), pass:'PASS_'+Math.random().toString(36).substr(2,6).toUpperCase(), devices:[], createdAt:new Date()};
  store.licenses.push(clone); saveStore(); res.json(clone);
});

app.delete('/api/licenses/:id', auth, (req,res)=>{
  const idx=store.licenses.findIndex(l=>l.id===req.params.id); if(idx<0) return res.status(404).json({error:'Not found'});
  store.trash.push(store.licenses[idx]); store.licenses.splice(idx,1); saveStore(); res.json({ok:true});
});

app.post('/api/trash/:id/restore', auth, (req,res)=>{
  const idx=store.trash.findIndex(l=>l.id===req.params.id); if(idx<0) return res.status(404).json({error:'Not found'});
  store.licenses.push(store.trash[idx]); store.trash.splice(idx,1); saveStore(); res.json({ok:true});
});

app.post('/api/nuke', auth, (req,res)=>{
  const now=new Date(); const toTrash=store.licenses.filter(l=> new Date(l.expiresAt) < now);
  store.trash.push(...toTrash); store.licenses=store.licenses.filter(l=> new Date(l.expiresAt) >= now); saveStore(); res.json({deleted: toTrash.length});
});

app.post('/api/check', (req,res)=>{
  const {admin,pass,deviceId} = req.body;
  const lic = store.licenses.find(l=>l.admin===admin && l.pass===pass);
  if(!lic) return res.json({valid:false, error:'Invalid'});
  if(lic.frozen) return res.json({valid:false, error:'Frozen'});
  if(new Date() > new Date(lic.expiresAt)) return res.json({valid:false, error:'Expired', code:'EXPIRED_KEY'});
  if(deviceId && !lic.devices.includes(deviceId)){
    if(lic.devices.length >= lic.maxDevices) return res.json({valid:false, error:'Device limit'});
    lic.devices.push(deviceId); lic.lastActive=new Date(); saveStore();
  }
  res.json({valid:true, expiresAt: lic.expiresAt, days: lic.days});
});

app.post('/api/verify', (req,res)=>{
  const {username, user, admin, code, activationCode, pass, deviceId} = req.body;
  const finalAdmin = (admin || username || user || '').trim();
  const finalPass = (pass || code || activationCode || '').trim();
  if(!finalAdmin || !finalPass) return res.json({valid:false, success:false, error:'Missing'});
  const lic = store.licenses.find(l=>l.admin===finalAdmin && l.pass===finalPass);
  if(!lic) return res.json({valid:false, success:false, error:'Invalid', message:'كود غير صحيح'});
  if(lic.frozen) return res.json({valid:false, success:false, error:'Frozen', message:'مجمد'});
  if(new Date() > new Date(lic.expiresAt)) return res.json({valid:false, success:false, error:'Expired', code:'EXPIRED_KEY', message:'EXPIRED KEY'});
  if(deviceId && !lic.devices.includes(deviceId)){
    if(lic.devices.length >= lic.maxDevices) return res.json({valid:false, success:false, error:'Device limit'});
    lic.devices.push(deviceId); lic.lastActive=new Date(); saveStore();
  }
  res.json({valid:true, success:true, expiresAt: lic.expiresAt, days: lic.days, expireDays: lic.days});
});

app.get('/api/verify', (req,res)=> res.json({ok:true, count: store.licenses.length}));
app.get('/api/check', (req,res)=> res.json({ok:true, count: store.licenses.length}));

app.get('/dashboard', (req,res)=> res.send(DASHBOARD_HTML));
app.get('/', (req,res)=> res.redirect('/dashboard'));

export default app;
