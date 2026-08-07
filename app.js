const KEY='medikent_raporlama_v1';
const DEFKEY='medikent_raporlama_def_v21';

const defaultTypes = [
  'Sosyal Medya','Basın / Haber','Video','Eğitim','Gebe Okulu',
  'Sağlık Taraması','Farkındalık Etkinliği','Doktor Röportajı',
  'TV Programı','Radyo','Etkinlik','Diğer'
];

const REQUIRED_DEPARTMENTS = [
  {id:'dep-cocuk-sagligi', name:'Çocuk Sağlığı ve Hastalıkları'},
  {id:'dep-cocuk-cerrahisi', name:'Çocuk Cerrahisi'},
  {id:'dep-kadin-dogum', name:'Kadın Hastalıkları ve Doğum'},
  {id:'dep-genel-cerrahi', name:'Genel Cerrahi'},
  {id:'dep-kbb', name:'Kulak Burun Boğaz'},
  {id:'dep-ortopedi', name:'Ortopedi ve Travmatoloji'},
  {id:'dep-kvc', name:'Kalp ve Damar Cerrahisi'},
  {id:'dep-kardiyoloji', name:'Kardiyoloji'},
  {id:'dep-beyin-sinir', name:'Beyin ve Sinir Cerrahisi'},
  {id:'dep-uroloji', name:'Üroloji'},
  {id:'dep-cildiye', name:'Cildiye (Dermatoloji)'},
  {id:'dep-dahiliye', name:'İç Hastalıkları (Dahiliye)'},
  {id:'dep-algoloji', name:'Algoloji'},
  {id:'dep-plastik', name:'Plastik, Rekonstrüktif ve Estetik Cerrahi'}
];

let departments = JSON.parse(localStorage.getItem('medikent_departments_v21') || 'null') || [];

function ensureRequiredDepartmentsLocal(){
  const byName = new Set(
    departments.map(d => (d.name || '').trim().toLocaleLowerCase('tr'))
  );

  for(const dep of REQUIRED_DEPARTMENTS){
    const key = dep.name.trim().toLocaleLowerCase('tr');
    if(!byName.has(key)){
      departments.push({...dep});
      byName.add(key);
    }
  }

  localStorage.setItem('medikent_departments_v21', JSON.stringify(departments));
}
ensureRequiredDepartmentsLocal();

let doctors = JSON.parse(localStorage.getItem('medikent_doctors_v21') || 'null') || [
  {id:'doc-gokhan-gozun', name:'Uzm. Dr. Gökhan Gözün', departmentId:'dep-cocuk-sagligi', active:true}
];

function saveMasterLocal(){
  localStorage.setItem('medikent_departments_v21', JSON.stringify(departments));
  localStorage.setItem('medikent_doctors_v21', JSON.stringify(doctors));
}
saveMasterLocal();



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
  if(!window.medikentCloud?.enabled) return;
  try{
    const cloudRows = await window.medikentCloud.loadActivities();
    if(Array.isArray(cloudRows) && cloudRows.length){
      activities = cloudRows;
      localSave();
      renderAll();
    }
    const status = document.getElementById("cloudTransferStatus");
    if(status){
      status.textContent = cloudRows.length
        ? `Bulutta ${cloudRows.length} kayıt bulundu.`
        : "Bulutta henüz kayıt yok. İstersen mevcut yerel kayıtları aktarabilirsin.";
    }
  }catch(err){
    console.error(err);
    alert("Firebase verileri alınamadı: " + (err.message || err));
  }
}

window.addEventListener("medikent-cloud-ready", loadCloudIfAvailable);
function fmt(n){ return Number(n||0).toLocaleString('tr-TR'); }
function monthOf(date){ return (date||'').slice(0,7); }
function esc(s=''){ return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

const $=id=>document.getElementById(id);
let selectedPhotoFiles = [];
let retainedExistingPhotos = [];

const monthFilter=$('monthFilter');
const reportMonth=$('reportMonth');
const defaultMonth='2026-06';
monthFilter.value=defaultMonth; reportMonth.value=defaultMonth;

function populateDefs(){
  ensureRequiredDepartmentsLocal();
  $('type').innerHTML = defaultTypes.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');

  $('branch').innerHTML = '<option value="">Bölüm seçiniz</option>' +
    departments.slice().sort((a,b)=>a.name.localeCompare(b.name,'tr'))
      .map(d=>`<option value="${esc(d.id)}">${esc(d.name)}</option>`).join('');

  const dd=$('doctorDepartment');
  if(dd){
    dd.innerHTML = '<option value="">Bölüm seçiniz</option>' +
      departments.slice().sort((a,b)=>a.name.localeCompare(b.name,'tr'))
        .map(d=>`<option value="${esc(d.id)}">${esc(d.name)}</option>`).join('');
  }

  updateDoctors();
  renderMasterLists();
}

function departmentNameById(id){
  return departments.find(d=>d.id===id)?.name || id || '';
}

function doctorNameById(id){
  return doctors.find(d=>d.id===id)?.name || id || '';
}

function updateDoctors(selected=''){
  const departmentId=$('branch').value;
  const filtered=doctors
    .filter(d=>d.departmentId===departmentId && d.active!==false)
    .sort((a,b)=>a.name.localeCompare(b.name,'tr'));

  $('doctor').innerHTML='<option value="">Doktor seçiniz</option>'+
    filtered.map(d=>`<option value="${esc(d.id)}">${esc(d.name)}</option>`).join('');

  if(selected) $('doctor').value=selected;
}

function renderMasterLists(){
  const depList=$('departmentList');
  if(depList){
    depList.innerHTML=departments.slice().sort((a,b)=>a.name.localeCompare(b.name,'tr')).map(d=>{
      const linked=doctors.filter(x=>x.departmentId===d.id).length;
      return `<div class="manage-item">
        <div class="edit-row" style="grid-template-columns:1fr auto">
          <input id="dep-name-${d.id}" value="${esc(d.name)}" aria-label="Bölüm adı">
          <button class="small-btn save-row" onclick="saveDepartmentEdit('${d.id}')">Kaydet</button>
        </div>
        <div class="meta">${linked} doktor bağlı</div>
      </div>`;
    }).join('') || '<span class="muted">Henüz bölüm tanımlanmadı.</span>';
  }

  const docList=$('doctorList');
  if(docList){
    docList.innerHTML=doctors.slice().sort((a,b)=>a.name.localeCompare(b.name,'tr')).map(d=>`
      <div class="manage-item ${d.active===false?'passive':''}">
        <div class="edit-row">
          <input id="doc-name-${d.id}" value="${esc(d.name)}" aria-label="Doktor adı">
          <select id="doc-dep-${d.id}" aria-label="Doktor bölümü">
            ${departments.slice().sort((a,b)=>a.name.localeCompare(b.name,'tr')).map(dep=>
              `<option value="${esc(dep.id)}" ${dep.id===d.departmentId?'selected':''}>${esc(dep.name)}</option>`
            ).join('')}
          </select>
          <button class="small-btn save-row" onclick="saveDoctorEdit('${d.id}')">Kaydet</button>
          <button class="small-btn ${d.active===false?'':'danger-row'}" onclick="toggleDoctor('${d.id}')">${d.active===false?'Aktif Yap':'Pasif Yap'}</button>
        </div>
      </div>`).join('') || '<span class="muted">Henüz doktor tanımlanmadı.</span>';
  }
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


function renderSelectedPhotoPreview(){
  const box=$('photoPreview');
  if(!box)return;
  box.innerHTML=selectedPhotoFiles.map((file,i)=>{
    const url=URL.createObjectURL(file);
    return `<div class="photo-item">
      <img src="${url}" alt="Seçilen fotoğraf">
      <button type="button" onclick="removeSelectedPhoto(${i})">×</button>
      <div class="photo-meta">${esc(file.name)}</div>
    </div>`;
  }).join('');
}

window.removeSelectedPhoto=i=>{
  selectedPhotoFiles.splice(i,1);
  renderSelectedPhotoPreview();
};

function renderExistingPhotos(){
  const box=$('existingPhotos');
  if(!box)return;
  box.innerHTML=retainedExistingPhotos.map((p,i)=>`
    <div class="photo-item">
      <img src="${esc(p.url)}" alt="${esc(p.name||'Faaliyet fotoğrafı')}">
      <button type="button" onclick="removeExistingPhoto(${i})">×</button>
      <div class="photo-meta">${esc(p.name||'Fotoğraf')}</div>
    </div>`).join('');
}

window.removeExistingPhoto=i=>{
  retainedExistingPhotos.splice(i,1);
  renderExistingPhotos();
};

const photoFilesInput=$('photoFiles');
if(photoFilesInput){
  photoFilesInput.addEventListener('change',e=>{
    selectedPhotoFiles=[...e.target.files];
    renderSelectedPhotoPreview();
  });
}

$('activityForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const data={
    date:$('date').value,title:$('title').value.trim(),
    branch:$('branch').value,
    branchName:departmentNameById($('branch').value),
    doctor:$('doctor').value,
    doctorName:doctorNameById($('doctor').value),
    type:$('type').value,
    platform:$('platform').value.trim(),
    socialLink:$('socialLink').value.trim(),
    photos:[...retainedExistingPhotos],
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

  if(savedActivity && selectedPhotoFiles.length){
    if(!window.medikentCloud?.enabled){
      alert("Fotoğraflar Firebase'e yüklenemedi çünkü bulut bağlantısı aktif değil.");
    }else{
      try{
        const uploaded = await window.medikentCloud.uploadActivityPhotos(savedActivity.id, selectedPhotoFiles);
        savedActivity.photos = [...(savedActivity.photos||[]), ...uploaded];
        const idx = activities.findIndex(a=>a.id===savedActivity.id);
        if(idx>=0) activities[idx]=savedActivity;
        save();
      }catch(err){
        console.error(err);
        alert("Fotoğraf yüklenemedi: " + (err.message || err));
      }
    }
  }

  if(window.medikentCloud?.enabled && savedActivity){
    try{
      await window.medikentCloud.saveActivity(savedActivity);
    }catch(err){
      console.error(err);
      alert("Kayıt yerelde kaydedildi ancak Firebase'e gönderilemedi: " + (err.message || err));
    }
  }

  resetForm(); renderAll();
  alert(editingId?'Kayıt güncellendi.':'Faaliyet kaydedildi.');
});

function resetForm(){
  $('activityForm').reset();
  selectedPhotoFiles=[];
  retainedExistingPhotos=[];
  if($('photoPreview')) $('photoPreview').innerHTML='';
  if($('existingPhotos')) $('existingPhotos').innerHTML='';
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
      <td>${esc(a.date)}</td><td>${esc(a.title)}</td><td>${esc(a.type)}</td><td>${esc(a.branchName || departmentNameById(a.branch) || a.branch)}</td><td>${esc(a.doctorName || doctorNameById(a.doctor) || a.doctor)}</td>
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
  let depValue=a.branch;
  if(!departments.some(d=>d.id===depValue)){
    const foundDep=departments.find(d=>d.name===a.branch || d.name===a.branchName);
    depValue=foundDep?.id || '';
  }
  $('branch').value=depValue;

  let docValue=a.doctor;
  if(!doctors.some(d=>d.id===docValue)){
    const foundDoc=doctors.find(d=>d.name===a.doctor || d.name===a.doctorName);
    docValue=foundDoc?.id || '';
  }
  updateDoctors(docValue);
  $('platform').value=a.platform||'';
  $('socialLink').value=a.socialLink||'';
  retainedExistingPhotos=Array.isArray(a.photos)?[...a.photos]:[];
  selectedPhotoFiles=[];
  renderExistingPhotos();
  renderSelectedPhotoPreview();
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

window.removeActivity=id=>{
  if(confirm('Bu kayıt silinsin mi?')){
    activities=activities.filter(a=>a.id!==id); save(); renderAll();
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
      ${a.branch||a.branchName?esc(a.branchName || departmentNameById(a.branch) || a.branch):''}${a.doctor||a.doctorName?' – '+esc(a.doctorName || doctorNameById(a.doctor) || a.doctor):''}
      ${a.type?'<br><i>'+esc(a.type)+(a.platform?' / '+esc(a.platform):'')+'</i>':''}
      ${a.socialLink?'<br><span>Bağlantı: '+esc(a.socialLink)+'</span>':''}
      ${a.note?'<br>'+esc(a.note):''}
      ${Array.isArray(a.photos)&&a.photos.length?'<div class="report-photo-grid">'+a.photos.map(p=>`<img src="${esc(p.url)}" alt="Faaliyet fotoğrafı">`).join('')+'</div>':''}
      </p>`).join('') || '<p>Bu ay için kayıt bulunmuyor.</p>'}
  `;
}

$('refreshStats').onclick=renderStats;
$('generateReport').onclick=generateReport;
$('searchInput').addEventListener('input',renderRecords);
$('printBtn').onclick=()=>window.print();

$('exportBtn').onclick=()=>{
  const payload={version:'2.1',activities,departments,doctors};
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
      if(Array.isArray(data.departments)) departments=data.departments;
      if(Array.isArray(data.doctors)) doctors=data.doctors;
    }
    save();
    saveMasterLocal();
    populateDefs(); renderAll();
    alert('Yedek geri yüklendi.');
  }catch{alert('Geçersiz yedek dosyası.');}
});



const departmentForm=$('departmentForm');
if(departmentForm){
  departmentForm.addEventListener('submit',async e=>{
    e.preventDefault();
    const name=$('departmentName').value.trim();
    if(!name)return;
    if(departments.some(d=>d.name.toLocaleLowerCase('tr')===name.toLocaleLowerCase('tr'))){
      alert('Bu bölüm zaten tanımlı.');
      return;
    }
    const dep={id:crypto.randomUUID(),name};
    departments.push(dep);
    saveMasterLocal();
    populateDefs();
    departmentForm.reset();
    if(window.medikentCloud?.enabled){
      try{await window.medikentCloud.saveDepartment(dep);}
      catch(err){console.error(err);alert("Bölüm yerelde kaydedildi ancak Firebase'e gönderilemedi.");}
    }
  });
}

const doctorForm=$('doctorForm');
if(doctorForm){
  doctorForm.addEventListener('submit',async e=>{
    e.preventDefault();
    const departmentId=$('doctorDepartment').value;
    const name=$('doctorName').value.trim();
    if(!departmentId||!name)return;
    if(doctors.some(d=>d.name.toLocaleLowerCase('tr')===name.toLocaleLowerCase('tr'))){
      alert('Bu doktor zaten tanımlı.');
      return;
    }
    const doctor={id:crypto.randomUUID(),name,departmentId,active:true};
    doctors.push(doctor);
    saveMasterLocal();
    populateDefs();
    doctorForm.reset();
    if(window.medikentCloud?.enabled){
      try{await window.medikentCloud.saveDoctor(doctor);}
      catch(err){console.error(err);alert("Doktor yerelde kaydedildi ancak Firebase'e gönderilemedi.");}
    }
  });
}

window.saveDepartmentEdit=async id=>{
  const dep=departments.find(d=>d.id===id); if(!dep)return;
  const input=document.getElementById(`dep-name-${id}`);
  const name=(input?.value||'').trim();
  if(!name){ alert('Bölüm adı boş olamaz.'); return; }
  if(departments.some(d=>d.id!==id && d.name.toLocaleLowerCase('tr')===name.toLocaleLowerCase('tr'))){
    alert('Bu bölüm adı zaten mevcut.');
    return;
  }
  dep.name=name;
  saveMasterLocal();
  populateDefs();
  renderAll();
  if(window.medikentCloud?.enabled){
    try{ await window.medikentCloud.saveDepartment(dep); }
    catch(err){ console.error(err); alert("Bölüm güncellendi ancak Firebase'e gönderilemedi."); }
  }
  alert('Bölüm güncellendi.');
};

window.saveDoctorEdit=async id=>{
  const d=doctors.find(x=>x.id===id); if(!d)return;
  const name=(document.getElementById(`doc-name-${id}`)?.value||'').trim();
  const departmentId=document.getElementById(`doc-dep-${id}`)?.value||'';
  if(!name || !departmentId){ alert('Doktor adı ve bölüm zorunludur.'); return; }
  if(doctors.some(x=>x.id!==id && x.name.toLocaleLowerCase('tr')===name.toLocaleLowerCase('tr'))){
    alert('Bu doktor zaten mevcut.');
    return;
  }
  d.name=name;
  d.departmentId=departmentId;
  saveMasterLocal();
  populateDefs();
  renderAll();
  if(window.medikentCloud?.enabled){
    try{ await window.medikentCloud.saveDoctor(d); }
    catch(err){ console.error(err); alert("Doktor güncellendi ancak Firebase'e gönderilemedi."); }
  }
  alert('Doktor güncellendi.');
};

window.toggleDoctor=async id=>{
  const d=doctors.find(x=>x.id===id); if(!d)return;
  d.active=d.active===false?true:false;
  saveMasterLocal(); populateDefs(); renderAll();
  if(window.medikentCloud?.enabled){
    try{await window.medikentCloud.saveDoctor(d);}
    catch(err){console.error(err);alert("Doktor durumu değişti ancak Firebase'e gönderilemedi.");}
  }
};

async function loadMasterCloud(){
  if(!window.medikentCloud?.enabled) return;

  try{
    const [cloudDeps, cloudDocs] = await Promise.all([
      window.medikentCloud.loadDepartments(),
      window.medikentCloud.loadDoctors()
    ]);

    // Önce yerelde zorunlu 14 bölümü garanti et.
    ensureRequiredDepartmentsLocal();

    // Buluttaki bölümleri yerel listeyle birleştir.
    const merged = [];
    const seen = new Set();

    for(const dep of [...departments, ...(Array.isArray(cloudDeps) ? cloudDeps : [])]){
      const key=(dep.name||'').trim().toLocaleLowerCase('tr');
      if(key && !seen.has(key)){
        merged.push(dep);
        seen.add(key);
      }
    }

    // Zorunlu 14 bölümü son kez garanti et.
    for(const dep of REQUIRED_DEPARTMENTS){
      const key=dep.name.trim().toLocaleLowerCase('tr');
      if(!seen.has(key)){
        merged.push({...dep});
        seen.add(key);
      }
    }

    departments = merged;
    saveMasterLocal();

    // Firebase'de eksik olan zorunlu bölümleri ekle.
    const cloudNames = new Set(
      (Array.isArray(cloudDeps) ? cloudDeps : [])
        .map(d => (d.name||'').trim().toLocaleLowerCase('tr'))
    );

    for(const dep of REQUIRED_DEPARTMENTS){
      const key=dep.name.trim().toLocaleLowerCase('tr');
      if(!cloudNames.has(key)){
        await window.medikentCloud.saveDepartment(dep);
      }
    }

    // Doktorları buluttan al; bulut boşsa yereli gönder.
    if(Array.isArray(cloudDocs) && cloudDocs.length){
      doctors = cloudDocs;
    }else{
      for(const d of doctors){
        await window.medikentCloud.saveDoctor(d);
      }
    }

    // Eski bölüm kimliği uyumluluğu
    for(const d of doctors){
      if(d.departmentId === 'dep-cocuk'){
        d.departmentId = 'dep-cocuk-sagligi';
        await window.medikentCloud.saveDoctor(d);
      }
    }

    saveMasterLocal();
    populateDefs();
    renderMasterLists();
    renderAll();

  }catch(err){
    console.error(err);
    // Firebase hata verse bile Tanımlar boş kalmasın.
    ensureRequiredDepartmentsLocal();
    populateDefs();
    renderMasterLists();
    renderAll();
    alert("Firebase senkronunda sorun oluştu; bölümler yerel olarak gösteriliyor.");
  }
}
window.addEventListener("medikent-cloud-ready",loadMasterCloud);

const cloudUploadBtn = document.getElementById("cloudUploadBtn");
if(cloudUploadBtn){
  cloudUploadBtn.onclick = async ()=>{
    if(!window.medikentCloud?.enabled){
      alert("Önce Google hesabınızla giriş yapın.");
      return;
    }
    if(!activities.length){
      alert("Aktarılacak kayıt bulunmuyor.");
      return;
    }
    if(!confirm(`${activities.length} kayıt Firebase'e aktarılacak. Devam edilsin mi?`)) return;

    cloudUploadBtn.disabled = true;
    const status = document.getElementById("cloudTransferStatus");
    if(status) status.textContent = "Buluta aktarılıyor...";

    try{
      const count = await window.medikentCloud.uploadActivities(activities);
      if(status) status.textContent = `${count} kayıt Firebase'e aktarıldı.`;
      alert(`${count} kayıt buluta aktarıldı.`);
      await loadCloudIfAvailable();
    }catch(err){
      console.error(err);
      if(status) status.textContent = "Aktarım başarısız.";
      alert("Buluta aktarım başarısız: " + (err.message || err));
    }finally{
      cloudUploadBtn.disabled = false;
    }
  };
}

function renderAll(){renderStats();renderRecords();generateReport();}
ensureRequiredDepartmentsLocal();
populateDefs();
toggleConditionalFields();
renderAll();
