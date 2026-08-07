const KEY='medikent_raporlama_v1';

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
    type:'Eğitim',
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
if(!activities){ activities=sampleData; save(); }

function save(){ localStorage.setItem(KEY,JSON.stringify(activities)); }
function fmt(n){ return Number(n||0).toLocaleString('tr-TR'); }
function monthOf(date){ return (date||'').slice(0,7); }
function esc(s=''){ return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

const monthFilter=document.getElementById('monthFilter');
const reportMonth=document.getElementById('reportMonth');
const current='2026-06';
monthFilter.value=current; reportMonth.value=current;

document.querySelectorAll('.nav').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.nav').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(btn.dataset.view).classList.add('active');
  if(btn.dataset.view==='records') renderRecords();
}));

document.getElementById('activityForm').addEventListener('submit',e=>{
  e.preventDefault();
  const a={
    id:crypto.randomUUID(),
    date:date.value,title:title.value.trim(),branch:branch.value.trim(),doctor:doctor.value.trim(),
    type:type.value,platform:platform.value.trim(),
    views:+views.value||0,reach:+reach.value||0,likes:+likes.value||0,engagement:+engagement.value||0,participants:+participants.value||0,
    note:note.value.trim()
  };
  activities.push(a); save(); e.target.reset(); renderAll();
  alert('Faaliyet kaydedildi.');
});

function getMonthData(m){ return activities.filter(a=>monthOf(a.date)===m); }

function renderStats(){
  const rows=getMonthData(monthFilter.value);
  const total=(k)=>rows.reduce((s,a)=>s+(+a[k]||0),0);
  statTotal.textContent=rows.length;
  statSocial.textContent=rows.filter(a=>a.type==='Sosyal Medya').length;
  statTraining.textContent=rows.filter(a=>a.type==='Eğitim').length;
  statPress.textContent=rows.filter(a=>a.type==='Basın / Haber').length;
  statViews.textContent=fmt(total('views'));
  statParticipants.textContent=fmt(total('participants'));
  monthlySummary.innerHTML = rows.length ? `
    <b>${monthFilter.value}</b> döneminde toplam <b>${rows.length}</b> faaliyet kaydedildi.
    Bunların <b>${rows.filter(a=>a.type==='Sosyal Medya').length}</b> adedi sosyal medya,
    <b>${rows.filter(a=>a.type==='Eğitim').length}</b> adedi eğitim,
    <b>${rows.filter(a=>a.type==='Basın / Haber').length}</b> adedi basın/haber çalışmasıdır.
    Toplam görüntülenme <b>${fmt(total('views'))}</b>, toplam erişim <b>${fmt(total('reach'))}</b>,
    toplam etkileşim <b>${fmt(total('engagement'))}</b> ve eğitim katılımcısı <b>${fmt(total('participants'))}</b> kişidir.
  `:'Bu ay için kayıt bulunmuyor.';
}

function renderRecords(){
  const q=(searchInput.value||'').toLocaleLowerCase('tr');
  const rows=activities.filter(a=>JSON.stringify(a).toLocaleLowerCase('tr').includes(q))
    .sort((a,b)=>b.date.localeCompare(a.date));
  recordsBody.innerHTML=rows.map(a=>`
    <tr>
      <td>${esc(a.date)}</td><td>${esc(a.title)}</td><td>${esc(a.type)}</td><td>${esc(a.branch)}</td><td>${esc(a.doctor)}</td>
      <td>${a.views?fmt(a.views)+' görüntülenme':a.participants?fmt(a.participants)+' katılımcı':esc(a.platform||'-')}</td>
      <td><button class="delete-btn" onclick="removeActivity('${a.id}')">Sil</button></td>
    </tr>`).join('');
}

window.removeActivity=id=>{
  if(confirm('Bu kayıt silinsin mi?')){activities=activities.filter(a=>a.id!==id);save();renderAll();}
};

function generateReport(){
  const m=reportMonth.value;
  const rows=getMonthData(m).sort((a,b)=>a.date.localeCompare(b.date));
  const total=(k)=>rows.reduce((s,a)=>s+(+a[k]||0),0);
  const [y,mo]=m.split('-');
  const monthNames=['','Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  const title=`${monthNames[+mo]} ${y} Faaliyet Raporu`;
  reportOutput.innerHTML = `
    <h1>MEDİKENT HASTANESİ</h1>
    <h2>${title}</h2>
    <p class="meta">Otomatik oluşturulan faaliyet ve istatistik özeti</p>
    <hr>
    <p><b>Toplam faaliyet:</b> ${rows.length}<br>
    <b>Sosyal medya çalışması:</b> ${rows.filter(a=>a.type==='Sosyal Medya').length}<br>
    <b>Eğitim:</b> ${rows.filter(a=>a.type==='Eğitim').length}<br>
    <b>Basın / Haber:</b> ${rows.filter(a=>a.type==='Basın / Haber').length}<br>
    <b>Toplam görüntülenme:</b> ${fmt(total('views'))}<br>
    <b>Toplam erişim:</b> ${fmt(total('reach'))}<br>
    <b>Toplam etkileşim:</b> ${fmt(total('engagement'))}<br>
    <b>Toplam katılımcı:</b> ${fmt(total('participants'))}</p>
    <h3>Faaliyetler</h3>
    ${rows.map(a=>`
      <p><b>${esc(a.date)} – ${esc(a.title)}</b><br>
      ${a.branch?esc(a.branch)+' – ':''}${esc(a.doctor||'')}
      ${a.platform?'<br><i>'+esc(a.platform)+'</i>':''}
      ${a.note?'<br>'+esc(a.note):''}</p>`).join('') || '<p>Bu ay için kayıt bulunmuyor.</p>'}
  `;
}

document.getElementById('refreshStats').onclick=renderStats;
document.getElementById('generateReport').onclick=generateReport;
document.getElementById('searchInput').addEventListener('input',renderRecords);
document.getElementById('printBtn').onclick=()=>window.print();

document.getElementById('exportBtn').onclick=()=>{
  const blob=new Blob([JSON.stringify(activities,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='medikent-raporlama-yedek.json';a.click();
  URL.revokeObjectURL(a.href);
};

document.getElementById('importFile').addEventListener('change',async e=>{
  const f=e.target.files[0]; if(!f)return;
  try{
    const data=JSON.parse(await f.text());
    if(!Array.isArray(data))throw new Error();
    activities=data;save();renderAll();alert('Yedek geri yüklendi.');
  }catch{alert('Geçersiz yedek dosyası.');}
});

function renderAll(){renderStats();renderRecords();generateReport();}
renderAll();
