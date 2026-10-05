# Madinah Journey V6 — Full Supabase

Versi full yang sudah menghapus login demo lama.

## Yang sudah aktif
- Supabase Auth
- Role routing:
  - super_admin → /admin/
  - admin_operasional → /admin/
  - tour_leader → /admin/
  - jamaah → /jamaah/
- Guard halaman Admin/Jamaah
- Supabase database + RLS
- Live location jamaah
- SOS jamaah
- Realtime Command Center
- Pengaturan Admin tersimpan di Supabase
- Dashboard Admin dan Jamaah

## Cara update GitHub
Paling aman:
1. Backup repo lama jika perlu.
2. Replace seluruh file/folder repo dengan isi ZIP ini.
3. Commit.
4. Tunggu Vercel deploy sampai Ready.
5. Buka website dengan Ctrl+Shift+R.
6. Login dengan akun Supabase.

## Akun admin saat ini
Gunakan email user Supabase yang sudah diberi role `super_admin`.

## Security
Publishable key Supabase boleh berada di frontend. Jangan pernah commit service_role key.
