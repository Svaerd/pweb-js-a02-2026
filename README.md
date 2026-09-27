# Mini Shopee — Praktikum Web Programming A02

Aplikasi katalog produk dua halaman (**Login** + **Katalog**) yang dibangun
native dari nol: HTML, CSS, dan JavaScript murni tanpa framework, library, atau
template pihak ketiga. Seluruh gaya ditulis manual di `css/style.css`.

## Menjalankan

Butuh server statis (bukan `file://`) karena halaman melakukan `fetch()` ke API
eksternal.

```bash
python3 -m http.server 8000
```

Lalu buka `http://localhost:8000/login.html`.

## Akun Demo

Autentikasi utama memakai **Users API**. Ambil satu username dari
<https://dummyjson.com/users> lalu masukkan password yang tertera di halaman itu,
atau pakai akun dari API login berikut:

| Username | Password |
| --- | --- |
| `emilyj` | `emily123` |
| `johndoe` | `john123` |
| `janet` | `janet123` |

Bisa juga mendaftar sendiri di `signup.html` — akun tersimpan di `localStorage`
browser dengan password di-hash.

## Halaman

| File | Isi |
| --- | --- |
| `login.html` | Form login, loading state, error handling, simpan `firstName` ke localStorage, auto-redirect |
| `signup.html` | Pendaftaran akun lokal (nilai tambahan) |
| `index.html` | Katalog produk, search, filter, sort, keranjang, wishlist, modal detail |
| `cart.html` | Halaman keranjang lengkap dengan quantity stepper dan checkout simulasi |
| `wishlist.html` | Wishlist dengan search/filter/sort yang sama seperti katalog |
| `settings.html` | Ubah profil dan ganti tema terang/gelap |

## Konsep JavaScript yang dipakai

- **fetch() + try...catch** — ambil Users API dan Products API, pesan error
  visual kalau request gagal.
- **Debounce dengan Closure** — `debounce()` di `js/catalog.js` menahan
  pencarian sampai ketikan berhenti 300 ms.
- **Event Delegation** — satu listener di `#product-grid` dan `#cart-list`
  menangani klik dari kartu/baris yang dirender dinamis.
- **Functional Programming** — `filter()`, `sort()`, `reduce()`, dan `slice()`
  untuk penyaringan, pengurutan, total belanja, dan pagination.
- **Local Storage CRUD** — `setItem`, `getItem`, `removeItem` untuk sesi,
  keranjang, wishlist, profil, dan tema.

## Penyimpanan di localStorage

| Key | Isi |
| --- | --- |
| `firstName` | Nama depan pengguna — penanda sesi login (auth guard) |
| `users` | Akun hasil pendaftaran, password disimpan sebagai hash |
| `cart` | Item keranjang `{ id, title, price, thumbnail, qty }` |
| `wishlist` | Objek produk yang ditandai hati |
| `profile` | Nama, jenis kelamin, email, nomor HP |
| `theme` | `dark` (default) atau `light` |

## Catatan Teknis

- Tidak ada Google Fonts. Tipografi memakai stack monospace bawaan sistem,
  jadi aplikasi tampil benar walau tanpa koneksi.
- `js/auth.js` memakai SHA-256 lewat `crypto.subtle` bila halaman dibuka lewat
  `https`/`localhost`. Bila dibuka langsung dari `file://` (tanpa secure
  context), ia otomatis jatuh ke hash FNV-1a dan menandainya, sehingga signup
  dan login tetap berfungsi di kedua mode.
- Ikon memakai SVG lokal di `img/`, sudah difilter agar kontras di tema terang
  maupun gelap.
- `css/style.css` mengikuti spesifikasi desain di `DESIGN.md` (Textmode &
  Pixelated Brutalism): latar hitam, border 1px putih, tombol yang invert saat
  hover, dan grid produk yang menyatu.
