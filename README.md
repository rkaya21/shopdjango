# ShopDjango — Full-Stack E-Ticaret Platformu

Sıfırdan, deploy edilmeden, tamamen öğrenme ve portfolyo amaçlı geliştirdiğim full-stack bir e-ticaret projesidir. Backend'de Django REST Framework, frontend'de React kullandım. Tüm servisler Docker üzerinde çalışıyor.

Amacım; gerçek bir e-ticaret sitesinin arkasındaki mimariyi en ince detayına kadar anlamak ve production-ready kod yazabildiğimi göstermekti.

---

## Ne Yapıyor?

Kısaca: Bir kullanıcı kayıt olur, ürünleri görür, sepete ekler, adresini girer, ödeme yapar, siparişini takip eder. Admin panelden ürün/sipariş/stok yönetimi yapılır.

### Kullanıcı Tarafı
- Kayıt, giriş, çıkış (JWT — HttpOnly Cookie ile güvenli)
- Şifremi unuttum / şifre sıfırlama (token bazlı, e-posta ile)
- Profil görüntüleme ve güncelleme
- Ürün listeleme, arama, kategoriye göre filtreleme
- Ürün detay sayfası
- Ürün değerlendirme (1-5 yıldız + yorum)
- Favoriler / istek listesi
- Sepet yönetimi (ekle, çıkar, adet güncelle)
- Stok kontrolü (sepete eklerken ve sipariş oluştururken)
- Çoklu adres kaydetme (ev, iş, vb.)
- Checkout akışı (adres → ödeme yöntemi seçimi → ödeme)
- 3 ödeme yöntemi: Kredi kartı, Havale/EFT, Kapıda ödeme
- Kupon / indirim kodu uygulama
- Sipariş geçmişi ve durum takibi

### Admin Tarafı
- Django admin paneli
- Ürün, kategori, sipariş, ödeme, kupon, yorum yönetimi
- Yorum onay mekanizması
- Stok takibi

---

## Teknik Yapı

### Backend
- **Django 5** + **Django REST Framework**
- **PostgreSQL** veritabanı
- **JWT Authentication** (HttpOnly Cookie — XSS'e karşı güvenli)
- **Celery + Redis** (asenkron görevler: e-posta bildirimleri)
- Atomic transaction'lar + `select_for_update()` ile race condition önleme
- `F()` expression ile veritabanı seviyesinde stok güncelleme
- Rate limiting (login endpoint: 10 istek/dakika)
- CORS + güvenlik header'ları (HSTS, XSS Protection, vb.)

### Frontend
- **React 19** + **React Router v7**
- **Tailwind CSS v4** ile modern, responsive tasarım
- Context API ile global state yönetimi (Auth + Cart)
- Axios interceptor ile otomatik token yenileme
- Glassmorphism, skeleton loading, staggered animasyonlar
- Mobil uyumlu (responsive) tüm sayfalarda

### Altyapı
- **Docker Compose** ile tek komutla ayağa kalkar (5 servis)
- Backend, Frontend, PostgreSQL, Redis, Celery

---

## Proje Yapısı

```
shopdjango/
├── backend/
│   ├── core/              # Django ayarları, ana URL'ler
│   ├── users/             # Kullanıcı, adres, şifre yönetimi
│   ├── products/          # Ürün, kategori, yorum, favoriler
│   ├── orders/            # Sepet, sipariş, stok kontrolü
│   ├── payments/          # Ödeme sistemi (simülasyon)
│   └── promotions/        # Kupon / indirim sistemi
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios client + tüm API fonksiyonları
│   │   ├── components/    # Navbar, Footer, ProductCard, ProtectedRoute
│   │   ├── context/       # AuthContext, CartContext
│   │   └── pages/         # Tüm sayfa bileşenleri
│   └── index.html
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Kurulum

### Gereksinimler
- [Docker](https://docs.docker.com/get-docker/) ve Docker Compose

### Adımlar

```bash
# 1. Klonla
git clone https://github.com/rkaya21/shopdjango.git
cd shopdjango

# 2. Ortam değişkenlerini ayarla
cp .env.example .env
# .env dosyasını aç ve SECRET_KEY ile POSTGRES_PASSWORD'u değiştir

# 3. Başlat
docker compose up --build -d

# 4. Veritabanını oluştur
docker compose exec backend python manage.py migrate

# 5. Admin kullanıcı oluştur
docker compose exec backend python manage.py createsuperuser
```

### Erişim

| Servis | URL |
|--------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000/api/ |
| Admin Panel | http://localhost:8000/admin/ |

---

## API Endpoint'leri

### Auth
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/auth/register/` | Kayıt ol |
| POST | `/api/auth/login/` | Giriş yap |
| POST | `/api/auth/logout/` | Çıkış yap |
| GET/PUT | `/api/auth/profile/` | Profil |
| GET/POST | `/api/auth/addresses/` | Adres listesi / ekle |
| POST | `/api/auth/password/change/` | Şifre değiştir |
| POST | `/api/auth/password/reset/` | Şifre sıfırlama linki |

### Ürünler
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/products/` | Ürün listesi (arama, filtre, sıralama) |
| GET | `/api/products/categories/` | Kategoriler |
| GET | `/api/products/<slug>/` | Ürün detay |
| GET | `/api/products/<slug>/reviews/` | Yorumlar |
| POST | `/api/products/<slug>/reviews/create/` | Yorum yaz |
| GET | `/api/products/wishlist/` | Favorilerim |
| POST | `/api/products/wishlist/<id>/toggle/` | Favorilere ekle/çıkar |

### Sepet & Sipariş
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/orders/cart/` | Sepeti görüntüle |
| POST | `/api/orders/cart/add/` | Sepete ekle |
| PATCH | `/api/orders/cart/update/<id>/` | Adet güncelle |
| DELETE | `/api/orders/cart/remove/<id>/` | Sepetten çıkar |
| POST | `/api/orders/create/` | Sipariş oluştur |
| GET | `/api/orders/` | Sipariş geçmişi |

### Ödeme & Kupon
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/payments/initiate/` | Ödeme başlat |
| GET | `/api/payments/history/` | Ödeme geçmişi |
| POST | `/api/promotions/apply/` | Kupon uygula |

---

## Notlar

- **Ödeme sistemi simülasyondur.** Gerçek para transferi yapmaz. Kredi kartı bilgileri kaydedilmez ve herhangi bir ödeme sağlayıcısına iletilmez. Production'a çıkılacaksa Stripe veya Iyzico entegrasyonu yapılmalıdır.
- **E-postalar console'a yazılır.** Deploy edilmeyeceği için `EMAIL_BACKEND = console` kullanılmıştır. `docker compose logs backend` ile görülebilir.
- **Stok kontrolü atomic'tir.** Aynı anda iki kişi son ürünü almaya çalışırsa `select_for_update()` ile sadece biri başarılı olur.

---

## Kullanılan Teknolojiler

| Katman | Teknoloji |
|--------|-----------|
| Backend | Python, Django 5, Django REST Framework |
| Frontend | React 19, Tailwind CSS v4, Axios |
| Veritabanı | PostgreSQL |
| Cache / Queue | Redis, Celery |
| Auth | JWT (SimpleJWT), HttpOnly Cookie |
| Container | Docker, Docker Compose |

---

## Lisans

Bu proje MIT lisansı ile lisanslanmıştır.