<?php
require_once __DIR__ . "/../config/auth.php";
require_role(["jamaah"]);
$name = $_SESSION["name"] ?? "Jamaah";
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Dashboard Jamaah | Madinah Journey</title>
<link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>
<header class="topbar">
  <div class="container topbar-inner">
    <img src="../assets/img/madinah-tour-logo.jpeg" class="logo" alt="Madinah Tour">
    <a class="btn btn-soft" href="../logout.php">Keluar</a>
  </div>
</header>

<main class="container page">
  <section class="hero">
    <div style="display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap">
      <div>
        <div style="color:#bfdbfe">Assalamualaikum,</div>
        <h1 style="font-size:34px;margin:4px 0"><?= htmlspecialchars($name) ?></h1>
        <p style="color:#dbeafe">Persiapan perjalanan menuju Baitullah.</p>
      </div>
      <div style="background:rgba(255,255,255,.12);padding:15px 20px;border-radius:18px;text-align:center">
        <div style="font-size:32px;font-weight:900">28</div>
        <div style="font-size:12px;color:#dbeafe">Hari Lagi</div>
      </div>
    </div>

    <div style="margin-top:26px">
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:7px">
        <span>Progress Persiapan</span><b>78%</b>
      </div>
      <div class="progress"><span style="width:78%"></span></div>
    </div>
  </section>

  <section class="grid grid-4" style="margin-top:20px">
    <div class="card stat"><div class="label">Data Jamaah</div><div class="value" style="color:#16a34a">Lengkap</div></div>
    <div class="card stat"><div class="label">Paspor</div><div class="value" style="color:#16a34a">OK</div></div>
    <div class="card stat"><div class="label">Visa</div><div class="value" style="color:#d97706">Proses</div></div>
    <div class="card stat"><div class="label">Manasik</div><div class="value" style="color:#0b4ca0">70%</div></div>
  </section>

  <section class="grid grid-2" style="margin-top:20px">
    <div class="card" style="padding:22px">
      <div class="section-title">Perjalanan Saya</div>
      <div class="list" style="margin-top:15px">
        <div class="list-item"><span>Data Jamaah</span><span class="badge badge-green">Selesai</span></div>
        <div class="list-item"><span>Dokumen & Vaksin</span><span class="badge badge-green">Selesai</span></div>
        <div class="list-item"><span>Visa Umroh</span><span class="badge badge-yellow">Proses</span></div>
        <div class="list-item"><span>Manasik</span><span class="badge badge-blue">Berjalan</span></div>
        <div class="list-item"><span>Perlengkapan</span><span class="badge">Belum</span></div>
      </div>
    </div>

    <div class="card" style="padding:22px">
      <div class="section-title">Keselamatan Jamaah</div>
      <p class="muted">Bagikan lokasi hanya selama perjalanan jika diperlukan untuk membantu tim menemukan Anda.</p>
      <button class="btn btn-primary" style="width:100%;margin-top:10px">Aktifkan Lokasi</button>
      <form onsubmit="return confirmSOS()" style="margin-top:10px">
        <button class="btn btn-danger" style="width:100%" type="submit">SOS Darurat</button>
      </form>
    </div>
  </section>

  <section class="card" style="padding:22px;margin-top:20px">
    <div class="section-title">Keberangkatan</div>
    <div class="grid grid-3" style="margin-top:16px">
      <div><div class="muted">Tanggal</div><b>02 November 2026</b></div>
      <div><div class="muted">Rute</div><b>Jakarta → Madinah</b></div>
      <div><div class="muted">Program</div><b>Umroh 9 Hari</b></div>
    </div>
  </section>
</main>

<script src="../assets/js/app.js"></script>
</body>
</html>
