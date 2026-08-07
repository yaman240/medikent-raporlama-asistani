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

const OFFICIAL_SEED_DOCTORS = [
  // Çocuk Sağlığı ve Hastalıkları
  {name:'Uzm. Dr. Metin TAN', departmentName:'Çocuk Sağlığı ve Hastalıkları'},
  {name:'Uzm. Dr. Aydın VAROL', departmentName:'Çocuk Sağlığı ve Hastalıkları'},
  {name:'Uzm. Dr. Gökhan GÖZÜN', departmentName:'Çocuk Sağlığı ve Hastalıkları'},

  // Çocuk Cerrahisi
  {name:'Op. Dr. Mehmet ÇAKMAK', departmentName:'Çocuk Cerrahisi'},

  // Kadın Hastalıkları ve Doğum
  {name:'Prof. Dr. Hasan KAFALI', departmentName:'Kadın Hastalıkları ve Doğum'},
  {name:'Op. Dr. Argun TUĞRAN', departmentName:'Kadın Hastalıkları ve Doğum'},
  {name:'Op. Dr. Sevgin MERT', departmentName:'Kadın Hastalıkları ve Doğum'},
  {name:'Uzm. Dr. Gökçem Büşra İNANÇ KARAMAN', departmentName:'Kadın Hastalıkları ve Doğum'},
  {name:'Dr. Mustafa YILDIZ', departmentName:'Kadın Hastalıkları ve Doğum'},

  // Genel Cerrahi
  {name:'Op. Dr. Ferhat GEGA', departmentName:'Genel Cerrahi'},
  {name:'Op. Dr. İbrahim KARAMANOĞLU', departmentName:'Genel Cerrahi'},
  {name:'Op. Dr. Mustafa TERCAN', departmentName:'Genel Cerrahi'},

  // Kulak Burun Boğaz
  {name:'Prof. Dr. M. Kemal ADALI', departmentName:'Kulak Burun Boğaz'},
  {name:'Op. Dr. İlhan ALTEKİN', departmentName:'Kulak Burun Boğaz'},
  {name:'Dr. Celal KALKIŞIM', departmentName:'Kulak Burun Boğaz'},

  // Ortopedi ve Travmatoloji
  {name:'Op. Dr. Teoman DURUKAN', departmentName:'Ortopedi ve Travmatoloji'},
  {name:'Op. Dr. Zafer GÜNEŞ', departmentName:'Ortopedi ve Travmatoloji'},
  {name:'Op. Dr. Mahmut Sami OFLAZ', departmentName:'Ortopedi ve Travmatoloji'},

  // Kalp ve Damar Cerrahisi
  {name:'Prof. Dr. Turan EGE', departmentName:'Kalp ve Damar Cerrahisi'},
  {name:'Op. Dr. Ahmet ŞAMİÖZEN', departmentName:'Kalp ve Damar Cerrahisi'},

  // Kardiyoloji
  {name:'Uzm. Dr. Haydar Başar CENGİZ', departmentName:'Kardiyoloji'},
  {name:'Uzm. Dr. Barış AYGÜÇ', departmentName:'Kardiyoloji'},

  // Beyin ve Sinir Cerrahisi
  {name:'Op. Dr. Bahadır ALKAN', departmentName:'Beyin ve Sinir Cerrahisi'},

  // Üroloji
  {name:'Prof. Dr. İrfan H. ATAKAN', departmentName:'Üroloji'},
  {name:'Op. Dr. H. Korhan ALTAN', departmentName:'Üroloji'},

  // Cildiye
  {name:'Uzm. Dr. Boratay Erin DEMİREL', departmentName:'Cildiye (Dermatoloji)'},

  // İç Hastalıkları
  {name:'Uzm. Dr. Ferdanes MUTLU', departmentName:'İç Hastalıkları (Dahiliye)'},
  {name:'Uzm. Dr. Nehir Özlem PEHLİVAN', departmentName:'İç Hastalıkları (Dahiliye)'},
  {name:'Uzm. Dr. Selçuk ÇUKUROVA', departmentName:'İç Hastalıkları (Dahiliye)'}
];

function deterministicDoctorId(name){
  return 'doc-' + String(name)
    .toLocaleLowerCase('tr')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .replace(/ı/g,'i')
    .replace(/ğ/g,'g')
    .replace(/ü/g,'u')
    .replace(/ş/g,'s')
    .replace(/ö/g,'o')
    .replace(/ç/g,'c')
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-|-$/g,'');
}

function ensureOfficialDoctorsLocal(){
  let changed=false;

  for(const seed of OFFICIAL_SEED_DOCTORS){
    const dep=departments.find(d=>normalizeTr(d.name)===normalizeTr(seed.departmentName));
    if(!dep) continue;

    const exists=doctors.some(d=>normalizeTr(d.name)===normalizeTr(seed.name));
    if(exists) continue;

    doctors.push({
      id:deterministicDoctorId(seed.name),
      name:seed.name,
      departmentId:dep.id,
      departmentName:dep.name,
      active:true,
      source:'Medikent resmi hekim listesi'
    });
    changed=true;
  }

  if(changed) saveMasterLocal();
}


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
  {id:'doc-gokhan-gozun', name:'Uzm. Dr. Gökhan GÖZÜN', departmentId:'dep-cocuk-sagligi', departmentName:'Çocuk Sağlığı ve Hastalıkları', active:true}
];

function saveMasterLocal(){
  localStorage.setItem('medikent_departments_v21', JSON.stringify(departments));
  localStorage.setItem('medikent_doctors_v21', JSON.stringify(doctors));
}
saveMasterLocal();



ensureOfficialDoctorsLocal();

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
      const latest=latestActivityMonth();
      if(monthFilter) monthFilter.value=latest;
      if(reportMonth) reportMonth.value=latest;
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

const PHOTO_DB_NAME='medikent-raporlama-photos';
const PHOTO_STORE='activityPhotos';

function openPhotoDb(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(PHOTO_DB_NAME,1);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains(PHOTO_STORE)){
        db.createObjectStore(PHOTO_STORE,{keyPath:'activityId'});
      }
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}

async function getLocalPhotos(activityId){
  if(!activityId) return [];
  const db=await openPhotoDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(PHOTO_STORE,'readonly');
    const store=tx.objectStore(PHOTO_STORE);
    const req=store.get(activityId);
    req.onsuccess=()=>resolve(req.result?.photos || []);
    req.onerror=()=>reject(req.error);
  });
}

async function setLocalPhotos(activityId,photos){
  const db=await openPhotoDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(PHOTO_STORE,'readwrite');
    tx.objectStore(PHOTO_STORE).put({activityId,photos});
    tx.oncomplete=()=>resolve();
    tx.onerror=()=>reject(tx.error);
  });
}

function fileToDataUrl(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(reader.result);
    reader.onerror=reject;
    reader.readAsDataURL(file);
  });
}

async function compressImageFile(file){
  const raw=await fileToDataUrl(file);
  const img=await new Promise((resolve,reject)=>{
    const i=new Image();
    i.onload=()=>resolve(i);
    i.onerror=reject;
    i.src=raw;
  });

  const MAX=1600;
  let w=img.width, h=img.height;
  if(w>MAX || h>MAX){
    const ratio=Math.min(MAX/w,MAX/h);
    w=Math.round(w*ratio);
    h=Math.round(h*ratio);
  }

  const canvas=document.createElement('canvas');
  canvas.width=w; canvas.height=h;
  const ctx=canvas.getContext('2d');
  ctx.drawImage(img,0,0,w,h);

  const dataUrl=canvas.toDataURL('image/jpeg',0.82);
  return {
    name:(file.name||'fotoğraf').replace(/\.[^.]+$/,'.jpg'),
    dataUrl
  };
}

async function prepareSelectedPhotos(){
  const out=[];
  for(const file of selectedPhotoFiles){
    out.push(await compressImageFile(file));
  }
  return out;
}

const monthFilter=$('monthFilter');
const reportMonth=$('reportMonth');
function currentMonthValue(){
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}
function latestActivityMonth(){
  const months=activities.map(a=>monthOf(a.date)).filter(Boolean).sort();
  return months.length ? months[months.length-1] : currentMonthValue();
}
const defaultMonth=latestActivityMonth();
monthFilter.value=defaultMonth;
reportMonth.value=defaultMonth;

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
  return departments.find(d=>d.id===id)?.name || '';
}

function normalizeTr(s=''){
  return String(s).trim().toLocaleLowerCase('tr');
}

function departmentByAny(value){
  if(!value) return null;
  return departments.find(d=>d.id===value) ||
         departments.find(d=>normalizeTr(d.name)===normalizeTr(value)) ||
         null;
}

function doctorNameById(id){
  return doctors.find(d=>d.id===id)?.name || '';
}

function doctorMatchesDepartment(doctor, selectedDepartmentId){
  if(!doctor || doctor.active===false) return false;

  const selectedDep = departmentByAny(selectedDepartmentId);
  if(!selectedDep) return false;

  // 1) Doğrudan ID eşleşmesi
  if(doctor.departmentId && doctor.departmentId===selectedDep.id) return true;

  // 2) Doktor kaydındaki bölüm adı eşleşmesi
  if(doctor.departmentName &&
     normalizeTr(doctor.departmentName)===normalizeTr(selectedDep.name)) return true;

  // 3) Eski ID'yi bölüm adına çevirerek eşleştir
  const doctorDep = departmentByAny(doctor.departmentId);
  if(doctorDep &&
     normalizeTr(doctorDep.name)===normalizeTr(selectedDep.name)) return true;

  return false;
}

function updateDoctors(selected=''){
  const departmentId=$('branch').value;
  const filtered=doctors
    .filter(d=>doctorMatchesDepartment(d,departmentId))
    .sort((a,b)=>a.name.localeCompare(b.name,'tr'));

  $('doctor').innerHTML='<option value="">Doktor seçiniz</option>'+
    filtered.map(d=>`<option value="${esc(d.id)}">${esc(d.name)}</option>`).join('');

  if(selected && filtered.some(d=>d.id===selected)){
    $('doctor').value=selected;
  }

  if(departmentId && filtered.length===0){
    $('doctor').innerHTML='<option value="">Bu bölüm için aktif doktor tanımlanmamış</option>';
  }
}

function renderMasterLists(){
  const depList=$('departmentList');
  if(depList){
    depList.innerHTML=departments.slice().sort((a,b)=>a.name.localeCompare(b.name,'tr')).map(d=>{
      const linked=doctors.filter(x=>doctorMatchesDepartment(x,d.id) || (x.departmentId===d.id)).length;
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
              `<option value="${esc(dep.id)}" ${
                dep.id===d.departmentId ||
                normalizeTr(dep.name)===normalizeTr(d.departmentName||'')
                ?'selected':''
              }>${esc(dep.name)}</option>`
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

$('branch').addEventListener('change',()=>{
  $('doctor').value='';
  updateDoctors();
});
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
      <img src="${esc(p.dataUrl || p.url || '')}" alt="${esc(p.name||'Faaliyet fotoğrafı')}">
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

  const editingId=$('editingId').value;
  const activityId=editingId || crypto.randomUUID();
  const existing=editingId ? activities.find(a=>a.id===editingId) : null;

  let localPhotos=[...retainedExistingPhotos];

  try{
    if(selectedPhotoFiles.length){
      const prepared=await prepareSelectedPhotos();
      localPhotos=[...localPhotos,...prepared];
    }
    await setLocalPhotos(activityId,localPhotos);
  }catch(err){
    console.error(err);
    alert("Fotoğraflar bu cihazda saklanamadı: "+(err.message||err));
    return;
  }

  const data={
    id:activityId,
    date:$('date').value,
    title:$('title').value.trim(),
    reportTopic:$('reportTopic').value.trim(),
    branch:$('branch').value,
    branchName:departmentNameById($('branch').value),
    doctor:$('doctor').value,
    doctorName:doctorNameById($('doctor').value),
    type:$('type').value,
    platform:$('platform').value.trim(),
    socialLink:$('socialLink').value.trim(),
    localPhotoCount:localPhotos.length,
    views:+$('views').value||0,
    reach:+$('reach').value||0,
    likes:+$('likes').value||0,
    engagement:+$('engagement').value||0,
    participants:+$('participants').value||0,
    note:$('note').value.trim()
  };

  const draft={...(existing||{}),...data};

  if(window.medikentCloud?.enabled){
    try{
      await window.medikentCloud.saveActivity(draft);
    }catch(err){
      console.error(err);
      alert("Faaliyet Firebase'e kaydedilemedi: "+(err.message||err));
      return;
    }
  }

  const idx=activities.findIndex(a=>a.id===activityId);
  if(idx>=0) activities[idx]=draft;
  else activities.push(draft);

  save();

  const savedMonth=monthOf(draft.date);
  if(savedMonth){
    monthFilter.value=savedMonth;
    reportMonth.value=savedMonth;
  }

  resetForm();
  renderAll();
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
      <td>${a.views?fmt(a.views)+' görüntülenme':a.participants?fmt(a.participants)+' katılımcı':esc(a.platform||'-')}
      ${(+a.localPhotoCount||0)?`<br><span class="meta">📷 ${a.localPhotoCount} fotoğraf (bu cihaz)</span>`:''}</td>
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
  $('reportTopic').value=a.reportTopic||'';
  $('type').value=a.type;
  let depValue=a.branch;
  if(!departments.some(d=>d.id===depValue)){
    const foundDep=departments.find(d=>d.name===a.branch || d.name===a.branchName);
    depValue=foundDep?.id || '';
  }
  $('branch').value=depValue;

  let docValue=a.doctor;
  if(!doctors.some(d=>d.id===docValue)){
    const foundDoc=doctors.find(d=>
      normalizeTr(d.name)===normalizeTr(a.doctor||'') ||
      normalizeTr(d.name)===normalizeTr(a.doctorName||'')
    );
    docValue=foundDoc?.id || '';
  }
  updateDoctors(docValue);
  $('platform').value=a.platform||'';
  $('socialLink').value=a.socialLink||'';
  selectedPhotoFiles=[];
  retainedExistingPhotos=[];
  getLocalPhotos(a.id).then(photos=>{
    retainedExistingPhotos=photos;
    renderExistingPhotos();
  }).catch(console.error);
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

window.removeActivity=async id=>{
  if(!confirm('Bu kayıt silinsin mi?')) return;

  if(window.medikentCloud?.enabled){
    try{
      await window.medikentCloud.deleteActivity(id);
    }catch(err){
      console.error(err);
      alert("Kayıt Firebase'den silinemedi: "+(err.message||err));
      return;
    }
  }

  activities=activities.filter(a=>a.id!==id);
  save();
  renderAll();
};

function trDate(dateStr){
  if(!dateStr) return '';
  const [y,m,d]=dateStr.split('-');
  const months=['','OCAK','ŞUBAT','MART','NİSAN','MAYIS','HAZİRAN','TEMMUZ','AĞUSTOS','EYLÜL','EKİM','KASIM','ARALIK'];
  return `${Number(d)} ${months[Number(m)]} ${y}`;
}

function filteredReportRows(){
  const m=$('reportMonth').value;
  const topic=($('reportTopicFilter').value||'').trim().toLocaleLowerCase('tr');
  return getMonthData(m)
    .filter(a=>{
      if(!topic) return true;
      const source=(a.reportTopic||a.title||'').toLocaleLowerCase('tr');
      return source.includes(topic);
    })
    .sort((a,b)=>a.date.localeCompare(b.date));
}

function reportFileBase(){
  const m=$('reportMonth').value||'rapor';
  const topic=($('reportTopicFilter').value||'faaliyet')
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu,'-')
    .replace(/^-|-$/g,'')
    .toLocaleLowerCase('tr');
  return `medikent-${topic||'faaliyet'}-${m}`;
}

function autoClosingText(rows, monthLabel, topicLabel){
  const total=(k)=>rows.reduce((s,a)=>s+(+a[k]||0),0);
  const participants=total('participants');
  const views=total('views');
  const reach=total('reach');
  const engagement=total('engagement');

  let text=`${monthLabel} boyunca ${topicLabel ? topicLabel + ' kapsamında ' : ''}${rows.length} faaliyet gerçekleştirildi.`;
  if(views) text+=` Faaliyetlerin toplam görüntülenme sayısı ${fmt(views)} olarak kaydedildi.`;
  if(reach) text+=` Toplam erişim ${fmt(reach)} oldu.`;
  if(engagement) text+=` Toplam etkileşim ${fmt(engagement)} olarak gerçekleşti.`;
  if(participants) text+=` Yüz yüze etkinlik ve eğitimlere toplam ${fmt(participants)} kişi katıldı.`;
  return text;
}

async function generateReport(){
  const m=$('reportMonth').value;
  const rows=filteredReportRows();
  const [y,mo]=m.split('-');
  const monthNames=['','Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  const monthLabel=`${monthNames[+mo]} ${y}`;
  const topicRaw=($('reportTopicFilter').value||'').trim();
  const inferredTopic = topicRaw || [...new Set(rows.map(a=>a.reportTopic).filter(Boolean))].join(' / ') || 'Faaliyet';
  const headingTopic=inferredTopic.toLocaleUpperCase('tr');

  const total=(k)=>rows.reduce((s,a)=>s+(+a[k]||0),0);
  const closingManual=($('reportClosingText').value||'').trim();
  const closing=closingManual || autoClosingText(rows, monthLabel, inferredTopic);

  const activityBlocks=[];
  for(const a of rows){
    const stats=[];
    if(+a.views) stats.push(`<li>Görüntülenme: <b>${fmt(a.views)}</b></li>`);
    if(+a.reach) stats.push(`<li>Erişim: <b>${fmt(a.reach)}</b></li>`);
    if(+a.likes) stats.push(`<li>Beğeni: <b>${fmt(a.likes)}</b></li>`);
    if(+a.engagement) stats.push(`<li>Etkileşim: <b>${fmt(a.engagement)}</b></li>`);
    if(+a.participants) stats.push(`<li>Katılımcı: <b>${fmt(a.participants)}</b></li>`);

    let photos=[];
    try{ photos=await getLocalPhotos(a.id); }catch(err){ console.warn(err); }

    activityBlocks.push(`
      <div class="report-section">
        <div class="report-date">${esc(trDate(a.date))}</div>
        <div><b>${esc(a.title||'')}</b></div>
        <div class="report-doctor">
          ${esc(a.branchName || departmentNameById(a.branch) || a.branch || '')}
          ${(a.doctorName || doctorNameById(a.doctor) || a.doctor) ? ' – ' + esc(a.doctorName || doctorNameById(a.doctor) || a.doctor) : ''}
        </div>
        ${a.platform?`<div><i>${esc(a.platform)}</i></div>`:''}
        ${stats.length?`<ul class="report-stats">${stats.join('')}</ul>`:''}
        ${a.note?`<p>${esc(a.note)}</p>`:''}
        ${a.socialLink?`<div class="report-link">Bağlantı: ${esc(a.socialLink)}</div>`:''}
        ${photos.length?`<div class="report-photo-grid">${photos.map(p=>`<img src="${p.dataUrl}" alt="Faaliyet fotoğrafı">`).join('')}</div>`:''}
      </div>
      <hr class="report-divider">
    `);
  }

  $('reportOutput').innerHTML=`
    <div class="report-header">
      <h1>MEDİKENT HASTANESİ</h1>
      <h2>${esc(headingTopic)} ${esc(monthNames[+mo].toLocaleUpperCase('tr'))} AYI ÇALIŞMALARI</h2>
    </div>

    ${activityBlocks.join('') || '<p>Seçilen ay ve konu için faaliyet bulunamadı.</p>'}

    ${rows.length?`
      <div class="report-summary">
        <h3>${esc(monthLabel)} Aylık Özet</h3>
        <div class="report-summary-grid">
          <div><b>Toplam Faaliyet</b><br>${rows.length}</div>
          <div><b>Toplam Görüntülenme</b><br>${fmt(total('views'))}</div>
          <div><b>Toplam Erişim</b><br>${fmt(total('reach'))}</div>
          <div><b>Toplam Etkileşim</b><br>${fmt(total('engagement'))}</div>
          <div><b>Toplam Beğeni</b><br>${fmt(total('likes'))}</div>
          <div><b>Toplam Katılımcı</b><br>${fmt(total('participants'))}</div>
        </div>
        <div class="report-closing">
          <h3>Değerlendirme</h3>
          <p>${esc(closing)}</p>
        </div>
      </div>`:''}
  `;
}
async function reportHtmlWithEmbeddedImages(){
  const clone=$('reportOutput').cloneNode(true);
  const imgs=[...clone.querySelectorAll('img')];

  for(const img of imgs){
    try{
      const resp=await fetch(img.src);
      const blob=await resp.blob();
      const dataUrl=await new Promise((resolve,reject)=>{
        const reader=new FileReader();
        reader.onload=()=>resolve(reader.result);
        reader.onerror=reject;
        reader.readAsDataURL(blob);
      });
      img.src=dataUrl;
    }catch(err){
      console.warn('Word için fotoğraf gömülemedi:',err);
    }
  }

  return clone.innerHTML;
}

async function downloadWordReport(){
  await generateReport();
  const body=await reportHtmlWithEmbeddedImages();
  const css=`
    body{font-family:Arial,sans-serif;color:#111}
    .report-header{text-align:center;margin-bottom:24px}
    .report-header h1{font-size:18pt;margin:0 0 8pt}
    .report-header h2{font-size:16pt;margin:0}
    .report-section{margin:18pt 0}
    .report-date{font-weight:bold;margin-bottom:5pt}
    .report-doctor{font-weight:bold}
    .report-photo-grid{margin:10pt 0}
    .report-photo-grid img{width:45%;max-height:240px;object-fit:cover;margin:4pt}
    .report-summary{margin-top:24pt;border-top:2px solid #222;padding-top:10pt}
    .report-summary-grid div{margin:4pt 0}
    .report-link{font-size:9pt}
  `;
  const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${body}</body></html>`;
  const blob=new Blob(['\ufeff',html],{type:'application/msword'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=reportFileBase()+'.doc';
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}

async function downloadPdfReport(){
  await generateReport();
  const element=$('reportOutput');
  const opt={
    margin:[10,10,10,10],
    filename:reportFileBase()+'.pdf',
    image:{type:'jpeg',quality:0.96},
    html2canvas:{scale:2,useCORS:true,allowTaint:false},
    jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},
    pagebreak:{mode:['css','legacy'],avoid:['.report-section']}
  };
  await html2pdf().set(opt).from(element).save();
}

$('refreshStats').onclick=renderStats;
$('generateReport').onclick=()=>generateReport();
$('downloadWordBtn').onclick=downloadWordReport;
$('downloadPdfBtn').onclick=downloadPdfReport;
$('searchInput').addEventListener('input',renderRecords);
$('reportTopicFilter').addEventListener('input',()=>generateReport());
$('reportMonth').addEventListener('change',()=>generateReport());
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

    if(!departmentId || !name){
      alert('Bölüm ve doktor adı zorunludur.');
      return;
    }

    if(doctors.some(d=>d.name.toLocaleLowerCase('tr')===name.toLocaleLowerCase('tr'))){
      alert('Bu doktor zaten tanımlı.');
      return;
    }

    const dep=departmentByAny(departmentId);
    const doctor={
      id:crypto.randomUUID(),
      name,
      departmentId: dep?.id || departmentId,
      departmentName: dep?.name || '',
      active:true
    };

    if(window.medikentCloud?.enabled){
      try{
        await window.medikentCloud.saveDoctor(doctor);
      }catch(err){
        console.error(err);
        alert("Doktor Firebase'e kaydedilemedi. Kayıt tamamlanmadı: "+(err.message||err));
        return;
      }
    }

    doctors.push(doctor);
    saveMasterLocal();
    populateDefs();
    renderMasterLists();

    // Faaliyet ekranında aynı bölüm seçiliyse doktor listesine anında düşür.
    if($('branch').value===doctor.departmentId){
      updateDoctors(doctor.id);
    }

    doctorForm.reset();
    alert('Doktor kaydedildi.');
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
  const dep=departmentByAny(departmentId);
  d.name=name;
  d.departmentId=dep?.id || departmentId;
  d.departmentName=dep?.name || '';
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
  if($('branch').value===d.departmentId){ updateDoctors(); }
  if($('branch').value===d.departmentId){ updateDoctors(d.id); }
  if(window.medikentCloud?.enabled){
    try{await window.medikentCloud.saveDoctor(d);}
    catch(err){console.error(err);alert("Doktor durumu değişti ancak Firebase'e gönderilemedi.");}
  }
};

async function loadMasterCloud(){
  if(!window.medikentCloud?.enabled) return;

  try{
    const [cloudDeps, cloudDocs]=await Promise.all([
      window.medikentCloud.loadDepartments(),
      window.medikentCloud.loadDoctors()
    ]);

    ensureRequiredDepartmentsLocal();

    const cloudDepartments=Array.isArray(cloudDeps)?cloudDeps:[];
    const cloudDoctors=Array.isArray(cloudDocs)?cloudDocs:[];

    // 1) Tek bir canonical bölüm listesi oluştur.
    // Hazır bölümler öncelikli; aynı isimli eski Firebase bölümü tekrar eklenmez.
    const canonicalByName=new Map();
    const mergedDepartments=[];

    for(const dep of REQUIRED_DEPARTMENTS){
      const key=normalizeTr(dep.name);
      const item={...dep};
      canonicalByName.set(key,item);
      mergedDepartments.push(item);
    }

    // Kullanıcının sonradan eklediği özel bölümleri de koru.
    for(const dep of [...departments,...cloudDepartments]){
      if(!dep?.name) continue;
      const key=normalizeTr(dep.name);
      if(!canonicalByName.has(key)){
        canonicalByName.set(key,{...dep});
        mergedDepartments.push({...dep});
      }
    }

    departments=mergedDepartments;

    // 2) ESKİ FIREBASE BÖLÜM ID -> CANONICAL BÖLÜM eşleme tablosu.
    // Doktor kaybolmasının ana sebebi buydu.
    const departmentAliasById=new Map();

    for(const oldDep of cloudDepartments){
      if(!oldDep?.id || !oldDep?.name) continue;
      const canonical=canonicalByName.get(normalizeTr(oldDep.name));
      if(canonical){
        departmentAliasById.set(oldDep.id,canonical);
      }
    }

    // Yerel eski ID'ler için de alias kur.
    for(const oldDep of departments){
      if(!oldDep?.id || !oldDep?.name) continue;
      const canonical=canonicalByName.get(normalizeTr(oldDep.name));
      if(canonical){
        departmentAliasById.set(oldDep.id,canonical);
      }
    }

    // Bilinen eski ID.
    const childCanonical=canonicalByName.get(normalizeTr('Çocuk Sağlığı ve Hastalıkları'));
    if(childCanonical){
      departmentAliasById.set('dep-cocuk',childCanonical);
    }

    saveMasterLocal();

    // 3) Firebase'de eksik canonical bölümleri ekle.
    const cloudNames=new Set(cloudDepartments.map(d=>normalizeTr(d.name||'')));
    for(const dep of departments){
      const key=normalizeTr(dep.name);
      if(!cloudNames.has(key)){
        await window.medikentCloud.saveDepartment(dep);
      }
    }

    // 4) Doktorları yerel + bulut birleştir.
    const doctorMap=new Map();
    for(const d of [...doctors,...cloudDoctors]){
      if(!d?.id) continue;
      // Buluttaki sürüm varsa onu sonradan geldiği için esas alır.
      doctorMap.set(d.id,{...d});
    }
    doctors=[...doctorMap.values()];

    // 5) Her doktorun bölümünü eski ID veya bölüm adından canonical bölüme taşı.
    for(const d of doctors){
      let canonical=null;

      if(d.departmentName){
        canonical=canonicalByName.get(normalizeTr(d.departmentName)) || null;
      }

      if(!canonical && d.departmentId){
        canonical=departmentAliasById.get(d.departmentId) || null;
      }

      // departmentId aslında bölüm adı olarak kaydedilmiş eski kayıt desteği
      if(!canonical && d.departmentId){
        canonical=canonicalByName.get(normalizeTr(d.departmentId)) || null;
      }

      if(canonical){
        const changed =
          d.departmentId!==canonical.id ||
          d.departmentName!==canonical.name;

        d.departmentId=canonical.id;
        d.departmentName=canonical.name;

        if(changed){
          await window.medikentCloud.saveDoctor(d);
        }
      }
    }

    // Yerelde olup bulutta bulunmayan doktorları da buluta gönder.
    const cloudDoctorIds=new Set(cloudDoctors.map(d=>d.id));
    for(const d of doctors){
      if(!cloudDoctorIds.has(d.id)){
        await window.medikentCloud.saveDoctor(d);
      }
    }

    saveMasterLocal();

    // Resmî başlangıç kadrosundan eksik olanları yerelde ekle.
    ensureOfficialDoctorsLocal();

    // Yeni eklenen resmî doktorlardan Firebase'de olmayanları gönder.
    const existingCloudDoctorNames=new Set(cloudDoctors.map(d=>normalizeTr(d.name||'')));
    for(const d of doctors){
      if(!existingCloudDoctorNames.has(normalizeTr(d.name||''))){
        await window.medikentCloud.saveDoctor(d);
      }
    }

    saveMasterLocal();
    populateDefs();
    renderMasterLists();
    renderAll();

  }catch(err){
    console.error(err);
    ensureRequiredDepartmentsLocal();
    populateDefs();
    renderMasterLists();
    renderAll();
    alert("Bölüm/Doktor senkronunda sorun oluştu: "+(err.message||err));
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

function renderAll(){renderStats();renderRecords();generateReport().catch(console.error);}
ensureRequiredDepartmentsLocal();
populateDefs();
toggleConditionalFields();
renderAll();
