
function togglePassword(){
  const p=document.getElementById("password");
  const b=document.getElementById("showPass");
  const show=p.type==="password";
  p.type=show?"text":"password";
  if(b) b.textContent=show?"Sembunyikan":"Lihat";
}

async function loginSupabase(e){
  e.preventDefault();
  const email=document.getElementById("login").value.trim();
  const password=document.getElementById("password").value;
  const status=document.getElementById("status");
  status.textContent="Memeriksa akun...";

  try{
    const result=await mtSignIn(email,password);
    const role=result.profile.role;

    if(["super_admin","admin_operasional","tour_leader"].includes(role)){
      location.href="/admin/";
      return;
    }
    if(role==="jamaah"){
      location.href="/jamaah/";
      return;
    }
    throw new Error("Role akun tidak dikenali.");
  }catch(err){
    console.error(err);
    status.textContent=err.message || "Login gagal.";
  }
}

function logout(){
  if(window.mtLogout) mtLogout();
}
