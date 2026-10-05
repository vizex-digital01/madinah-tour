
const MT={
  users:{
    admin:{password:"admin123",role:"admin",name:"Admin Madinah Tour"},
    "admin@madinahtour.com":{password:"admin123",role:"admin",name:"Admin Madinah Tour"},
    jamaah:{password:"123456",role:"jamaah",name:"Ahmad Fauzi"},
    "081234567890":{password:"123456",role:"jamaah",name:"Ahmad Fauzi"}
  }
};

function loginDemo(e){
  e.preventDefault();
  const u=document.getElementById("login").value.trim().toLowerCase();
  const p=document.getElementById("password").value.trim();
  const s=document.getElementById("status");
  const user=MT.users[u];
  if(!user || user.password!==p){s.textContent="Akun atau password tidak cocok.";return}
  localStorage.setItem("mt_session",JSON.stringify({role:user.role,name:user.name}));
  location.href=user.role==="admin"?"/admin/":"/jamaah/";
}
function togglePassword(){
  const p=document.getElementById("password"),b=document.getElementById("showPass");
  const sh=p.type==="password";p.type=sh?"text":"password";b.textContent=sh?"Sembunyikan":"Lihat";
}
function session(role){
  try{
    const s=JSON.parse(localStorage.getItem("mt_session")||"null");
    if(!s||s.role!==role){location.href="/";return null}
    return s;
  }catch(e){location.href="/";return null}
}
function logout(){localStorage.removeItem("mt_session");location.href="/"}
function toggleSidebar(){document.getElementById("sidebar").classList.toggle("open")}
function showSection(id,btn){
  document.querySelectorAll(".admin-section").forEach(x=>x.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  document.querySelectorAll(".nav button").forEach(x=>x.classList.remove("active"));
  if(btn)btn.classList.add("active");
  if(window.innerWidth<760)document.getElementById("sidebar").classList.remove("open");
  setTimeout(()=>{if(id==="tracking" && window.adminMap)window.adminMap.invalidateSize()},100);
}
function sendBroadcast(){
  const msg=document.getElementById("broadcastText").value.trim();
  document.getElementById("broadcastStatus").textContent=msg?"Pengumuman demo berhasil dibuat. Versi produksi nanti dikirim ke jamaah.":"Tulis pesan terlebih dahulu.";
}
function openIncident(){
  document.getElementById("incidentModal").classList.remove("hidden");
}
function closeIncident(){document.getElementById("incidentModal").classList.add("hidden")}
function saveIncident(){
  const t=document.getElementById("incidentText").value.trim();
  if(!t){alert("Isi kronologi terlebih dahulu.");return}
  alert("Incident Report demo berhasil disimpan.");
  closeIncident();
}
function sos(){
  if(confirm("Aktifkan SOS darurat?")){
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
        p=>alert(`SOS aktif.\nLokasi didapat: ${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}\nPada versi produksi akan terkirim ke admin.`),
        ()=>alert("SOS aktif, tetapi lokasi tidak tersedia.")
      );
    }else alert("SOS aktif. Browser tidak mendukung lokasi.");
  }
}
function myLocation(){
  const st=document.getElementById("locationStatus");
  st.textContent="Meminta izin lokasi...";
  navigator.geolocation.getCurrentPosition(
    p=>{
      st.textContent=`Lokasi aktif • akurasi ±${Math.round(p.coords.accuracy)} m`;
      if(window.jamaahMap){
        const ll=[p.coords.latitude,p.coords.longitude];
        L.marker(ll).addTo(window.jamaahMap).bindPopup("Lokasi Anda").openPopup();
        window.jamaahMap.setView(ll,16);
      }
    },
    ()=>st.textContent="Izin lokasi ditolak atau tidak tersedia.",
    {enableHighAccuracy:true,timeout:10000}
  );
}


const defaultAdminSettings = {
  travelName: "Madinah Tour",
  portalName: "Madinah Journey",
  whatsapp: "0811-8802-1519",
  address: "Jl. Akses Marunda No.35B, Cilincing, Jakarta Utara",
  safeRadius: 1000,
  locationInterval: "60",
  geofenceAlert: true,
  locationHistory: true,
  tourLeader: "Tour Leader Madinah Tour",
  tourLeaderPhone: "",
  emergencyPhone: "0811-8802-1519",
  sosEnabled: true,
  notifySos: true,
  notifyAttendance: true,
  notifyDocuments: true,
  defaultBroadcast: "Assalamualaikum. Mohon seluruh jamaah memperhatikan informasi terbaru dari tim Madinah Tour.",
  programName: "Umroh 9 Hari",
  departureDate: "2026-11-02",
  meetingPoint: "Bandara Soekarno-Hatta",
  totalJamaah: 120,
  autoLogout: true,
  autoLogoutMinutes: "30",
  emergencyConfirm: true
};

function getAdminSettings(){
  try{
    return {...defaultAdminSettings, ...JSON.parse(localStorage.getItem("mt_admin_settings") || "{}")};
  }catch(e){
    return {...defaultAdminSettings};
  }
}

function setVal(id,val){
  const el=document.getElementById(id);
  if(!el) return;
  if(el.type==="checkbox") el.checked=!!val;
  else el.value=val ?? "";
}

function loadAdminSettings(){
  const s=getAdminSettings();
  setVal("setTravelName",s.travelName);
  setVal("setPortalName",s.portalName);
  setVal("setWhatsapp",s.whatsapp);
  setVal("setAddress",s.address);
  setVal("setSafeRadius",s.safeRadius);
  setVal("setLocationInterval",s.locationInterval);
  setVal("setGeofenceAlert",s.geofenceAlert);
  setVal("setLocationHistory",s.locationHistory);
  setVal("setTourLeader",s.tourLeader);
  setVal("setTourLeaderPhone",s.tourLeaderPhone);
  setVal("setEmergencyPhone",s.emergencyPhone);
  setVal("setSosEnabled",s.sosEnabled);
  setVal("setNotifySos",s.notifySos);
  setVal("setNotifyAttendance",s.notifyAttendance);
  setVal("setNotifyDocuments",s.notifyDocuments);
  setVal("setDefaultBroadcast",s.defaultBroadcast);
  setVal("setProgramName",s.programName);
  setVal("setDepartureDate",s.departureDate);
  setVal("setMeetingPoint",s.meetingPoint);
  setVal("setTotalJamaah",s.totalJamaah);
  setVal("setAutoLogout",s.autoLogout);
  setVal("setAutoLogoutMinutes",s.autoLogoutMinutes);
  setVal("setEmergencyConfirm",s.emergencyConfirm);
}

function readCheckbox(id){
  const el=document.getElementById(id);
  return !!(el && el.checked);
}
function readValue(id){
  const el=document.getElementById(id);
  return el ? el.value : "";
}

function saveAdminSettings(){
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

  localStorage.setItem("mt_admin_settings",JSON.stringify(data));

  const toast=document.getElementById("settingsSaved");
  if(toast){
    toast.classList.remove("hidden");
    setTimeout(()=>toast.classList.add("hidden"),2200);
  }

  // Update quick broadcast placeholder with saved default message
  const quick=document.getElementById("quickBroadcast");
  if(quick && data.defaultBroadcast) quick.placeholder=data.defaultBroadcast;
}
