# ⚡ Quick Deploy Guide

## Langkah Cepat Deploy ke Vercel

### 1️⃣ Test Build Lokal
```bash
npm install
npm run build
```
✅ Harus berhasil tanpa error!

### 2️⃣ Push ke GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO-NAME.git
git push -u origin main
```

### 3️⃣ Deploy di Vercel
1. Buka [vercel.com](https://vercel.com)
2. Login dengan GitHub
3. Klik **"Add New Project"**
4. Import repository Anda
5. Vercel auto-detect Vite → Klik **"Deploy"**
6. Tunggu 1-2 menit ⏳
7. Done! 🎉

## ⚠️ Jika Error 126

Di Vercel Dashboard → Settings → Build & Development Settings:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node.js Version**: 18.x

Lalu **Redeploy** (uncheck "Use existing Build Cache")

## 📋 Checklist

- ✅ `package.json` ada `engines` field
- ✅ `public/_redirects` untuk SPA routing
- ✅ `.gitignore` untuk exclude files
- ✅ `.vercelignore` untuk Vercel
- ✅ Build lokal berhasil

## 🔗 Hasil Deploy

URL akan seperti: `https://javanesia-xxx.vercel.app`

---

**Butuh bantuan?** Baca [README-DEPLOY.md](./README-DEPLOY.md) untuk panduan lengkap.
