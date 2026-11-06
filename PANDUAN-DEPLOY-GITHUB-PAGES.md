# 🚀 Panduan Deploy Frontend RASH Mitra ke GitHub Pages

Panduan ini disusun langkah demi langkah untuk membantu Anda meng-online-kan antarmuka web (Landing Page & Simulator) RASH Mitra ke **GitHub Pages** (gratis selamanya, bersertifikat HTTPS resmi, dan berkecepatan tinggi via CDN global).

---

## 📌 Aturan Penting Sebelum Memulai

1. **Jalur Folder Kerja:** Folder yang di-*push* ke GitHub adalah folder ini (tempat berkas `index.html`, `css/`, dan `js/` berada di tingkat teratas / *root*).
2. **Berkas Backend (`backend/`):** Berkas `Kode.gs` dan `appsscript.json` adalah untuk editor **Google Apps Script**, **bukan** untuk GitHub Pages. Jangan satukan berkas `.gs` ke dalam repositori publik GitHub Pages.
3. **Isi `GAS_URL`:** Buka berkas `js/config.js`, dan pastikan Anda memperbarui variabel `GAS_URL` dengan URL `/exec` yang Anda peroleh setelah men-deploy backend Google Apps Script.

---

## 🛠️ Langkah Demi Langkah Lewat Terminal (macOS / Windows / Linux)

### Langkah 1: Buka Terminal di Folder Proyek Ini
Buka aplikasi **Terminal** (di Mac) atau **PowerShell** (di Windows), lalu pastikan Anda berada di direktori proyek ini:

```bash
cd "/Users/macbook/Desktop/Project WebApp/2.Web app/4.app RASH Mitra"
```

Verifikasi bahwa berkas `index.html` berada langsung di folder ini dengan mengetik:
```bash
ls -la
```
*(Di Windows PowerShell: ketik `dir`)*. Anda harus melihat `index.html`, folder `css/`, dan folder `js/`.

---

### Langkah 2: Buat Repositori Baru di GitHub
1. Buka peramban Anda dan kunjungi: [https://github.com/new](https://github.com/new).
2. Beri nama repositori, contoh: `rash-mitra-web` (atau nama pilihan Anda).
3. Pilih opsi **Public** (*Wajib untuk GitHub Pages gratis*).
4. **JANGAN** centang *"Add a README file"*, `.gitignore`, atau lisensi. Biarkan kosong agar tidak terjadi konflik riwayat *commit*.
5. Klik **Create repository**. Biarkan halaman instruksi yang muncul tetap terbuka.

---

### Langkah 3: Inisialisasi Git & Kirim (*Push*) ke GitHub

Jalankan perintah berikut satu per satu di terminal Anda:

**1. Inisialisasi repositori Git lokal:**
```bash
git init
```

**2. Tambahkan berkas frontend (kecuali folder backend):**
```bash
git add index.html css/ js/ README.md PANDUAN-DEPLOY-GITHUB-PAGES.md
```
*(Atau buat berkas `.gitignore` yang memuat baris `backend/`, lalu jalankan `git add .`)*

**3. Buat catatan commit pertama:**
```bash
git commit -m "Inisialisasi Frontend RASH Mitra"
```

**4. Ubah nama cabang utama menjadi `main`:**
```bash
git branch -M main
```

**5. Sambungkan ke repositori GitHub Anda:**
*(Ganti `USERNAME` dan `NAMA-REPO` sesuai akun GitHub Anda)*
```bash
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
```

**6. Unggah (*Push*) ke GitHub:**
```bash
git push -u origin main
```
> **Catatan Autentikasi:** Saat terminal meminta *Password*, masukkan **Personal Access Token (classic)** akun GitHub Anda dengan izin centang `repo` (bukan kata sandi akun biasa). Karakter token memang tidak muncul di layar terminal demi keamanan; cukup paste lalu tekan Enter.

---

### Langkah 4: Aktifkan Fitur GitHub Pages
1. Di halaman repositori GitHub Anda di peramban, klik menu **Settings** (tab paling kanan).
2. Pada panel menu sebelah kiri, klik menu **Pages**.
3. Di bagian **Build and deployment**:
   - **Source:** Pilih *Deploy from a branch*.
   - **Branch:** Pilih `main` dan folder `/ (root)`.
4. Pastikan centang **Enforce HTTPS** sudah aktif.
5. Klik **Save**.

Tunggu sekitar 1–2 menit, lalu segarkan (*refresh*) halaman pengaturan tersebut. Sebuah kotak hijau akan muncul dengan alamat situs Anda:
> **"Your site is live at https://USERNAME.github.io/NAMA-REPO/"**

---

### Langkah 5: Cara Memperbarui Situs (*Redeploy*)
Setiap kali Anda mengubah tampilan HTML, CSS, atau konfigurasi URL di `js/config.js`, Anda cukup menjalankan 3 perintah cepat ini:

```bash
git add .
git commit -m "Update konfigurasi backend dan tampilan"
git push
```
GitHub Pages akan secara otomatis memperbarui situs web Anda dalam hitungan detik!
