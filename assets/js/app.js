
function togglePassword(){
  const el=document.getElementById('password');
  const btn=document.getElementById('showPass');
  if(!el) return;
  const show=el.type==='password';
  el.type=show?'text':'password';
  if(btn) btn.textContent=show?'Sembunyikan':'Lihat';
}

function loginDemo(e){
  e.preventDefault();
  const user=document.getElementById('login').value.trim().toLowerCase();
  const pass=document.getElementById('password').value.trim();
  const status=document.getElementById('status');

  if(!user || !pass){
    status.textContent='Masukkan akun dan password terlebih dahulu.';
    return;
  }

  if((user==='admin' || user==='admin@madinahtour.com') && pass==='admin123'){
    localStorage.setItem('mt_session', JSON.stringify({role:'admin',name:'Admin Madinah Tour'}));
    location.href='/admin/';
    return;
  }

  if((user==='jamaah' || user==='081234567890') && pass==='123456'){
    localStorage.setItem('mt_session', JSON.stringify({role:'jamaah',name:'Ahmad Fauzi'}));
    location.href='/jamaah/';
    return;
  }

  status.textContent='Akun atau password tidak cocok.';
}
