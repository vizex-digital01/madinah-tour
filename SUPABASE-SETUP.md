# Sambungkan Madinah Journey ke Supabase

## 1. Buat project Supabase
Buat project baru di Supabase.

## 2. Jalankan database
Buka:
SQL Editor → New query

Copy seluruh isi:
`supabase/schema.sql`

Lalu Run.

## 3. Isi koneksi website
Buka:
`assets/js/supabase-config.js`

Isi:

```js
window.MT_SUPABASE_URL = "https://xxxxx.supabase.co";
window.MT_SUPABASE_KEY = "sb_publishable_xxxxx";
```

Gunakan Publishable/Anon key yang memang untuk client browser.

**JANGAN pernah memasukkan `service_role` key ke GitHub atau file browser.**

## 4. Buat akun admin
Supabase:
Authentication → Users → Add user

Contoh:
- Email: admin@madinahtour.com
- Password: password kuat

Setelah user dibuat, copy User UUID.

SQL Editor:

```sql
update public.profiles
set role='super_admin',
    full_name='Admin Madinah Tour'
where id='UUID_USER_ADMIN';
```

## 5. Buat jamaah pertama
Tambahkan row di Table Editor → `jamaah`.

Lalu buat user di Authentication.

Copy:
- UUID user auth
- UUID row jamaah

Jalankan:

```sql
update public.profiles
set role='jamaah',
    jamaah_id='UUID_JAMAAH',
    full_name='Ahmad Fauzi'
where id='UUID_AUTH_USER';
```

## 6. Login
Sekarang halaman login memakai Supabase Auth.

Admin akan diarahkan ke `/admin/`.
Jamaah diarahkan ke `/jamaah/`.

## 7. Live location
Saat jamaah klik **Aktifkan Lokasi**:
- browser meminta permission GPS
- latitude / longitude masuk tabel `locations`
- Command Center admin bisa mengambil lokasi terbaru

## 8. SOS
Saat jamaah klik **SOS**:
- row baru masuk ke `sos_alerts`
- dashboard admin berlangganan perubahan realtime

## 9. Pengaturan
Menu Pengaturan Admin bisa dipindahkan ke tabel `app_settings`.
Integrasi helper `mtLoadSettings()` dan `mtSaveSettings()` sudah tersedia.

## Catatan penting produksi
- Gunakan HTTPS (Vercel sudah HTTPS).
- Jangan expose service-role key.
- RLS wajib tetap aktif.
- Informasikan dengan jelas kepada jamaah kapan lokasi dibagikan.
- Untuk background location terus-menerus saat browser ditutup, web/PWA memiliki batasan; aplikasi native lebih cocok.
