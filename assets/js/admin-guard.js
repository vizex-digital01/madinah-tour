
(async function(){
  const auth=await requireAdminPage();
  if(!auth) return;

  const name=auth.profile?.full_name || "Admin Madinah Tour";

  const nameEl=document.getElementById("adminName");
  if(nameEl) nameEl.textContent="Login sebagai "+name;

  document.documentElement.dataset.authReady="true";
})();
