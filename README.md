# Rent-a-Home — Backend

Uy ijarasi platformasi uchun REST API. **Sof JavaScript** (TypeScript emas) +
Express + TypeORM (EntitySchema) + PostgreSQL + Joi validatsiya + Multer (fayl yuklash).

## Ishga tushirish

1. **PostgreSQL o'rnatilgan bo'lishi kerak.** Ma'lumotlar bazasini yarating:
   ```sql
   CREATE DATABASE rent_a_home;
   ```

2. **`.env` faylini yarating** (`.env.example`dan nusxa oling):
   ```bash
   cp .env.example .env
   ```

3. **Paketlarni o'rnating:**
   ```bash
   npm install
   ```

4. **Serverni ishga tushiring (development rejimida):**
   ```bash
   npm run dev
   ```
   Server `http://localhost:5000` da ishga tushadi va TypeORM `synchronize: true`
   tufayli jadvallarni (`users`, `listings`) avtomatik yaratadi.

## Loyiha tuzilishi

```
src/
├── config/
│   └── data-source.js       TypeORM ulanish sozlamalari
├── entities/
│   ├── User.js               EntitySchema (sof JS, decorator'siz)
│   └── Listing.js            EntitySchema
├── validation/
│   └── schemas.js            Joi sxemalari (signup, login, listing va h.k.)
├── middleware/
│   ├── auth.middleware.js    JWT tekshirish (requireAuth, optionalAuth)
│   └── validate.middleware.js  Joi bilan so'rovni tekshiruvchi umumiy middleware
├── controllers/
│   ├── auth.controller.js
│   └── listing.controller.js
├── routes/
│   ├── auth.routes.js
│   ├── listing.routes.js
│   └── upload.routes.js      Multer orqali rasm yuklash
└── server.js                 Asosiy kirish nuqtasi
```

## Validatsiya (Joi)

Har bir POST/PUT so'rovi `validate(schema)` middleware orqali o'tadi.
Xato bo'lsa, `400` status va tushunarli xabarlar qaytariladi:

```json
{
  "message": "Ma'lumotlar noto'g'ri",
  "errors": ["Email manzili noto'g'ri formatda", "Parol kamida 6 ta belgidan iborat bo'lishi kerak"]
}
```

## API endpoint'lari

### Auth (`/api/auth`)
| Method | Endpoint | Tavsif |
|---|---|---|
| POST | `/api/auth/signup` | Ro'yxatdan o'tish |
| POST | `/api/auth/login` | Tizimga kirish |
| GET | `/api/auth/me` | O'z profilini olish (token kerak) |
| PUT | `/api/auth/me` | Profilni tahrirlash — ism, telefon, ijtimoiy tarmoqlar (token kerak) |

### Listings (`/api/listings`)
| Method | Endpoint | Tavsif |
|---|---|---|
| GET | `/api/listings` | Barcha e'lonlar — filter/qidiruv bilan |
| GET | `/api/listings/mine` | O'zining e'lonlari (token kerak) |
| GET | `/api/listings/:id` | Bitta e'lon tafsiloti |
| POST | `/api/listings` | Yangi e'lon qo'shish (token kerak) |
| PUT | `/api/listings/:id` | E'lonni tahrirlash (faqat egasi) |
| DELETE | `/api/listings/:id` | E'lonni o'chirish (faqat egasi) |

**Filter/qidiruv query parametrlari** (`GET /api/listings?...`):
- `address` — matnli qidiruv, masalan `?address=3 kichik daha`
- `renovationType` — `oddiy` yoki `yevro`
- `hasGas`, `hasWater`, `hasElectricity` — `true`
- `roomCount` — honalar soni
- `minPrice`, `maxPrice` — narx oralig'i
- `page`, `limit` — sahifalash

### Upload (`/api/upload`)
| Method | Endpoint | Tavsif |
|---|---|---|
| POST | `/api/upload` | Rasm(lar) yuklash (Multer), `images` nomli form-data field, token kerak, max 10 ta rasm, har biri 5MB gacha |

## Namuna so'rovlar

**Ro'yxatdan o'tish:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Aziz Aripov","email":"aziz@example.com","password":"parol123","phone":"+998901234567"}'
```

**Rasm yuklash:**
```bash
curl -X POST http://localhost:5000/api/upload \
  -H "Authorization: Bearer <TOKEN>" \
  -F "images=@/path/uy1.jpg" \
  -F "images=@/path/uy2.jpg"
```

**Yangi e'lon qo'shish** (yuklangan rasm URL'lari bilan):
```bash
curl -X POST http://localhost:5000/api/listings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "images": ["/uploads/167212-uy1.jpg"],
    "address": "Toshkent, Chilonzor, 3 kichik daha",
    "renovationType": "yevro",
    "hasGas": true,
    "hasWater": true,
    "hasElectricity": true,
    "roomCount": 3,
    "price": 4500000,
    "description": "Yorug' va shinam uy, metro yaqin"
  }'
```

**Qidiruv/filter:**
```bash
curl "http://localhost:5000/api/listings?address=3 kichik daha&renovationType=yevro&hasGas=true"
```
