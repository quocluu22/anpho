# SETUP GUIDE — PhoOS Restaurant Website
# Thời gian: ~1 giờ lần đầu · ~30 phút từ lần 2

---

## KHÁC BIỆT SO VỚI NAILOS (NAIL SALON)

| | NailOS | PhoOS |
|--|--------|-------|
| Schema type | NailSalon | Restaurant |
| Booking | Đặt lịch nail | Đặt bàn ăn |
| Services tab | Dịch vụ nail | Menu items (group theo Category) |
| Social mới | - | tiktok_url |
| Hours | 9AM–7PM | 11AM–9PM |
| Staff | Nail technician | Nhân viên phục vụ |

---

## BƯỚC 1: GOOGLE SHEET

1. Tạo spreadsheet mới → đặt tên: `[Tên nhà hàng] - CMS`
2. Tạo **7 tabs** đúng thứ tự:
   ```
   Bookings | Staff | Services | Gallery | Testimonials | About | Settings
   ```
3. Điền header và data theo `sheet-structure_Pho.md`

> ⚠️ Tab **Services** nhà hàng cần thêm cột `Category` và `Icon`
> để group menu theo nhóm (Small Bites / Signature Phở / Beyond the Broth)

---

## BƯỚC 2: CLOUDINARY

Dùng chung account nail salon, chỉ khác folder:
```
cloudinary_folder | ten-nha-hang (VD: an-pho-restaurant)
```
Upload preset `nail_gallery` dùng chung — không cần tạo mới.

---

## BƯỚC 3: APPS SCRIPT

1. Google Sheet → **Extensions → Apps Script**
2. Ctrl+A → Delete → paste toàn bộ `Code_Pho.gs`
3. Đổi 2 dòng đầu:
   ```javascript
   const ALLOWED_EMAIL = "owner@anpho.com";
   const ADMIN_SECRET  = "anpho2026xyz";
   ```
4. **Deploy → New deployment → Web App**
   - Execute as: Me
   - Who has access: Anyone
5. Copy URL `/exec`

**Test:**
- Chọn `testSubmitBooking` → Run → `{"success":true}` ✅
- Chọn `testTelegram` → Run → nhận Telegram ✅

---

## BƯỚC 4: TELEGRAM BOT

Giống hệt NailOS — xem setup-guide.md Bước 4.

---

## BƯỚC 5: GOOGLE CLOUD OAUTH

Tạo OAuth Client ID mới cho nhà hàng.

**4 Authorized redirect URIs bắt buộc:**
```
http://localhost:3000/api/auth/callback/google
https://[ten-nha-hang].vercel.app/api/auth/callback/google
https://[domain-rieng].com/api/auth/callback/google
https://www.[domain-rieng].com/api/auth/callback/google
```

---

## BƯỚC 5B: SEO & SCHEMA

Điền vào Settings Sheet:

| Key | Hướng dẫn |
|-----|-----------|
| `hero_image_url` | Ảnh banner 1920x600px — ảnh nồi phở, bếp, nhà hàng |
| `og_image` | Ảnh 1200x630px — ảnh đẹp nhất của món ăn |
| `meta_title` | VD: `AN PHỞ - Authentic Vietnamese Restaurant | Elk Grove CA` |
| `meta_description` | Tối đa 160 ký tự, có địa danh và từ khóa |
| `geo_lat` / `geo_lng` | Lấy từ Google Maps |
| `contact_map_embed` | Google Maps → Share → Embed a map |
| `faq_1_q` đến `faq_6_q` | Câu hỏi thường gặp về nhà hàng |
| `tiktok_url` | Link TikTok nếu có |

---

## BƯỚC 6: NEXT.JS LOCAL

1. Giải nén `luxe-nail-v2.zip`
2. Đổi tên thư mục: `an-pho` (hoặc tên nhà hàng)
3. **Copy `LandingClient_Pho.js`** vào:
   ```
   src/components/LandingClient.js
   ```
   *(đổi tên thành LandingClient.js)*

4. Tạo `.env.local`:
   ```env
   NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
   ADMIN_SECRET=anpho2026xyz
   GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxxx
   NEXTAUTH_SECRET=random32chars
   NEXTAUTH_URL=http://localhost:3000
   ALLOWED_EMAIL=owner@anpho.com
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=nail_gallery
   ```

5. Chạy:
   ```powershell
   npm install
   npm run dev
   ```

6. Kiểm tra:
   - `localhost:3000` → Landing page nhà hàng ✅
   - Form đặt bàn → submit → Sheet có dòng mới ✅
   - Nhận Telegram ✅
   - `localhost:3000/admin` → redirect login ✅

---

## BƯỚC 7: GITHUB + VERCEL

### Push lên GitHub
```powershell
cd D:\CLAUDE\an-pho
git init
git add --all
git commit -m "first commit - AN PHO restaurant"
git branch -M main
git remote add origin https://github.com/USERNAME/an-pho.git
git push -u origin main
```

### Deploy Vercel
1. **vercel.com** → Add New Project → import repo `an-pho`
2. Thêm 9 environment variables (giống `.env.local`)
3. `NEXTAUTH_URL` điền tạm: `https://an-pho.vercel.app`
4. **Deploy** → chờ 2-3 phút

### Sau khi deploy
1. **Vercel** → sửa `NEXTAUTH_URL` → URL thật → Save → **Redeploy**
2. **Google Cloud** → OAuth Client ID → thêm redirect URI:
   ```
   https://an-pho-xxx.vercel.app/api/auth/callback/google
   ```
3. Test tab ẩn danh → `/admin` → redirect về login ✅
4. Login Google → vào dashboard ✅

### Nếu có domain riêng (VD: anpho.com)
1. Vercel → Settings → Domains → Add `anpho.com`
2. Trỏ DNS theo hướng dẫn Vercel
3. Sửa `NEXTAUTH_URL` → `https://anpho.com` → Redeploy
4. Google Cloud → thêm 2 URI:
   ```
   https://anpho.com/api/auth/callback/google
   https://www.anpho.com/api/auth/callback/google
   ```

---

## CHECKLIST HOÀN CHỈNH

### ☐ Google Sheet
- [ ] 7 tabs đúng thứ tự
- [ ] Tab Services có cột Category và Icon
- [ ] Menu groups: Small Bites & Rolls / Signature Phở / Beyond the Broth
- [ ] Điền đủ Settings: salon_name, address, phone, email, hours
- [ ] `tiktok_url` nếu có
- [ ] `hero_image_url`, `og_image`
- [ ] `geo_lat`, `geo_lng`
- [ ] `contact_map_embed`
- [ ] Ít nhất 5 FAQ
- [ ] `telegram_bot_token` và `telegram_chat_id`

### ☐ Apps Script
- [ ] Paste Code_Pho.gs → đổi ALLOWED_EMAIL + ADMIN_SECRET
- [ ] Deploy → copy URL /exec
- [ ] testSubmitBooking → success ✅
- [ ] testTelegram → nhận tin ✅

### ☐ Local test
- [ ] Landing page hiển thị đúng theme nhà hàng
- [ ] Menu groups hiển thị đúng (Bites / Phở / Beyond)
- [ ] Form đặt bàn → submit → Telegram nhận thông báo
- [ ] Admin login OK

### ☐ Vercel
- [ ] Deploy thành công
- [ ] NEXTAUTH_URL đúng
- [ ] 4 OAuth redirect URIs đầy đủ
- [ ] Tab ẩn danh → /admin → redirect login ✅
- [ ] Rich Results Test → Restaurant schema valid ✅
- [ ] /robots.txt và /sitemap.xml hoạt động ✅

---

## XỬ LÝ LỖI ĐẶC THÙ NHÀ HÀNG

| Lỗi | Nguyên nhân | Fix |
|-----|-------------|-----|
| Menu không group theo category | Thiếu cột `Category` trong tab Services | Thêm cột Category, điền đúng tên group |
| Bites section không hiện ảnh | `Img` URL trong Sheet trống | Upload ảnh Cloudinary → paste URL vào cột Img |
| Schema type sai | Vẫn dùng LandingClient nail salon | Dùng đúng `LandingClient_Pho.js` |
| Form đặt bàn không submit | Apps Script URL sai | Kiểm tra NEXT_PUBLIC_APPS_SCRIPT_URL |
