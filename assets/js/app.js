
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
    const result=await mtSignIn(email,password);
    const role=(result?.profile?.role || "").trim();

    localStorage.setItem("mt_last_role", role);

    if(["super_admin","admin_operasional","tour_leader"].includes(role)){
      window.location.href="/admin/";
      return;
    }

    if(role==="jamaah"){
      window.location.href="/jamaah/";
      return;
    }

    throw new Error("Role akun tidak dikenali: "+role);
  }catch(err){
    console.error(err);
    if(status) status.textContent=err?.message || "Login gagal.";
  }
}

async function requireAdminPage(){
  try{
    const data=await mtGetSessionProfile();
    if(!data){
      location.href="/";
      return null;
    }

    const role=(data.profile?.role || "").trim();

    if(!["super_admin","admin_operasional","tour_leader"].includes(role)){
      if(role==="jamaah"){
        location.href="/jamaah/";
      }else{
        location.href="/";
      }
      return null;
    }

    return data;
  }catch(err){
    console.error(err);
    location.href="/";
    return null;
  }
}

async function requireJamaahPage(){
  try{
    const data=await mtGetSessionProfile();
    if(!data){
      location.href="/";
      return null;
    }

    const role=(data.profile?.role || "").trim();

    if(role==="jamaah"){
      return data;
    }

    if(["super_admin","admin_operasional","tour_leader"].includes(role)){
      location.href="/admin/";
      return null;
    }

    location.href="/";
    return null;
  }catch(err){
    console.error(err);
    location.href="/";
    return null;
  }
}

function logout(){
  if(window.mtLogout){
    mtLogout();
  }else{
    location.href="/";
  }
}

function toggleSidebar(){
  const el=document.getElementById("sidebar");
  if(el) el.classList.toggle("open");
}

function showSection(id,btn){
  document.querySelectorAll(".admin-section").forEach(x=>x.classList.add("hidden"));
  const target=document.getElementById(id);
  if(target) target.classList.remove("hidden");

  document.querySelectorAll(".nav button").forEach(x=>x.classList.remove("active"));
  if(btn) btn.classList.add("active");

  if(window.innerWidth<760){
    const sidebar=document.getElementById("sidebar");
    if(sidebar) sidebar.classList.remove("open");
  }

  setTimeout(()=>{
    if(id==="tracking" && window.adminMap) window.adminMap.invalidateSize();
  },100);
}
