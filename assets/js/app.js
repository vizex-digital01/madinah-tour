
function togglePassword(){
  const p=document.getElementById("password");
  const b=document.getElementById("showPass");
  if(!p) return;

  const show=p.type==="password";
  p.type=show?"text":"password";
  if(b) b.textContent=show?"Sembunyikan":"Lihat";
}

async function loginSupabase(e){
  e.preventDefault();

  const email=document.getElementById("login").value.trim();
  const password=document.getElementById("password").value;
  const status=document.getElementById("status");

  if(status) status.textContent="Memeriksa akun...";

  try{
    if(!window.mtSupabaseConfigured || !mtSupabaseConfigured()){
      throw new Error("Koneksi Supabase belum aktif.");
    }

    const result=await mtSignIn(email,password);
    const role=(result?.profile?.role || "").trim();

    if(["super_admin","admin_operasional","tour_leader"].includes(role)){
      window.location.replace("/admin/");
      return;
    }

    if(role==="jamaah"){
      window.location.replace("/jamaah/");
      return;
    }

    throw new Error("Role akun tidak dikenali.");
  }catch(err){
    console.error("Login error:",err);
    if(status) status.textContent=err?.message || "Login gagal.";
  }
}

async function requireAdminPage(){
  try{
    const auth=await mtGetSessionProfile();

    if(!auth){
      window.location.replace("/");
      return null;
    }

    const role=(auth.profile?.role || "").trim();

    if(["super_admin","admin_operasional","tour_leader"].includes(role)){
      return auth;
    }

    if(role==="jamaah"){
      window.location.replace("/jamaah/");
      return null;
    }

    window.location.replace("/");
    return null;
  }catch(err){
    console.error("Admin guard:",err);
    window.location.replace("/");
    return null;
  }
}

async function requireJamaahPage(){
  try{
    const auth=await mtGetSessionProfile();

    if(!auth){
      window.location.replace("/");
      return null;
    }

    const role=(auth.profile?.role || "").trim();

    if(role==="jamaah"){
      return auth;
    }

    if(["super_admin","admin_operasional","tour_leader"].includes(role)){
      window.location.replace("/admin/");
      return null;
    }

    window.location.replace("/");
    return null;
  }catch(err){
    console.error("Jamaah guard:",err);
    window.location.replace("/");
    return null;
  }
}

function logout(){
  if(window.mtLogout){
    mtLogout();
  }else{
    window.location.replace("/");
  }
}

function toggleSidebar(){
  const sidebar=document.getElementById("sidebar");
  if(sidebar) sidebar.classList.toggle("open");
}

function showSection(id,btn){
  document.querySelectorAll(".admin-section").forEach(section=>{
    section.classList.add("hidden");
  });

  const target=document.getElementById(id);
  if(target) target.classList.remove("hidden");

  document.querySelectorAll(".nav button").forEach(button=>{
    button.classList.remove("active");
  });
  if(btn) btn.classList.add("active");

  if(window.innerWidth<760){
    const sidebar=document.getElementById("sidebar");
    if(sidebar) sidebar.classList.remove("open");
  }

  setTimeout(()=>{
    if(id==="tracking" && window.adminMap){
      window.adminMap.invalidateSize();
    }
  },100);
}

function sendBroadcast(){
  const box=document.getElementById("broadcastText");
  const status=document.getElementById("broadcastStatus");
  const msg=box?.value?.trim() || "";

  if(!msg){
    if(status) status.textContent="Tulis pesan terlebih dahulu.";
    return;
  }

  if(status){
    status.textContent="Broadcast siap dikirim. Integrasi WhatsApp dapat ditambahkan berikutnya.";
  }
}

function openIncident(){
  const modal=document.getElementById("incidentModal");
  if(modal) modal.classList.remove("hidden");
}

function closeIncident(){
  const modal=document.getElementById("incidentModal");
  if(modal) modal.classList.add("hidden");
}

function saveIncident(){
  const t=document.getElementById("incidentText")?.value?.trim() || "";
  if(!t){
    alert("Isi kronologi terlebih dahulu.");
    return;
  }
  alert("Laporan kejadian tersimpan pada versi demo antarmuka.");
  closeIncident();
}

async function myLocation(){
  const st=document.getElementById("locationStatus");

  if(!navigator.geolocation){
    if(st) st.textContent="Browser tidak mendukung GPS.";
    return;
  }

  if(st) st.textContent="Meminta izin lokasi...";

  navigator.geolocation.getCurrentPosition(
    async pos=>{
      try{
        await mtInsertLocation({
          latitude:pos.coords.latitude,
          longitude:pos.coords.longitude,
          accuracy:pos.coords.accuracy
        });

        if(st){
          st.textContent=`Lokasi aktif & tersimpan • akurasi ±${Math.round(pos.coords.accuracy)} m`;
        }

        if(window.jamaahMap){
          const ll=[pos.coords.latitude,pos.coords.longitude];

          if(window.myLocationMarker){
            window.jamaahMap.removeLayer(window.myLocationMarker);
          }

          window.myLocationMarker=L.marker(ll)
            .addTo(window.jamaahMap)
            .bindPopup("Lokasi Anda")
            .openPopup();

          window.jamaahMap.setView(ll,16);
        }
      }catch(err){
        console.error("Location save:",err);
        if(st) st.textContent="Lokasi didapat tetapi gagal disimpan: "+err.message;
      }
    },
    ()=>{
      if(st) st.textContent="Izin lokasi ditolak atau lokasi tidak tersedia.";
    },
    {
      enableHighAccuracy:true,
      timeout:10000,
      maximumAge:15000
    }
  );
}

function sos(){
  if(!confirm("Aktifkan SOS darurat?")) return;

  const send=async(latitude=null,longitude=null)=>{
    try{
      await mtCreateSOS({latitude,longitude});
      alert("SOS aktif. Alert telah dikirim ke Command Center Admin.");
    }catch(err){
      console.error("SOS:",err);
      alert("SOS gagal dikirim: "+err.message);
    }
  };

  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(
      pos=>send(pos.coords.latitude,pos.coords.longitude),
      ()=>send(),
      {enableHighAccuracy:true,timeout:8000}
    );
  }else{
    send();
  }
}

const defaultAdminSettings={
  travelName:"Madinah Tour",
  portalName:"Madinah Journey",
  whatsapp:"0811-8802-1519",
  address:"Jl. Akses Marunda No.35B, Cilincing, Jakarta Utara",
  safeRadius:1000,
  locationInterval:"60",
  geofenceAlert:true,
  locationHistory:true,
  tourLeader:"Tour Leader Madinah Tour",
  tourLeaderPhone:"",
  emergencyPhone:"0811-8802-1519",
  sosEnabled:true,
  notifySos:true,
  notifyAttendance:true,
  notifyDocuments:true,
  defaultBroadcast:"Assalamualaikum. Mohon seluruh jamaah memperhatikan informasi terbaru dari tim Madinah Tour.",
  programName:"Umroh 9 Hari",
  departureDate:"2026-11-02",
  meetingPoint:"Bandara Soekarno-Hatta",
  totalJamaah:120,
  autoLogout:true,
  autoLogoutMinutes:"30",
  emergencyConfirm:true
};

function setVal(id,val){
  const el=document.getElementById(id);
  if(!el) return;

  if(el.type==="checkbox"){
    el.checked=!!val;
  }else{
    el.value=val ?? "";
  }
}

function readCheckbox(id){
  const el=document.getElementById(id);
  return !!(el && el.checked);
}

function readValue(id){
  const el=document.getElementById(id);
  return el ? el.value : "";
}

async function loadAdminSettings(){
  let settings={...defaultAdminSettings};

  try{
    if(window.mtLoadSettings){
      const remote=await mtLoadSettings();
      if(remote) settings={...settings,...remote};
    }
  }catch(err){
    console.error("Load settings:",err);
  }

  setVal("setTravelName",settings.travelName);
  setVal("setPortalName",settings.portalName);
  setVal("setWhatsapp",settings.whatsapp);
  setVal("setAddress",settings.address);
  setVal("setSafeRadius",settings.safeRadius);
  setVal("setLocationInterval",settings.locationInterval);
  setVal("setGeofenceAlert",settings.geofenceAlert);
  setVal("setLocationHistory",settings.locationHistory);
  setVal("setTourLeader",settings.tourLeader);
  setVal("setTourLeaderPhone",settings.tourLeaderPhone);
  setVal("setEmergencyPhone",settings.emergencyPhone);
  setVal("setSosEnabled",settings.sosEnabled);
  setVal("setNotifySos",settings.notifySos);
  setVal("setNotifyAttendance",settings.notifyAttendance);
  setVal("setNotifyDocuments",settings.notifyDocuments);
  setVal("setDefaultBroadcast",settings.defaultBroadcast);
  setVal("setProgramName",settings.programName);
  setVal("setDepartureDate",settings.departureDate);
  setVal("setMeetingPoint",settings.meetingPoint);
  setVal("setTotalJamaah",settings.totalJamaah);
  setVal("setAutoLogout",settings.autoLogout);
  setVal("setAutoLogoutMinutes",settings.autoLogoutMinutes);
  setVal("setEmergencyConfirm",settings.emergencyConfirm);
}

async function saveAdminSettings(){
  const data={
    travelName:readValue("setTravelName"),
    portalName:readValue("setPortalName"),
    whatsapp:readValue("setWhatsapp"),
    address:readValue("setAddress"),
    safeRadius:Number(readValue("setSafeRadius")||1000),
    locationInterval:readValue("setLocationInterval"),
    geofenceAlert:readCheckbox("setGeofenceAlert"),
    locationHistory:readCheckbox("setLocationHistory"),
    tourLeader:readValue("setTourLeader"),
    tourLeaderPhone:readValue("setTourLeaderPhone"),
    emergencyPhone:readValue("setEmergencyPhone"),
    sosEnabled:readCheckbox("setSosEnabled"),
    notifySos:readCheckbox("setNotifySos"),
    notifyAttendance:readCheckbox("setNotifyAttendance"),
    notifyDocuments:readCheckbox("setNotifyDocuments"),
    defaultBroadcast:readValue("setDefaultBroadcast"),
    programName:readValue("setProgramName"),
    departureDate:readValue("setDepartureDate"),
    meetingPoint:readValue("setMeetingPoint"),
    totalJamaah:Number(readValue("setTotalJamaah")||0),
    autoLogout:readCheckbox("setAutoLogout"),
    autoLogoutMinutes:readValue("setAutoLogoutMinutes"),
    emergencyConfirm:readCheckbox("setEmergencyConfirm")
  };

  try{
    await mtSaveSettings(data);

    const toast=document.getElementById("settingsSaved");
    if(toast){
      toast.classList.remove("hidden");
      setTimeout(()=>toast.classList.add("hidden"),2200);
    }
  }catch(err){
    console.error("Save settings:",err);
    alert("Pengaturan gagal disimpan: "+err.message);
  }
}
