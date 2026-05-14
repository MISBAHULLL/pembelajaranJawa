# 🚀 Deploy Javanesia ke Vercel

## Persiapan Sebelum Deploy

### 1. Test Build Lokal
Pastikan aplikasi bisa di-build tanpa error:
```bash
npm install
npm run build
```

Jika berhasil, Anda akan melihat folder `dist` dengan file-file hasil build.

## Cara Deploy ke Vercel

### Metode 1: Via Vercel Dashboard (Recommended)

#### Step 1: Push ke Git Repository
```bash
# Inisialisasi git (jika belum)
git init

# Tambahkan semua file
git add .

# Commit
git commit -m "Initial commit - Javanesia Game Parikan"

# Buat branch main
git branch -M main

# Tambahkan remote repository (GitHub/GitLab/Bitbucket)
git remote add origin <URL_REPOSITORY_ANDA>

# Push ke repository
git push -u origin main
```

#### Step 2: Import ke Vercel
1. Buka [vercel.com](https://vercel.com) dan login/signup
2. Klik **"Add New..."** → **"Project"**
3. Pilih repository Anda
4. Vercel akan auto-detect Vite framework
5. **PENTING**: Pastikan settings berikut:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
   - **Node.js Version**: 18.x atau lebih tinggi
6. Klik **"Deploy"**

### Metode 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy ke production
vercel --prod
```

## Troubleshooting Error 126

Jika Anda mendapat error **"Command exited with 126"**, coba langkah berikut:

### Solusi 1: Override Build Settings di Vercel
1. Buka project di Vercel Dashboard
2. Pergi ke **Settings** → **General**
3. Scroll ke **Build & Development Settings**
4. Override dengan:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Pergi ke **Settings** → **Environment Variables**
6. Tambahkan (jika perlu):
   - `NODE_VERSION` = `18`

### Solusi 2: Cek Node.js Version
Pastikan `package.json` memiliki:
```json
"engines": {
  "node": ">=18.0.0"
}
```
✅ Sudah ditambahkan!

### Solusi 3: Clean Install
Di Vercel Dashboard:
1. Pergi ke **Deployments**
2. Klik **"..."** pada deployment terakhir
3. Pilih **"Redeploy"**
4. Centang **"Use existing Build Cache"** → **UNCHECK** (jangan dicentang)
5. Klik **"Redeploy"**

### Solusi 4: Cek Dependencies
Pastikan semua dependencies ada di `dependencies` (bukan `devDependencies`):
```json
"dependencies": {
  "@tailwindcss/vite": "^4.3.0",
  "@vitejs/plugin-react": "^5.0.4",
  "lucide-react": "^0.468.0",
  "react": "^19.1.1",
  "react-dom": "^19.1.1",
  "tailwindcss": "^4.3.0",
  "vite": "^7.1.7"
}
```
✅ Sudah benar!

## Konfigurasi yang Sudah Disiapkan

✅ `package.json` - Dependencies dan build scripts dengan Node.js engines
✅ `.vercelignore` - File yang diabaikan saat deploy
✅ `public/_redirects` - Handle SPA routing untuk React
✅ `vite.config.js` - Konfigurasi Vite untuk production

## Verifikasi Deployment

Setelah deploy berhasil:
1. Buka URL yang diberikan Vercel (contoh: `https://javanesia-xxx.vercel.app`)
2. Test semua fitur:
   - ✅ Homepage loading
   - ✅ Menu navigasi
   - ✅ Game Parikan (3 tingkat)
   - ✅ Materi Parikan
   - ✅ Video Pembelajaran
   - ✅ Refresh halaman tidak 404

## Update Aplikasi

Setiap push ke branch `main` akan otomatis trigger deployment baru:
```bash
git add .
git commit -m "Update: perbaikan game parikan"
git push
```

## Custom Domain (Opsional)

1. Buka project di Vercel Dashboard
2. Pergi ke **Settings** → **Domains**
3. Klik **"Add"**
4. Masukkan domain Anda
5. Ikuti instruksi DNS configuration

## Environment Variables (Jika Diperlukan)

Jika nanti butuh API keys atau secrets:
1. Buka **Settings** → **Environment Variables**
2. Tambahkan variable dengan format:
   - Name: `VITE_API_KEY`
   - Value: `your-api-key`
3. Pilih environment: Production, Preview, Development
4. Redeploy aplikasi

## Monitoring & Analytics

Vercel menyediakan:
- **Analytics**: Traffic dan performance metrics
- **Logs**: Real-time deployment dan runtime logs
- **Speed Insights**: Core Web Vitals monitoring

Akses di Dashboard → Project → Analytics/Logs

## Bantuan Lebih Lanjut

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

---

**Aplikasi**: Javanesia - Game Parikan Jawa  
**Tech Stack**: React 19 + Vite 7 + Tailwind CSS 4  
**Hosting**: Vercel (Free tier available)

Selamat mencoba! 🎉
