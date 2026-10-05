
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
