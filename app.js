const KEY='medikent_raporlama_v1';
const DEFKEY='medikent_raporlama_def_v11';

const defaultDefs = {
  types:[
    'Sosyal Medya','Basın / Haber','Video','Eğitim','Gebe Okulu',
    'Sağlık Taraması','Farkındalık Etkinliği','Doktor Röportajı',
    'TV Programı','Radyo','Etkinlik','Diğer'
  ],
  branches:{
    'Çocuk Sağlığı ve Hastalıkları':['Uzm. Dr. Gökhan Gözün'],
    'Kadın Hastalıkları ve Doğum':[],
    'Genel Cerrahi':[],
    'Kardiyoloji':[],
    'Kalp ve Damar Cerrahisi':[],
    'Ortopedi ve Travmatoloji':[],
    'Kulak Burun Boğaz':[],
    'Beyin ve Sinir Cerrahisi':[],
    'Üroloji':[],
    'Cildiye':[],
    'Dahiliye':[],
    'Diğer':[]
  }
};

let defs = JSON.parse(localStorage.getItem(DEFKEY) || 'null') || defaultDefs;
localStorage.setItem(DEFKEY,JSON.stringify(defs));

const sampleData = [
  {
    id: crypto.randomUUID(),
    date:'2026-06-19',
    title:'Fenilketonüri Bilgilendirme Videosu',
    branch:'Çocuk Sağlığı ve Hastalıkları',
    doctor:'Uzm. Dr. Gökhan Gözün',
    type:'Sosyal Medya',
    platform:'Instagram + Facebook',
    views:5393,
    reach:0,
    likes:31,
    engagement:27,
    participants:0,
    note:'Instagram: 3.979 görüntülenme, 31 beğeni, 9 etkileşim. Facebook: 1.414 görüntülenme, 18 etkileşim.'
  },
  {
    id: crypto.randomUUID(),
    date:'2026-06-25',
    title:'Gebe Okulu – Yenidoğan Tarama Programı ve Fenilketonüri',
    branch:'Çocuk Sağlığı ve Hastalıkları',
    doctor:'Uzm. Dr. Gökhan Gözün',
    type:'Gebe Okulu',
    platform:'Medikent Hastanesi',
    views:0, reach:0, likes:0, engagement:0, participants:5,
    note:'Anne adayları yenidoğan tarama programı ve fenilketonürinin erken tanıdaki önemi hakkında bilgilendirildi.'
  },
  {
    id: crypto.randomUUID(),
    date:'2026-06-24',
    title:'Fenilketonüri Bilgilendirme Yazısı',
    branch:'Çocuk Sağlığı ve Hastalıkları',
    doctor:'Uzm. Dr. Gökhan Gözün',
    type:'Basın / Haber',
    platform:'Trakya Burda Ajansı',
    views:0, reach:0, likes:0, engagement:0, participants:0,
    note:'Bilgilendirme yazısı ajansa iletildi.'
  }
];

let activities = JSON.parse(localStorage.getItem(KEY) || 'null');
if(!activities){ activities=sampleData; localSave(); }

function localSave(){ localStorage.setItem(KEY,JSON.stringify(activities)); }
function save(){ localSave(); }

async function loadCloudIfAvailable(){
  if(window.medikentCloud?.enabled){
    try{
      const cloudRows = await window.medikentCloud.loadActivities();
      if(Array.isArray(cloudRows)){
        activities = cloudRows.length ? cloudRows : activities;
        localSave();
        renderAll();
      }
    }catch(err){
      console.error(err);
      alert("Firebase verileri alınamadı. Yerel kayıtlar gösteriliyor.");
    }
  }
}
window.addEventListener("medikent-cloud-ready", loadCloudIfAvailable);

function fmt(n){ return Number(n||0).toLocaleString('tr-TR'); }
function monthOf(date){ return (date||'').slice(0,7); }
function esc(s=''){ return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

const $=id=>document.getElementById(id);
const monthFilter=$('monthFilter');
const reportMonth=$('reportMonth');
const defaultMonth='2026-06';
monthFilter.value=defaultMonth; reportMonth.value=defaultMonth;

function populateDefs(){
  $('type').innerHTML = defs.types.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
  $('branch').innerHTML = '<option value="">Seçiniz</option>' + Object.keys(defs.branches).map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
  updateDoctors();
  $('definitionsList').innerHTML = Object.entries(defs.branches).map(([b,ds])=>`
    <div class="def-card"><strong>${esc(b)}</strong>${ds.length?ds.map(d=>esc(d)).join(', '):'<span class="muted">Doktor tanımı yok</span>'}</div>
  `).join('');
}

function updateDoctors(selected=''){
  const b=$('branch').value;
  const doctors=defs.branches[b]||[];
  $('doctor').innerHTML='<option value="">Seçiniz</option>'+doctors.map(d=>`<option value="${esc(d)}">${esc(d)}</option>`).join('');
  if(selected) $('doctor').value=selected;
}

function toggleConditionalFields(){
  const t=$('type').value;
  const social=['Sosyal Medya','Video','Doktor Röportajı','TV Programı','Radyo'].includes(t);
  const participant=['Eğitim','Gebe Okulu','Sağlık Taraması','Farkındalık Etkinliği','Etkinlik'].includes(t);
  $('socialFields').classList.toggle('hidden',!social);
  $('participantFields').classList.toggle('hidden',!participant);
}

document.querySelectorAll('.nav').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.nav').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active');
  $(btn.dataset.view).classList.add('active');
  if(btn.dataset.view==='records') renderRecords();
}));

$('branch').addEventListener('change',()=>updateDoctors());
$('type').addEventListener('change',toggleConditionalFields);

$('activityForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const data={
    date:$('date').value,title:$('title').value.trim(),branch:$('branch').value,doctor:$('doctor').value,
    type:$('type').value,platform:$('platform').value.trim(),
    views:+$('views').value||0,reach:+$('reach').value||0,likes:+$('likes').value||0,
    engagement:+$('engagement').value||0,participants:+$('participants').value||0,
    note:$('note').value.trim()
  };
  const editingId=$('editingId').value;
  if(editingId){
    const i=activities.findIndex(a=>a.id===editingId);
    if(i>=0) activities[i]={...activities[i],...data};
  }else{
    activities.push({id:crypto.randomUUID(),...data});
  }
  save();
  const savedActivity = editingId
    ? activities.find(a=>a.id===editingId)
    : activities[activities.length-1];

  if(window.medikentCloud?.enabled && savedActivity){
    try{ await window.medikentCloud.saveActivity(savedActivity); }
    catch(err){ console.error(err); alert("Kayıt yerel olarak kaydedildi ancak Firebase'e gönderilemedi."); }
  }

  resetForm(); renderAll();
  alert(editingId?'Kayıt güncellendi.':'Faaliyet kaydedildi.');
});

function resetForm(){
  $('activityForm').reset();
  $('editingId').value='';
  $('formTitle').textContent='Yeni Faaliyet';
  $('editBadge').classList.add('hidden');
  $('cancelEdit').classList.add('hidden');
  populateDefs();
  toggleConditionalFields();
}

$('cancelEdit').onclick=resetForm;

function getMonthData(m){ return activities.filter(a=>monthOf(a.date)===m); }

function renderStats(){
  const rows=getMonthData(monthFilter.value);
  const total=(k)=>rows.reduce((s,a)=>s+(+a[k]||0),0);
  $('statTotal').textContent=rows.length;
  $('statSocial').textContent=rows.filter(a=>['Sosyal Medya','Video'].includes(a.type)).length;
  $('statTraining').textContent=rows.filter(a=>['Eğitim','Gebe Okulu'].includes(a.type)).length;
  $('statPress').textContent=rows.filter(a=>a.type==='Basın / Haber').length;
  $('statViews').textContent=fmt(total('views'));
  $('statReach').textContent=fmt(total('reach'));
  $('statEngagement').textContent=fmt(total('engagement'));
  $('statParticipants').textContent=fmt(total('participants'));

  $('monthlySummary').innerHTML = rows.length ? `
    <b>${monthFilter.value}</b> döneminde toplam <b>${rows.length}</b> faaliyet kaydedildi.
    Toplam görüntülenme <b>${fmt(total('views'))}</b>, erişim <b>${fmt(total('reach'))}</b>,
    etkileşim <b>${fmt(total('engagement'))}</b> ve katılımcı <b>${fmt(total('participants'))}</b> kişidir.
  `:'Bu ay için kayıt bulunmuyor.';

  const counts={};
  rows.forEach(a=>counts[a.type]=(counts[a.type]||0)+1);
  const max=Math.max(1,...Object.values(counts));
  $('typeBars').innerHTML = Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`
    <div class="bar-row">
      <div class="bar-label"><span>${esc(k)}</span><b>${v}</b></div>
      <div class="bar-track"><div class="bar-fill" style="width:${(v/max)*100}%"></div></div>
    </div>`).join('') || '<span class="muted">Bu ay için veri yok.</span>';
}

function renderRecords(){
  const q=($('searchInput').value||'').toLocaleLowerCase('tr');
  const rows=activities.filter(a=>JSON.stringify(a).toLocaleLowerCase('tr').includes(q))
    .sort((a,b)=>b.date.localeCompare(a.date));
  $('recordsBody').innerHTML=rows.map(a=>`
    <tr>
      <td>${esc(a.date)}</td><td>${esc(a.title)}</td><td>${esc(a.type)}</td><td>${esc(a.branch)}</td><td>${esc(a.doctor)}</td>
      <td>${a.views?fmt(a.views)+' görüntülenme':a.participants?fmt(a.participants)+' katılımcı':esc(a.platform||'-')}</td>
      <td>
        <button class="edit-btn" onclick="editActivity('${a.id}')">Düzenle</button>
        <button class="delete-btn" onclick="removeActivity('${a.id}')">Sil</button>
      </td>
    </tr>`).join('');
}

window.editActivity=id=>{
  const a=activities.find(x=>x.id===id); if(!a)return;
  document.querySelector('[data-view="new"]').click();
  $('editingId').value=a.id;
  $('date').value=a.date;
  $('title').value=a.title;
  $('type').value=a.type;
  $('branch').value=a.branch;
  updateDoctors(a.doctor);
  $('platform').value=a.platform||'';
  $('views').value=a.views||0;
  $('reach').value=a.reach||0;
  $('likes').value=a.likes||0;
  $('engagement').value=a.engagement||0;
  $('participants').value=a.participants||0;
  $('note').value=a.note||'';
  $('formTitle').textContent='Faaliyeti Düzenle';
  $('editBadge').classList.remove('hidden');
  $('cancelEdit').classList.remove('hidden');
  toggleConditionalFields();
};

window.removeActivity=async id=>{
  if(confirm('Bu kayıt silinsin mi?')){
    activities=activities.filter(a=>a.id!==id);
    save();
    if(window.medikentCloud?.enabled){
      try{ await window.medikentCloud.deleteActivity(id); }
      catch(err){ console.error(err); alert("Kayıt yerelde silindi ancak Firebase'den silinemedi."); }
    }
    renderAll();
  }
};

function generateReport(){
  const m=$('reportMonth').value;
  const rows=getMonthData(m).sort((a,b)=>a.date.localeCompare(b.date));
  const total=(k)=>rows.reduce((s,a)=>s+(+a[k]||0),0);
  const [y,mo]=m.split('-');
  const monthNames=['','Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  const title=`${monthNames[+mo]} ${y} Faaliyet Raporu`;
  const doctorCount=new Set(rows.map(a=>a.doctor).filter(Boolean)).size;
  const branchCount=new Set(rows.map(a=>a.branch).filter(Boolean)).size;

  $('reportOutput').innerHTML = `
    <h1>MEDİKENT HASTANESİ</h1>
    <h2>${title}</h2>
    <p class="meta">Otomatik oluşturulan faaliyet ve istatistik özeti</p>
    <hr>
    <p><b>Toplam faaliyet:</b> ${rows.length}<br>
    <b>Faaliyet gösteren branş:</b> ${branchCount}<br>
    <b>Görev alan doktor/sorumlu:</b> ${doctorCount}<br>
    <b>Toplam görüntülenme:</b> ${fmt(total('views'))}<br>
    <b>Toplam erişim:</b> ${fmt(total('reach'))}<br>
    <b>Toplam etkileşim:</b> ${fmt(total('engagement'))}<br>
    <b>Toplam katılımcı:</b> ${fmt(total('participants'))}</p>
    <h3>Faaliyetler</h3>
    ${rows.map(a=>`
      <p><b>${esc(a.date)} – ${esc(a.title)}</b><br>
      ${a.branch?esc(a.branch):''}${a.doctor?' – '+esc(a.doctor):''}
      ${a.type?'<br><i>'+esc(a.type)+(a.platform?' / '+esc(a.platform):'')+'</i>':''}
      ${a.note?'<br>'+esc(a.note):''}</p>`).join('') || '<p>Bu ay için kayıt bulunmuyor.</p>'}
  `;
}

$('refreshStats').onclick=renderStats;
$('generateReport').onclick=generateReport;
$('searchInput').addEventListener('input',renderRecords);
$('printBtn').onclick=()=>window.print();

$('exportBtn').onclick=()=>{
  const payload={version:'1.1',activities,definitions:defs};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='medikent-raporlama-yedek-v1.1.json';
  a.click();
  URL.revokeObjectURL(a.href);
};

$('importFile').addEventListener('change',async e=>{
  const f=e.target.files[0]; if(!f)return;
  try{
    const data=JSON.parse(await f.text());
    if(Array.isArray(data)){
      activities=data;
    }else{
      if(!Array.isArray(data.activities))throw new Error();
      activities=data.activities;
      if(data.definitions) defs=data.definitions;
    }
    save();
    localStorage.setItem(DEFKEY,JSON.stringify(defs));
    populateDefs(); renderAll();
    alert('Yedek geri yüklendi.');
  }catch{alert('Geçersiz yedek dosyası.');}
});

function renderAll(){renderStats();renderRecords();generateReport();}
populateDefs();
toggleConditionalFields();
renderAll();
