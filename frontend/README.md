# Ijaraly — Frontend

React + Tailwind CSS (v4) + React Router. "Registon" dizayn yo'nalishida.

## Ishga tushirish

1. **`.env` faylini yarating:**
   ```bash
   cp .env.example .env
   ```
   (Backend boshqa manzilda ishlasa, `VITE_API_URL`ni o'zgartiring.)

2. **Paketlarni o'rnating:**
   ```bash
   npm install
   ```

3. **Dev serverni ishga tushiring:**
   ```bash
   npm run dev
   ```
   `http://localhost:5173` da ochiladi.

## Loyiha tuzilishi

```
src/
├── api/
│   └── client.js          Axios instance, token'ni avtomatik qo'shadi
├── context/
│   └── AuthContext.jsx    Login holatini butun ilova bo'yicha saqlaydi
├── components/
│   ├── Header.jsx         Yuqori navigatsiya (logo, login/signup yoki profil)
│   └── Layout.jsx         Umumiy sahifa qatlami (Header + sahifa tarkibi)
├── pages/
│   ├── Home.jsx            Bosh sahifa (hozircha skelet)
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── ListingDetail.jsx
│   ├── NewListing.jsx
│   ├── Dashboard.jsx
│   └── Profile.jsx
├── App.jsx                 Routing
└── index.css                Tailwind + "Registon" dizayn tokenlari
```

## Dizayn tokenlari ("Registon")

`src/index.css` da `@theme` orqali belgilangan, Tailwind klasslari sifatida ishlatiladi:

| Token | Qiymat | Tailwind klassi |
|---|---|---|
| `--color-ink-900` | #153F3F | `bg-ink-900`, `text-ink-900` |
| `--color-ink-700` | #1C4A4A | `bg-ink-700` |
| `--color-gold-500` | #E8A33D | `bg-gold-500`, `text-gold-500` |
| `--color-paper-100` | #FAF6EE | `bg-paper-100` |
| `--font-display` | Alegreya (serif) | `font-display` |
| `--font-sans` | Inter | standart |

## Route'lar

| Yo'l | Sahifa |
|---|---|
| `/` | Bosh sahifa |
| `/login` | Kirish |
| `/signup` | Ro'yxatdan o'tish |
| `/listings/:id` | E'lon tafsiloti |
| `/listings/new` | Yangi e'lon qo'yish |
| `/dashboard` | Mening e'lonlarim |
| `/profile` | Profil |

Hozircha barcha sahifalar skelet holatida — keyingi qadamlarda birma-bir to'ldiriladi.
