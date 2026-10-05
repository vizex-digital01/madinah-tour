<?php
session_start();
require_once __DIR__ . "/config/database.php";

$error = "";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $login = trim($_POST["login"] ?? "");
    $password = $_POST["password"] ?? "";

    $stmt = $pdo->prepare("SELECT * FROM users WHERE (email = ? OR phone = ? OR username = ?) AND status = 'active' LIMIT 1");
    $stmt->execute([$login, $login, $login]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user["password_hash"])) {
        $_SESSION["user_id"] = $user["id"];
        $_SESSION["role"] = $user["role"];
        $_SESSION["name"] = $user["name"];
        $_SESSION["jamaah_id"] = $user["jamaah_id"];

        if (in_array($user["role"], ["super_admin","admin_operasional","tour_leader"], true)) {
            header("Location: admin/dashboard.php");
        } else {
            header("Location: jamaah/dashboard.php");
        }
        exit;
    }

    $error = "Login gagal. Periksa kembali akun dan password.";
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Login | Madinah Journey</title>
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<div class="login-page">
  <section class="login-visual">
    <div>
      <div style="font-weight:800;letter-spacing:.08em">MADINAH JOURNEY</div>
      <div class="big" style="margin-top:50px">Semua persiapan Umroh Anda, dalam satu tempat.</div>
      <p style="font-size:18px;max-width:620px;color:#dbeafe;margin-top:20px">
        Pantau dokumen, manasik, itinerary, perlengkapan, lokasi, dan bantuan darurat selama perjalanan.
      </p>
    </div>
    <div style="font-size:14px;color:#bfdbfe">MadinahTour.com — Travel Haji dan Umroh</div>
  </section>

  <section class="login-card-wrap">
    <div class="card login-card">
      <img src="assets/img/madinah-tour-logo.jpeg" class="login-logo" alt="Madinah Tour">
      <h1 style="margin:0;font-size:28px;color:#082f63">Masuk ke Portal</h1>
      <p class="muted">Gunakan akun jamaah atau admin Anda.</p>

      <?php if ($error): ?>
        <div class="alert alert-error"><?= htmlspecialchars($error) ?></div>
      <?php endif; ?>

      <form method="post" class="grid" style="gap:14px;margin-top:18px">
        <div class="form-group">
          <label>Email / No. WhatsApp / Username</label>
          <input type="text" name="login" required placeholder="Contoh: 081234567890">
        </div>

        <div class="form-group">
          <label>Password / PIN</label>
          <input id="password" type="password" name="password" required placeholder="Masukkan password">
        </div>

        <label style="font-size:13px;display:flex;gap:8px;align-items:center">
          <input type="checkbox" onclick="togglePassword()" style="width:auto"> Tampilkan password
        </label>

        <button class="btn btn-primary" type="submit">Masuk</button>
      </form>

      <div class="footer-note">Akun jamaah dibuat oleh admin Madinah Tour.</div>
    </div>
  </section>
</div>
<script src="assets/js/app.js"></script>
</body>
</html>
