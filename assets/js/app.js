
function confirmSOS(){
  return confirm("Aktifkan SOS? Tim operasional akan melihat alert darurat Anda.");
}
function togglePassword(){
  const el=document.getElementById('password');
  if(el) el.type = el.type === 'password' ? 'text' : 'password';
}
