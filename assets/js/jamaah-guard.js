
(async function(){
  const auth=await requireJamaahPage();
  if(!auth) return;

  const name=auth.profile?.full_name || "Jamaah";

  const nameEl=document.getElementById("jamaahName");
  if(nameEl) nameEl.textContent=name;

  document.documentElement.dataset.authReady="true";
})();
