# Rizkyyullah Portfolio API

Backend ini merupakan API untuk portfolio pribadi saya menggunakan Node.js, Express, dan MongoDB.

## Persyaratan
- Node.js 18 atau lebih baru
- MongoDB yang dapat diakses oleh aplikasi
- API key Resend (opsional, untuk pengiriman email)

## Instalasi

```bash
npm install
cp .env.example .env
```

Isi nilai `MONGO_URL`, `DB_NAME`, dan konfigurasi lain di `.env`.

## Menjalankan

Mode development:

```bash
npm run dev
```

Mode production:

```bash
npm start
```

Server berjalan pada port `8000` secara default.

## Endpoint

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/` | Informasi API |
| POST | `/api/contact` | Menyimpan pesan kontak, mengirim email, lalu memeriksa apakah email benar-benar terkirim |
| GET | `/api/github/repos` | Mengambil repository GitHub non-fork dengan cache 30 menit |

### Contoh body POST `/api/contact`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello!"
}
```

Validasi input menggunakan Zod. Pesan tetap disimpan meskipun Resend tidak dikonfigurasi atau pengiriman email gagal.

Respons sukses (`200`) memuat `email_status`:

| `email_status` | Arti |
|---|---|
| `delivered` | Resend mengonfirmasi email diterima server email penerima |
| `failed` | Email tidak terkirim (Resend menolak, bounced, atau `RESEND_API_KEY` belum diisi). Cek `OWNER_EMAIL`/`SENDER_EMAIL` |
| `unconfirmed` | Resend menerima email, tapi hasil akhirnya belum diketahui dalam ±8 detik |
| `accepted` | Resend menerima email, tapi API key tidak boleh membaca status (key "Sending access"), jadi pengiriman tidak bisa dicek |

`email_sent` tetap ada (`true` untuk `delivered` dan `accepted`). Status terakhir juga disimpan di koleksi `contact_messages`.

Jika validasi gagal, API membalas `422` dengan `{ "detail": [{ "field": "email", "msg": "Please enter a valid email address" }] }`; frontend menampilkan `detail[0].msg`.

## Catatan
- `CORS_ORIGINS` menerima daftar origin yang dipisahkan koma. Untuk penggunaan production, isi dengan domain frontend yang diizinkan.
- Jangan commit file `.env` atau membagikan API key.
- Supaya request tidak menggantung: koneksi MongoDB memakai timeout (pemilihan server 8 dtk, socket 20 dtk), pengiriman email ke Resend dibatasi 10 dtk, dan pemeriksaan status pengiriman maksimal 8 dtk (total ≤ 15 dtk).
- Deteksi email gagal butuh API key Resend dengan permission **Full access**. Key **Sending access** hanya bisa mengirim, sehingga hasilnya selalu `accepted`. Alamat yang salah ketik tetapi domainnya ada dan aktif tetap tercatat `delivered`; itu tidak bisa dideteksi oleh siapa pun.
- Cache repo GitHub di MongoDB bersifat opsional: jika MongoDB bermasalah, daftar repo tetap diambil langsung dari GitHub.
- Tidak ada endpoint untuk membaca pesan kontak yang tersimpan (sengaja dihapus agar data pengunjung tidak bisa diakses sembarang orang). Lihat langsung di koleksi `contact_messages` lewat MongoDB Atlas atau Compass.
- HTML email meng-escape input pengguna untuk mengurangi risiko HTML injection.
