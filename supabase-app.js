import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://ipsxtudyfdlqjjokxjwn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_QPexRGyzogX5T1Zp4f2pmg_jZCdX1td";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

const BUCKET = "faaliyet-fotograflari";

const loginOverlay = document.getElementById("loginOverlay");
const loginStatus = document.getElementById("loginStatus");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const emailLoginBtn = document.getElementById("emailLoginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userName = document.getElementById("userName");
const syncBadge = document.getElementById("syncBadge");

window.medikentCloud = {
  enabled: false,
  currentUser: null,
  profile: null,
  async loadActivities(){ return []; },
  async saveActivity(){},
  async deleteActivity(){},
  async uploadActivities(){ return 0; },
  async loadDepartments(){ return []; },
  async saveDepartment(){},
  async loadDoctors(){ return []; },
  async saveDoctor(){},
  async listActivityPhotos(){ return []; },
  async uploadActivityPhotos(){ return []; },
  async deletePhoto(){},
  async loadTemplates(){ return []; },
  async saveTemplate(){},
  async deleteTemplate(){}
};

function setLoginMessage(message){
  if(loginStatus) loginStatus.textContent = message;
}

async function getProfile(userId){
  const {data,error} = await supabase
    .from("profiles")
    .select("id,full_name,email,role,active")
    .eq("id", userId)
    .maybeSingle();
  if(error) throw error;
  return data;
}


function blobToDataUrl(blob){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(reader.result);
    reader.onerror=()=>reject(reader.error);
    reader.readAsDataURL(blob);
  });
}



async function activateUser(user){
  const profile = await getProfile(user.id);

  if(!profile || profile.active !== true){
    window.medikentCloud.enabled = false;
    window.medikentCloud.currentUser = user;
    window.medikentCloud.profile = profile;
    userName.textContent = user.email || "";
    syncBadge.textContent = "Yetkisiz";
    syncBadge.classList.add("offline");
    logoutBtn.classList.remove("hidden");
    loginOverlay.classList.remove("hidden");
    setLoginMessage("Bu kullanıcı henüz yönetici tarafından aktif edilmemiş.");
    return;
  }

  window.medikentCloud.enabled = true;
  window.medikentCloud.currentUser = user;
  window.medikentCloud.profile = profile;

  userName.textContent = `${profile.full_name || user.email} (${profile.role})`;
  syncBadge.textContent = "Supabase Aktif";
  syncBadge.classList.remove("offline");
  logoutBtn.classList.remove("hidden");
  loginOverlay.classList.add("hidden");

  window.medikentCloud.loadDepartments = async ()=>{
    const {data,error} = await supabase
      .from("departments")
      .select("id,name,active")
      .order("name");
    if(error) throw error;
    return (data||[]).map(x=>({id:x.id,name:x.name,active:x.active}));
  };

  window.medikentCloud.saveDepartment = async dep=>{
    const payload = {name:dep.name, active:dep.active!==false};
    let query;
    if(dep.id && /^[0-9a-f-]{36}$/i.test(dep.id)){
      query = supabase.from("departments").update(payload).eq("id",dep.id).select().single();
    }else{
      query = supabase.from("departments").insert(payload).select().single();
    }
    const {data,error}=await query;
    if(error) throw error;
    return {id:data.id,name:data.name,active:data.active};
  };

  window.medikentCloud.loadDoctors = async ()=>{
    const {data,error} = await supabase
      .from("doctors")
      .select("id,name,department_id,active,departments(name)")
      .order("name");
    if(error) throw error;
    return (data||[]).map(x=>({
      id:x.id,
      name:x.name,
      departmentId:x.department_id,
      departmentName:x.departments?.name || "",
      active:x.active
    }));
  };

  window.medikentCloud.saveDoctor = async doctor=>{
    const payload = {
      name:doctor.name,
      department_id:doctor.departmentId,
      active:doctor.active!==false
    };
    let query;
    if(doctor.id && /^[0-9a-f-]{36}$/i.test(doctor.id)){
      query=supabase.from("doctors").update(payload).eq("id",doctor.id).select("id,name,department_id,active").single();
    }else{
      query=supabase.from("doctors").insert(payload).select("id,name,department_id,active").single();
    }
    const {data,error}=await query;
    if(error) throw error;
    return {
      id:data.id,
      name:data.name,
      departmentId:data.department_id,
      departmentName:doctor.departmentName || "",
      active:data.active
    };
  };

  window.medikentCloud.loadActivities = async ()=>{
    const {data,error} = await supabase
      .from("activities")
      .select("*")
      .order("activity_date",{ascending:true});
    if(error) throw error;
    return (data||[]).map(x=>({
      id:x.id,
      date:x.activity_date,
      title:x.title,
      reportTopic:x.report_topic || "",
      branch:x.department_id || "",
      doctor:x.doctor_id || "",
      type:x.activity_type,
      platform:x.platform || "",
      socialLink:x.social_link || "",
      views:x.views || 0,
      reach:x.reach || 0,
      likes:x.likes || 0,
      engagement:x.engagement || 0,
      participants:x.participants || 0,
      note:x.note || ""
    }));
  };

  window.medikentCloud.saveActivity = async activity=>{
    const payload = {
      id: activity.id,
      activity_date: activity.date,
      title: activity.title,
      report_topic: activity.reportTopic || null,
      department_id: activity.branch || null,
      doctor_id: activity.doctor || null,
      activity_type: activity.type,
      platform: activity.platform || null,
      social_link: activity.socialLink || null,
      views: +activity.views || 0,
      reach: +activity.reach || 0,
      likes: +activity.likes || 0,
      engagement: +activity.engagement || 0,
      participants: +activity.participants || 0,
      note: activity.note || null,
      created_by: user.id,
      updated_at: new Date().toISOString()
    };
    const {data,error}=await supabase.from("activities").upsert(payload).select().single();
    if(error) throw error;
    return data;
  };

  window.medikentCloud.deleteActivity = async id=>{
    const {error}=await supabase.from("activities").delete().eq("id",id);
    if(error) throw error;
    const {data:listData}=await supabase.storage.from(BUCKET).list(id,{limit:100});
    if(listData?.length){
      await supabase.storage.from(BUCKET).remove(listData.map(f=>`${id}/${f.name}`));
    }
  };

  window.medikentCloud.uploadActivities = async rows=>{
    let count=0;
    for(const row of rows){
      await window.medikentCloud.saveActivity(row);
      count++;
    }
    return count;
  };

  window.medikentCloud.listActivityPhotos = async activityId=>{
    const {data,error}=await supabase.storage.from(BUCKET).list(activityId,{
      limit:100,
      sortBy:{column:"created_at",order:"asc"}
    });
    if(error) throw error;

    const files=(data||[]).filter(x=>x.name && x.name!==".emptyFolderPlaceholder");
    const out=[];

    for(const f of files){
      const path=`${activityId}/${f.name}`;

      const {data:blob,error:downloadError}=await supabase.storage
        .from(BUCKET)
        .download(path);

      if(downloadError){
        console.error("Fotoğraf indirilemedi:",path,downloadError);
        continue;
      }

      const dataUrl=await blobToDataUrl(blob);

      out.push({
        name:f.name,
        path,
        dataUrl,
        url:dataUrl
      });
    }

    return out;
  };

  window.medikentCloud.uploadActivityPhotos = async (activityId,files)=>{
    const out=[];

    for(const file of files){
      const ext=(file.name.split(".").pop()||"jpg").toLowerCase();
      const safeBase=(file.name.replace(/\.[^.]+$/,"")||"foto")
        .replace(/[^a-zA-Z0-9_-]+/g,"-")
        .slice(0,50);

      const filename=`${Date.now()}-${crypto.randomUUID()}-${safeBase}.${ext}`;
      const path=`${activityId}/${filename}`;

      const {error}=await supabase.storage.from(BUCKET).upload(path,file,{
        cacheControl:"3600",
        upsert:false,
        contentType:file.type
      });
      if(error) throw error;

      const {data:blob,error:downloadError}=await supabase.storage
        .from(BUCKET)
        .download(path);

      if(downloadError) throw downloadError;

      const dataUrl=await blobToDataUrl(blob);

      out.push({
        name:file.name,
        path,
        dataUrl,
        url:dataUrl
      });
    }

    return out;
  };

  window.medikentCloud.deletePhoto = async path=>{
    const {error}=await supabase.storage.from(BUCKET).remove([path]);
    if(error) throw error;
  };


  window.medikentCloud.loadTemplates = async ()=>{
    const {data,error}=await supabase
      .from("activity_templates")
      .select("id,name,activity_type,report_topic,platform,active,sort_order")
      .order("sort_order",{ascending:true})
      .order("name",{ascending:true});
    if(error) throw error;
    return (data||[]).map(x=>({
      id:x.id,
      name:x.name,
      type:x.activity_type,
      reportTopic:x.report_topic||"",
      platform:x.platform||"",
      active:x.active!==false,
      sortOrder:x.sort_order||0
    }));
  };

  window.medikentCloud.saveTemplate = async template=>{
    const payload={
      name:template.name,
      activity_type:template.type,
      report_topic:template.reportTopic||null,
      platform:template.platform||null,
      active:template.active!==false,
      sort_order:+template.sortOrder||0
    };
    let query;
    if(template.id && /^[0-9a-f-]{36}$/i.test(template.id)){
      query=supabase.from("activity_templates").update(payload).eq("id",template.id).select().single();
    }else{
      query=supabase.from("activity_templates").insert(payload).select().single();
    }
    const {data,error}=await query;
    if(error) throw error;
    return {
      id:data.id,name:data.name,type:data.activity_type,
      reportTopic:data.report_topic||"",platform:data.platform||"",
      active:data.active!==false,sortOrder:data.sort_order||0
    };
  };

  window.medikentCloud.deleteTemplate = async id=>{
    const {error}=await supabase.from("activity_templates").delete().eq("id",id);
    if(error) throw error;
  };

  window.dispatchEvent(new CustomEvent("medikent-cloud-ready"));
}

async function refreshSession(){
  const {data:{session},error}=await supabase.auth.getSession();
  if(error){
    setLoginMessage("Oturum kontrolü başarısız: "+error.message);
    return;
  }
  if(session?.user){
    try{ await activateUser(session.user); }
    catch(err){
      console.error(err);
      setLoginMessage("Kullanıcı yetkisi okunamadı: "+(err.message||err));
    }
  }else{
    window.medikentCloud.enabled=false;
    loginOverlay.classList.remove("hidden");
    syncBadge.textContent="Oturum Kapalı";
    syncBadge.classList.add("offline");
    logoutBtn.classList.add("hidden");
    setLoginMessage("E-posta ve şifrenizle giriş yapın.");
  }
}

emailLoginBtn?.addEventListener("click",async ()=>{
  const email=(loginEmail?.value||"").trim();
  const password=loginPassword?.value||"";
  if(!email || !password){
    setLoginMessage("E-posta ve şifreyi girin.");
    return;
  }
  emailLoginBtn.disabled=true;
  setLoginMessage("Giriş yapılıyor...");
  try{
    const {data,error}=await supabase.auth.signInWithPassword({email,password});
    if(error) throw error;
    await activateUser(data.user);
  }catch(err){
    console.error(err);
    setLoginMessage("Giriş başarısız: "+(err.message||err));
  }finally{
    emailLoginBtn.disabled=false;
  }
});

loginPassword?.addEventListener("keydown",e=>{
  if(e.key==="Enter") emailLoginBtn?.click();
});

logoutBtn?.addEventListener("click",async ()=>{
  await supabase.auth.signOut();
  location.reload();
});

supabase.auth.onAuthStateChange(async (event,session)=>{
  if(event==="SIGNED_IN" && session?.user){
    try{ await activateUser(session.user); }catch(err){ console.error(err); }
  }
  if(event==="SIGNED_OUT"){
    window.medikentCloud.enabled=false;
    loginOverlay.classList.remove("hidden");
  }
});

refreshSession();
