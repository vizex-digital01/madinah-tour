
function togglePassword(){
  const p=document.getElementById("password");
  const b=document.getElementById("showPass");
  if(!p) return;

  const show=p.type==="password";
  p.type=show?"text":"password";

  if(b){
    b.textContent=show?"Sembunyikan":"Lihat";
  }
}

async function loginSupabase(e){
  e.preventDefault();

  const email=document.getElementById("login").value.trim();
  const password=document.getElementById("password").value;
  const status=document.getElementById("status");

  if(status){
    status.textContent="Memeriksa akun...";
  }

  try{
    const result=await mtSignIn(email,password);
    const role=result?.profile?.role;

    console.log("Madinah Journey profile:", result.profile);

    if(
      role==="super_admin" ||
      role==="admin_operasional" ||
      role==="tour_leader"
    ){
      window.location.replace("/admin/");
      return;
    }

    if(role==="jamaah"){
      window.location.replace("/jamaah/");
      return;
    }

    throw new Error("Role akun tidak dikenali: "+role);

  }catch(err){
    console.error(err);

    if(status){
      status.textContent=err?.message || "Login gagal.";
    }
  }
}

async function session(role){
  if(!window.mtRequireRole){
    return null;
  }

  const roles = role==="admin"
    ? ["super_admin","admin_operasional","tour_leader"]
    : ["jamaah"];

  return await mtRequireRole(roles);
}

function logout(){
  if(window.mtLogout){
    mtLogout();
  }else{
    location.href="/";
  }
}

function toggleSidebar(){
  const sidebar=document.getElementById("sidebar");
  if(sidebar){
    sidebar.classList.toggle("open");
  }
}

function showSection(id,btn){
  document.querySelectorAll(".admin-section").forEach(section=>{
    section.classList.add("hidden");
  });

  const target=document.getElementById(id);
  if(target){
    target.classList.remove("hidden");
  }

  document.querySelectorAll(".nav button").forEach(button=>{
    button.classList.remove("active");
  });

  if(btn){
    btn.classList.add("active");
  }

  if(window.innerWidth<760){
    const sidebar=document.getElementById("sidebar");
    if(sidebar){
      sidebar.classList.remove("open");
    }
  }

  setTimeout(()=>{
    if(id==="tracking" && window.adminMap){
      window.adminMap.invalidateSize();
    }
  },100);
}

async function myLocation(){
  const st=document.getElementById("locationStatus");

  if(!navigator.geolocation){
    if(st){
      st.textContent="Browser tidak mendukung GPS.";
    }
    return;
  }

  if(st){
    st.textContent="Meminta izin lokasi...";
  }

  navigator.geolocation.getCurrentPosition(
    async pos=>{
      try{
        if(window.mtInsertLocation){
          await mtInsertLocation({
            latitude:pos.coords.latitude,
            longitude:pos.coords.longitude,
            accuracy:pos.coords.accuracy
          });
        }

        if(st){
          st.textContent=`Lokasi aktif & tersimpan • akurasi ±${Math.round(pos.coords.accuracy)} m`;
        }

        if(window.jamaahMap){
          const ll=[pos.coords.latitude,pos.coords.longitude];
          L.marker(ll).addTo(window.jamaahMap).bindPopup("Lokasi Anda").openPopup();
          window.jamaahMap.setView(ll,16);
        }
      }catch(err){
        console.error(err);

        if(st){
          st.textContent="Lokasi didapat tetapi gagal disimpan: "+err.message;
        }
      }
    },
    ()=>{
      if(st){
        st.textContent="Izin lokasi ditolak atau tidak tersedia.";
      }
    },
    {
      enableHighAccuracy:true,
      timeout:10000,
      maximumAge:15000
    }
  );
}

function sos(){
  if(!confirm("Aktifkan SOS darurat?")){
    return;
  }

  const send=async(latitude=null,longitude=null)=>{
    try{
      if(window.mtCreateSOS){
        await mtCreateSOS({latitude,longitude});
      }

      alert("SOS aktif. Alert telah dikirim ke Command Center Admin.");
    }catch(err){
      console.error(err);
      alert("SOS gagal dikirim: "+err.message);
    }
  };

  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(
      pos=>send(pos.coords.latitude,pos.coords.longitude),
      ()=>send(),
      {
        enableHighAccuracy:true,
        timeout:8000
      }
    );
  }else{
    send();
  }
}
