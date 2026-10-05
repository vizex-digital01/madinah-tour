<?php
require_once __DIR__ . "/../config/auth.php";
require_role(["super_admin","admin_operasional","tour_leader"]);
$name = $_SESSION["name"] ?? "Admin";
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin Dashboard | Madinah Journey</title>
<link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>

<aside class="sidebar">
  <div class="brand"><img src="../assets/img/madinah-tour-logo.jpeg" alt="Madinah Tour"></div>
  <nav>
    <a class="active" href="dashboard.php">Dashboard</a>
    <a href="#">Data Jamaah</a>
    <a href="#">Dokumen</a>
    <a href="#">Live Location</a>
    <a href="#">Absensi</a>
    <a href="#">Bus & Hotel</a>
    <a href="#">Incident</a>
    <a href="#">Broadcast</a>
    <a href="#">User & Admin</a>
  </nav>
</aside>

<div class="admin-main">
  <header class="admin-head">
    <div>
      <b>Command Center Madinah Tour</b>
      <div class="muted" style="font-size:12px">Login sebagai <?= htmlspecialchars($name) ?></div>
    </div>
    <a href="../logout.php" class="btn btn-soft">Keluar</a>
  </header>

  <main class="admin-content">
    <div>
      <div class="section-title" style="font-size:28px">Dashboard Operasional</div>
      <p class="muted">Pantau kesiapan jamaah dan kondisi rombongan.</p>
    </div>

    <section class="grid grid-4" style="margin-top:18px">
      <div class="card stat"><div class="label">Total Jamaah</div><div class="value">120</div></div>
      <div class="card stat"><div class="label">Sudah Kumpul</div><div class="value" style="color:#16a34a">109</div></div>
      <div class="card stat"><div class="label">Belum Kumpul</div><div class="value" style="color:#d97706">11</div></div>
      <div class="card stat"><div class="label">SOS Aktif</div><div class="value" style="color:#dc2626">1</div></div>
    </section>

    <section class="grid grid-3" style="margin-top:18px">
      <div class="card" style="padding:20px">
        <div class="section-title">Live Location</div>
        <p class="muted">112 jamaah aktif berbagi lokasi.</p>
        <div class="list" style="margin-top:12px">
          <div class="list-item"><span>Ahmad Fauzi</span><span class="badge badge-green">Online</span></div>
          <div class="list-item"><span>Budi Santoso</span><span class="badge badge-yellow">12 menit</span></div>
          <div class="list-item"><span>Hasan Ali</span><span class="badge badge-red">SOS</span></div>
        </div>
      </div>

      <div class="card" style="padding:20px">
        <div class="section-title">Absensi & Bus</div>
        <div class="list" style="margin-top:12px">
          <div class="list-item"><span>Meeting Point</span><b>109/120</b></div>
          <div class="list-item"><span>Naik Bus</span><b>104/120</b></div>
          <div class="list-item"><span>Check-in Hotel</span><b>116/120</b></div>
        </div>
      </div>

      <div class="card" style="padding:20px">
        <div class="section-title">Perlu Ditindak</div>
        <div class="list" style="margin-top:12px">
          <div class="list-item"><span>Paspor belum lengkap</span><b>4</b></div>
          <div class="list-item"><span>Vaksin belum lengkap</span><b>9</b></div>
          <div class="list-item"><span>Visa proses</span><b>21</b></div>
        </div>
      </div>
    </section>

    <section class="card" style="padding:20px;margin-top:18px">
      <div style="display:flex;justify-content:space-between;gap:16px;align-items:center;flex-wrap:wrap">
        <div>
          <div class="section-title">Daftar Jamaah</div>
          <div class="muted">Contoh tampilan monitoring admin.</div>
        </div>
        <button class="btn btn-primary">+ Tambah Jamaah</button>
      </div>

      <div class="table-wrap" style="margin-top:14px">
        <table>
          <thead>
            <tr><th>Nama</th><th>Paspor</th><th>Vaksin</th><th>Visa</th><th>Manasik</th><th>Status</th></tr>
          </thead>
          <tbody>
            <tr><td>Ahmad Fauzi</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td><span class="badge badge-green">Lengkap</span></td></tr>
            <tr><td>Budi Santoso</td><td>✅</td><td>✅</td><td>⏳</td><td>✅</td><td><span class="badge badge-yellow">Proses</span></td></tr>
            <tr><td>Hasan Ali</td><td>❌</td><td>✅</td><td>❌</td><td>❌</td><td><span class="badge badge-red">Belum Lengkap</span></td></tr>
          </tbody>
        </table>
      </div>
    </section>
  </main>
</div>
</body>
</html>
