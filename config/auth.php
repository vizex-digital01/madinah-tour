<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function require_login() {
    if (empty($_SESSION['user_id'])) {
        header("Location: /index.php");
        exit;
    }
}

function require_role(array $roles) {
    require_login();
    if (!in_array($_SESSION['role'] ?? '', $roles, true)) {
        http_response_code(403);
        exit("Akses ditolak.");
    }
}
