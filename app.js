const KEY='medikent_raporlama_v1';

const defaultTypes = [
  'Sosyal Medya','Basın / Haber','Video','Eğitim','Gebe Okulu',
  'Sağlık Taraması','Farkındalık Etkinliği','Doktor Röportajı',
  'TV Programı','Radyo','Etkinlik','Diğer'
];

let departments=[];
let doctors=[];

// Eski Supabase/yerel sürümden kalmış faaliyetler varsa Supabase'e aktarabilmek için saklanır.
let activities = JSON.parse(localStorage.getItem(KEY) || '[]');

function localSave(){
  localStorage.setItem(KEY,JSON.stringify(activities));
}
function save(){ localSave(); }

async function loadCloudIfAvailable(){
  if(!window.medikentCloud?.enabled) return;

  try{
    const [cloudDeps,cloudDocs,cloudRows]=await Promise.all([
      window.medikentCloud.loadDepartments(),
      window.medikentCloud.loadDoctors(),
      window.medikentCloud.loadActivities()
    ]);

    departments=Array.isArray(cloudDeps)?cloudDeps:[];
    doctors=Array.isArray(cloudDocs)?cloudDocs:[];
    activities=Array.isArray(cloudRows)?cloudRows:[];

    // Supabase Storage'daki fotoğraf sayılarını faaliyetlere bağla.
    for(const a of activities){
      try{
        const photos=await window.medikentCloud.listActivityPhotos(a.id);
        a.localPhotoCount=photos.length;
      }catch(err){
        console.warn("Fotoğraf sayısı alınamadı:",a.id,err);
        a.localPhotoCount=0;
      }
    }

    // İsimleri rapor/kayıt ekranında hızlı göstermek için yerelde tamamla.
    activities=activities.map(a=>({
      ...a,
      branchName: departments.find(d=>d.id===a.branch)?.name || a.branchName || '',
      doctorName: doctors.find(d=>d.id===a.doctor)?.name || a.doctorName || ''
    }));

    localSave();
    populateDefs();
    renderMasterLists();

    const latest=latestActivityMonth();
    if(monthFilter) monthFilter.value=latest;
    if(reportMonth) reportMonth.value=latest;

    const status=document.getElementById("cloudTransferStatus");
    if(status) status.textContent=`Supabase aktif: ${activities.length} faaliyet, ${departments.length} bölüm, ${doctors.length} doktor.`;

    renderAll();
  }catch(err){
    console.error(err);
    alert("Supabase verileri alınamadı: "+(err.message||err));
  }
}

window.addEventListener("medikent-cloud-ready",loadCloudIfAvailable);

function fmt(n){ return Number(n||0).toLocaleString('tr-TR'); }
function monthOf(date){ return (date||'').slice(0,7); }
function esc(s=''){ return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

const $=id=>document.getElementById(id);
let selectedPhotoFiles = [];
let retainedExistingPhotos = [];
const QUICK_PREFS_KEY='medikent_quick_prefs_v43';
let saveAndGoToReport=false;

const QUICK_TEMPLATES={
  'Gebe Okulu':{type:'Gebe Okulu',reportTopic:'Gebe Okulu',platform:'',focus:'participant'},
  'Doktor Videosu':{type:'Video',reportTopic:'Doktor Bilgilendirme',platform:'Instagram',focus:'social'},
  'Basın Haberi':{type:'Basın / Haber',reportTopic:'Basın / Haber',platform:'',focus:'social'},
  'Sağlık Taraması':{type:'Sağlık Taraması',reportTopic:'Sağlık Taraması',platform:'',focus:'participant'},
  'Farkındalık Etkinliği':{type:'Farkındalık Etkinliği',reportTopic:'Farkındalık Etkinliği',platform:'',focus:'participant'}
};

function loadQuickPrefs(){
  try{return JSON.parse(localStorage.getItem(QUICK_PREFS_KEY)||'{}');}
  catch{return {};}
}

function saveQuickPrefs(activity){
  localStorage.setItem(QUICK_PREFS_KEY,JSON.stringify({
    branch:activity.branch||'',
    doctor:activity.doctor||'',
    type:activity.type||'',
    platform:activity.platform||'',
    reportTopic:activity.reportTopic||''
  }));
}

function applyLastUsed(){
  const prefs=loadQuickPrefs();
  if(prefs.branch && departments.some(d=>d.id===prefs.branch)){
    $('branch').value=prefs.branch;
    updateDoctors(prefs.doctor||'');
  }
  if(prefs.type && [...$('type').options].some(o=>o.value===prefs.type)) $('type').value=prefs.type;
  if(prefs.platform) $('platform').value=prefs.platform;
  if(prefs.reportTopic) $('reportTopic').value=prefs.reportTopic;
  toggleConditionalFields();
}

function applyQuickTemplate(name){
  const t=QUICK_TEMPLATES[name];
  if(!t)return;
  if([...$('type').options].some(o=>o.value===t.type)) $('type').value=t.type;
  $('reportTopic').value=t.reportTopic||'';
  $('platform').value=t.platform||'';
  toggleConditionalFields();
  if(t.focus==='participant') $('participants')?.focus();
  else $('views')?.focus();
}


async function getLocalPhotos(activityId){
  if(!activityId || !window.medikentCloud?.enabled) return [];
  return await window.medikentCloud.listActivityPhotos(activityId);
}

async function setLocalPhotos(){ return; }

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

  if(!$('editingId')?.value){
    const prefs=loadQuickPrefs();
    if(prefs.branch && departments.some(d=>d.id===prefs.branch)){
      $('branch').value=prefs.branch;
      updateDoctors(prefs.doctor||'');
    }
  }
  toggleConditionalFields();
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
  const type=$('type')?.value||'';

  const socialTypes=new Set(['Sosyal Medya','Video','Basın / Haber','Doktor Röportajı','TV Programı','Radyo']);
  const participantTypes=new Set(['Eğitim','Gebe Okulu','Sağlık Taraması','Farkındalık Etkinliği','Etkinlik']);

  const social=$('socialFields');
  const participant=$('participantFields');
  const platforms=[...document.querySelectorAll('.smart-platform')];

  const showSocial=socialTypes.has(type);
  const showParticipant=participantTypes.has(type);

  social?.classList.toggle('smart-hidden',!showSocial);
  participant?.classList.toggle('smart-hidden',!showParticipant);
  platforms.forEach(el=>el.classList.toggle('smart-hidden',!showSocial));

  if(type==='Diğer'){
    social?.classList.remove('smart-hidden');
    participant?.classList.remove('smart-hidden');
    platforms.forEach(el=>el.classList.remove('smart-hidden'));
  }
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

window.removeExistingPhoto=async i=>{
  const photo=retainedExistingPhotos[i];
  if(!photo) return;
  if(!confirm('Bu fotoğraf silinsin mi?')) return;
  try{
    if(window.medikentCloud?.enabled && photo.path){
      await window.medikentCloud.deletePhoto(photo.path);
    }
    retainedExistingPhotos.splice(i,1);
    renderExistingPhotos();
  }catch(err){
    console.error(err);
    alert("Fotoğraf silinemedi: "+(err.message||err));
  }
};

const photoFilesInput=$('photoFiles');
if(photoFilesInput){
  photoFilesInput.addEventListener('change',e=>{
    selectedPhotoFiles=[...e.target.files];
    renderSelectedPhotoPreview();
  });
}


document.querySelectorAll('.template-btn').forEach(btn=>{
  btn.addEventListener('click',()=>applyQuickTemplate(btn.dataset.template));
});

$('reuseLastBtn')?.addEventListener('click',()=>{
  if(!activities.length){
    alert('Tekrar kullanılabilecek önceki faaliyet yok.');
    return;
  }

  const last=[...activities]
    .filter(a=>a && a.date)
    .sort((a,b)=>{
      const dc=(b.date||'').localeCompare(a.date||'');
      if(dc!==0) return dc;
      return String(b.id||'').localeCompare(String(a.id||''));
    })[0];

  if(!last){
    alert('Tekrar kullanılabilecek önceki faaliyet yok.');
    return;
  }

  resetForm();

  $('editingId').value='';
  $('formTitle').textContent='Yeni Faaliyet';
  $('editBadge').classList.add('hidden');
  $('cancelEdit').classList.add('hidden');

  // Yeni kayıt olarak bugünün tarihiyle başlat.
  $('date').value=new Date().toISOString().slice(0,10);

  $('title').value=last.title||'';
  $('reportTopic').value=last.reportTopic||'';

  if(last.branch && departments.some(d=>d.id===last.branch)){
    $('branch').value=last.branch;
    updateDoctors(last.doctor||'');
  }

  if(last.type && [...$('type').options].some(o=>o.value===last.type)){
    $('type').value=last.type;
  }

  $('platform').value=last.platform||'';
  $('socialLink').value=last.socialLink||'';
  $('note').value=last.note||'';

  // Sayısal veriler yeni faaliyet için sıfırlanır.
  $('views').value=0;
  $('reach').value=0;
  $('likes').value=0;
  $('engagement').value=0;
  $('participants').value=0;

  // Fotoğraflar güvenlik ve yanlış raporlama riski nedeniyle kopyalanmaz.
  selectedPhotoFiles=[];
  retainedExistingPhotos=[];
  if($('photoFiles')) $('photoFiles').value='';
  if($('photoPreview')) $('photoPreview').innerHTML='';
  if($('existingPhotos')) $('existingPhotos').innerHTML='';

  toggleConditionalFields();
  document.querySelector('[data-view="new"]')?.click();
  $('title')?.focus();

  alert('Son faaliyet yeni kayıt olarak hazırlandı. Tarih ve fotoğrafı kontrol edip kaydedebilirsin.');
});

$('saveAndReportBtn')?.addEventListener('click',()=>{
  saveAndGoToReport=true;
  $('activityForm').requestSubmit();
});

$('activityForm').addEventListener('submit',async e=>{
  e.preventDefault();

  if(!window.medikentCloud?.enabled){
    alert("Supabase bağlantısı aktif değil.");
    return;
  }

  const editingId=$('editingId').value;
  const activityId=editingId || crypto.randomUUID();
  const existing=editingId ? activities.find(a=>a.id===editingId) : null;

  const draft={
    ...(existing||{}),
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
    views:+$('views').value||0,
    reach:+$('reach').value||0,
    likes:+$('likes').value||0,
    engagement:+$('engagement').value||0,
    participants:+$('participants').value||0,
    note:$('note').value.trim()
  };

  try{
    await window.medikentCloud.saveActivity(draft);

    if(selectedPhotoFiles.length){
      await window.medikentCloud.uploadActivityPhotos(activityId,selectedPhotoFiles);
    }

    const photos=await window.medikentCloud.listActivityPhotos(activityId);
    draft.localPhotoCount=photos.length;

    const idx=activities.findIndex(a=>a.id===activityId);
    if(idx>=0) activities[idx]=draft;
    else activities.push(draft);
    save();

    const savedMonth=monthOf(draft.date);
    if(savedMonth){
      monthFilter.value=savedMonth;
      reportMonth.value=savedMonth;
    }

    saveQuickPrefs(draft);
    const goReport=saveAndGoToReport;
    saveAndGoToReport=false;

    resetForm();
    renderAll();

    if(goReport){
      const savedMonth=monthOf(draft.date);
      if(savedMonth) $('reportMonth').value=savedMonth;
      if(draft.reportTopic) $('reportTopicFilter').value=draft.reportTopic;
      document.querySelector('[data-view="report"]')?.click();
      await generateReport();
    }else{
      alert(editingId?'Kayıt güncellendi.':'Faaliyet Supabase’e kaydedildi.');
    }
  }catch(err){
    console.error(err);
    alert("Kayıt tamamlanamadı: "+(err.message||err));
  }
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
  applyLastUsed();
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

window.duplicateActivity=id=>{
  const a=activities.find(x=>x.id===id);
  if(!a)return;

  resetForm();
  $('editingId').value='';
  $('date').value=new Date().toISOString().slice(0,10);
  $('title').value=a.title||'';
  $('reportTopic').value=a.reportTopic||'';
  $('branch').value=a.branch||'';
  updateDoctors(a.doctor||'');
  $('type').value=a.type||'';
  $('platform').value=a.platform||'';
  $('socialLink').value=a.socialLink||'';
  $('views').value=0;
  $('reach').value=0;
  $('likes').value=0;
  $('engagement').value=0;
  $('participants').value=0;
  $('note').value=a.note||'';

  selectedPhotoFiles=[];
  retainedExistingPhotos=[];
  if($('photoPreview')) $('photoPreview').innerHTML='';
  if($('existingPhotos')) $('existingPhotos').innerHTML='';

  toggleConditionalFields();
  document.querySelector('[data-view="new"]')?.click();
  $('title')?.focus();
};

window.removeActivity=async id=>{
  if(!confirm('Bu kayıt silinsin mi?')) return;

  if(window.medikentCloud?.enabled){
    try{
      await window.medikentCloud.deleteActivity(id);
    }catch(err){
      console.error(err);
      alert("Kayıt Supabase’den silinemedi: "+(err.message||err));
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
        ${photos.length?`<div class="report-photo-grid">${photos.map(p=>`<img src="${p.dataUrl || p.url || ''}" alt="Faaliyet fotoğrafı">`).join('')}</div>`:''}
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


async function waitForReportImages(){
  const images=[...$('reportOutput').querySelectorAll('img')];

  await Promise.all(images.map(img=>{
    if(img.complete && img.naturalWidth>0){
      if(img.decode){
        return img.decode().catch(()=>{});
      }
      return Promise.resolve();
    }

    return new Promise(resolve=>{
      const done=()=>resolve();
      img.addEventListener('load',done,{once:true});
      img.addEventListener('error',done,{once:true});
      setTimeout(done,5000);
    });
  }));

  // html2canvas'in son çizimi tamamlaması için iki frame bekle.
  await new Promise(resolve=>requestAnimationFrame(
    ()=>requestAnimationFrame(resolve)
  ));
}

async function downloadPdfReport(){
  await generateReport();
  await waitForReportImages();

  const element=$('reportOutput');

  // PDF üretmeden hemen önce tüm görsellerin gerçek boyutta oluştuğunu doğrula.
  const broken=[...element.querySelectorAll('img')].filter(
    img=>!img.complete || img.naturalWidth===0
  );

  if(broken.length){
    alert("Bazı faaliyet fotoğrafları PDF için hazırlanamadı. Lütfen birkaç saniye sonra tekrar deneyin.");
    return;
  }

  const opt={
    margin:[10,10,10,10],
    filename:reportFileBase()+'.pdf',
    image:{type:'jpeg',quality:0.98},
    html2canvas:{
      scale:2,
      useCORS:true,
      allowTaint:true,
      logging:false,
      imageTimeout:15000,
      backgroundColor:'#ffffff'
    },
    jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},
    pagebreak:{mode:['css','legacy'],avoid:['.report-section','.report-photo-grid']}
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
        populateDefs(); renderAll();
    alert('Yedek geri yüklendi.');
  }catch{alert('Geçersiz yedek dosyası.');}
});




const departmentForm=$('departmentForm');
if(departmentForm){
  departmentForm.addEventListener('submit',async e=>{
    e.preventDefault();
    const name=$('departmentName').value.trim();
    if(!name) return;
    if(departments.some(d=>normalizeTr(d.name)===normalizeTr(name))){
      alert('Bu bölüm zaten tanımlı.');
      return;
    }
    try{
      const saved=await window.medikentCloud.saveDepartment({name,active:true});
      departments.push(saved);
      populateDefs();
      renderMasterLists();
      departmentForm.reset();
      alert('Bölüm kaydedildi.');
    }catch(err){
      console.error(err);
      alert("Bölüm kaydedilemedi: "+(err.message||err));
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
    if(doctors.some(d=>normalizeTr(d.name)===normalizeTr(name))){
      alert('Bu doktor zaten tanımlı.');
      return;
    }
    const dep=departmentByAny(departmentId);
    try{
      const saved=await window.medikentCloud.saveDoctor({
        name,
        departmentId,
        departmentName:dep?.name||'',
        active:true
      });
      doctors.push({...saved,departmentName:dep?.name||''});
      populateDefs();
      renderMasterLists();
      doctorForm.reset();
      alert('Doktor kaydedildi.');
    }catch(err){
      console.error(err);
      alert("Doktor kaydedilemedi: "+(err.message||err));
    }
  });
}

window.saveDepartmentEdit=async id=>{
  const dep=departments.find(d=>d.id===id); if(!dep)return;
  const name=(document.getElementById(`dep-name-${id}`)?.value||'').trim();
  if(!name){ alert('Bölüm adı boş olamaz.'); return; }
  if(departments.some(d=>d.id!==id && normalizeTr(d.name)===normalizeTr(name))){
    alert('Bu bölüm adı zaten mevcut.');
    return;
  }
  try{
    const saved=await window.medikentCloud.saveDepartment({...dep,name});
    Object.assign(dep,saved);
    populateDefs();
    renderMasterLists();
    renderAll();
    alert('Bölüm güncellendi.');
  }catch(err){
    console.error(err);
    alert("Bölüm güncellenemedi: "+(err.message||err));
  }
};

window.saveDoctorEdit=async id=>{
  const d=doctors.find(x=>x.id===id); if(!d)return;
  const name=(document.getElementById(`doc-name-${id}`)?.value||'').trim();
  const departmentId=document.getElementById(`doc-dep-${id}`)?.value||'';
  if(!name || !departmentId){ alert('Doktor adı ve bölüm zorunludur.'); return; }
  const dep=departmentByAny(departmentId);
  try{
    const saved=await window.medikentCloud.saveDoctor({
      ...d,name,departmentId,departmentName:dep?.name||'',active:d.active!==false
    });
    Object.assign(d,saved,{departmentName:dep?.name||''});
    populateDefs();
    renderMasterLists();
    renderAll();
    alert('Doktor güncellendi.');
  }catch(err){
    console.error(err);
    alert("Doktor güncellenemedi: "+(err.message||err));
  }
};

window.toggleDoctor=async id=>{
  const d=doctors.find(x=>x.id===id); if(!d)return;
  const next=d.active===false;
  try{
    const saved=await window.medikentCloud.saveDoctor({...d,active:next});
    Object.assign(d,saved,{departmentName:d.departmentName});
    populateDefs();
    renderMasterLists();
    renderAll();
  }catch(err){
    console.error(err);
    alert("Doktor durumu değiştirilemedi: "+(err.message||err));
  }
};

async function loadMasterCloud(){
  if(!window.medikentCloud?.enabled) return;
  try{
    const [cloudDeps,cloudDocs]=await Promise.all([
      window.medikentCloud.loadDepartments(),
      window.medikentCloud.loadDoctors()
    ]);
    departments=cloudDeps||[];
    doctors=cloudDocs||[];
    populateDefs();
    renderMasterLists();
    renderAll();
  }catch(err){
    console.error(err);
    alert("Bölüm/Doktor verileri Supabase’den alınamadı: "+(err.message||err));
  }
}
window.addEventListener("medikent-cloud-ready",loadMasterCloud);

const cloudUploadBtn = document.getElementById("cloudUploadBtn");
if(cloudUploadBtn){
  cloudUploadBtn.onclick = async ()=>{
    if(!window.medikentCloud?.enabled){
      alert("Önce e-posta ve şifrenizle giriş yapın.");
      return;
    }
    if(!activities.length){
      alert("Aktarılacak kayıt bulunmuyor.");
      return;
    }
    if(!confirm(`${activities.length} eski yerel kayıt Supabase’e aktarılacak. Devam edilsin mi?`)) return;

    cloudUploadBtn.disabled = true;
    const status = document.getElementById("cloudTransferStatus");
    if(status) status.textContent = "Supabase’e aktarılıyor...";

    try{
      const count = await window.medikentCloud.uploadActivities(activities);
      if(status) status.textContent = `${count} kayıt Supabase’e aktarıldı.`;
      alert(`${count} kayıt Supabase’e aktarıldı.`);
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
populateDefs();
toggleConditionalFields();
renderAll();
