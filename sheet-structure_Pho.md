# SHEET STRUCTURE — PhoOS Restaurant
# Tạo Google Sheet với 6 tabs theo đúng thứ tự này
# (Nhà hàng không cần tab Staff riêng — khác với nail salon)

---

## Tab 1: Reservations (Đặt bàn)
Header Row 1:
```
Timestamp | Name | Phone | Email | Party | Date | Time | Location | Notes | Status
```

| Cột | Mô tả |
|-----|-------|
| Timestamp | Tự động từ Apps Script |
| Name | Tên khách |
| Phone | SĐT khách |
| Email | Email khách (tùy chọn) |
| Party | Số người — VD: "3–4 guests" |
| Date | Ngày đặt bàn — VD: 2026-06-01 |
| Time | Giờ — VD: 7:00 PM |
| Location | Chi nhánh — VD: Elk Grove (Main) |
| Notes | Ghi chú đặc biệt của khách |
| Status | Pending / Confirmed / Done / Cancelled |

---

## Tab 2: Menu (Thực đơn)
Header Row 1:
```
ID | Category | Name | Price | Desc | Tags | Img | Featured | Active
```

| Cột | Mô tả |
|-----|-------|
| ID | Số thứ tự |
| Category | Nhóm món — xem bên dưới |
| Name | Tên món |
| Price | Giá — VD: $18.50 |
| Desc | Mô tả ngắn |
| Tags | Nhãn đặc biệt — VD: Popular, Vegan, Gluten Free |
| Img | URL ảnh món ăn (upload Cloudinary) |
| Featured | TRUE/FALSE — món nổi bật hiển thị lớn hơn |
| Active | TRUE/FALSE — ẩn/hiện trên web |

**Các Category chuẩn:**
```
Small Bites & Rolls
Signature Phở
Beyond the Broth
Drinks
Desserts
```

**Data mẫu:**
```
1 | Small Bites & Rolls | Imperial Spring Rolls | $12   | Crispy pork and shrimp rolls...  | Popular       | [URL] | FALSE | TRUE
2 | Small Bites & Rolls | Fresh Summer Rolls    | $10   | Rice paper rolls with shrimp...  |               | [URL] | TRUE  | TRUE
3 | Small Bites & Rolls | Mini Banh Mi          | $14   | Traditional trio of sliders...   |               | [URL] | FALSE | TRUE
4 | Signature Phở       | Classic Beef Phở      | $18.50| Thinly sliced rare ribeye...     | Popular,GF    |       | TRUE  | TRUE
5 | Signature Phở       | Phở Gà (Chicken)      | $17.50| Shredded free-range chicken...   |               |       | FALSE | TRUE
6 | Signature Phở       | Vegetarian Garden Phở | $16.50| Roasted daikon, carrots...       | Vegan         |       | FALSE | TRUE
7 | Signature Phở       | Wagyu Special Reserve | $32.00| A5 Japanese Wagyu slices...      |               |       | FALSE | TRUE
8 | Beyond the Broth    | Sizzling Lemongrass Pork    | $19.50 | Grilled marinated pork... |          |       | FALSE | TRUE
9 | Beyond the Broth    | Honey Glazed Chicken Noodle | $18.50 | Wok-charred chicken...   |          |       | FALSE | TRUE
```

---

## Tab 3: Gallery (Ảnh nhà hàng)
Header Row 1:
```
ID | Image_URL | Caption | Category | Active
```

**Categories gợi ý:**
```
Food       ← ảnh món ăn
Interior   ← ảnh không gian nhà hàng
Team       ← ảnh đội ngũ bếp
Event      ← sự kiện đặc biệt
```

---

## Tab 4: Reviews (Đánh giá khách)
Header Row 1:
```
ID | Name | Review | Stars | Avatar_URL | Active
```

Data mẫu:
```
1 | Jennifer M. | The broth is extraordinary — rich, deep, and clearly made with care. | 5 | | TRUE
2 | Michael T.  | Best pho in Sacramento! We come here every week without fail.        | 5 | | TRUE
3 | Lisa N.     | Authentic flavors that remind me of home. The wagyu bowl is a must.  | 5 | | TRUE
```

---

## Tab 5: About (Về nhà hàng)
Key-Value pairs (cột A = Key, cột B = Value):

```
story          | AN PHỞ was born from a simple belief: the best food comes from patience, love, and family tradition. Our grandmother started simmering her first pot of broth in Saigon — a recipe passed down through generations, never written, always felt.
story2         | When we opened our first location in 2010, we brought that same 24-hour broth, those same hand-selected herbs, and that same warmth across the ocean. Every bowl we serve is a piece of home.
mission        | Organic & Toxin-Free Ingredients
est_year       | 2010
stat_1_number  | 14+
stat_1_label   | Years Open
stat_2_number  | 2
stat_2_label   | Locations
stat_3_number  | 24h
stat_3_label   | Broth Simmered
chef_quote     | It's not just food, it's a hug in a bowl. My grandmother taught me that the secret is in the patience, never rushing the broth.
chef_name      | Chef An
circle_img_1   | (URL ảnh tròn trong bento section Phở — ảnh lá thơm, rau húng — tải lên Cloudinary)
story_img      | (URL ảnh chính Our Story — ảnh nhà hàng hoặc gia đình — tải lên Cloudinary)
```

> 💡 **Cách lấy URL ảnh:** Admin → Gallery → Upload ảnh → copy URL Cloudinary → paste vào đây

---

## Tab 6: Settings (Cài đặt)
Key-Value pairs (cột A = Key, cột B = Value):

### THÔNG TIN NHÀ HÀNG
```
salon_name     | AN PHỞ
address        | 8250 Elk Grove Blvd, Elk Grove, CA 95758
phone          | (916) 555-0123
email          | hello@anpho.com
hours_weekday  | Mon–Sat 11AM–9PM
hours_weekend  | Sun 11AM–8PM
notify_email   | owner@anpho.com
```

### HERO
```
hero_title     | Our Menu
hero_subtitle  | A Taste of Family Heritage
hero_badge     | Authentic Vietnamese Restaurant
hero_image_url | (URL ảnh banner — ảnh nồi phở, bếp, 1920x600px)
```

### ẢNH CÁC SECTION (upload Cloudinary → paste URL)
```
pho_img_url    | (URL ảnh tô phở — hiển thị trong Signature Phở section, card "Bestseller")
beyond_img_url | (URL ảnh món Beyond the Broth — hiển thị bên phải section dark green)
```

### NỘI DUNG CÁC SECTION
```
pho_title   | Signature Phở
pho_sub     | Our broth is simmered for 24 hours with charred ginger, onions, and secret family spices.
beyond_title| Beyond the Broth
beyond_sub  | Discover our selection of stir-fried specialties and dry noodles, each crafted with the same dedication to authenticity and flavor.
```

### CHI NHÁNH (tối đa 3 — để trống nếu chỉ có 1)
```
location_1  | Elk Grove (Main)
location_2  | Sacramento (Downtown)
location_3  | (để trống nếu không có chi nhánh thứ 3)
```

### SEO
```
meta_title       | AN PHỞ - Authentic Vietnamese Restaurant | Elk Grove CA
meta_description | Authentic Vietnamese pho restaurant in Elk Grove, CA. 24-hour bone broth, fresh ingredients. Book a table online!
og_image         | (URL ảnh 1200x630px cho share Facebook/Zalo)
keywords         | pho restaurant elk grove, vietnamese food sacramento, authentic pho
site_url         | https://your-site.vercel.app
```

### GEO (lấy từ Google Maps)
```
geo_lat | 38.4088
geo_lng | -121.3716
```

### SOCIAL
```
google_business_url | https://maps.google.com/...
facebook_url        | https://facebook.com/...
instagram_url       | https://instagram.com/...
yelp_url            | https://yelp.com/biz/...
tiktok_url          | https://tiktok.com/@...
```

### BẢN ĐỒ & TÍCH HỢP
```
contact_map_embed  | <iframe src="https://www.google.com/maps/embed?..."...></iframe>
review_embed_code  | (Google Review widget embed code nếu có)
ga4_id             | G-XXXXXXXXXX
cloudinary_folder  | an-pho-restaurant
```

### TELEGRAM (nhận thông báo đặt bàn mới)
```
telegram_bot_token | (TOKEN từ @BotFather)
telegram_chat_id   | (CHAT_ID của bạn)
```

### FAQ (không giới hạn — thêm bao nhiêu cũng được)
```
faq_1_q | Do you accept reservations?
faq_1_a | Yes! You can book online or call us directly at (916) 555-0123.
faq_2_q | Is your broth gluten-free?
faq_2_a | Our classic beef pho broth is gluten-free. Please inform our staff of any allergies.
faq_3_q | Do you offer vegetarian options?
faq_3_a | Yes! We have Vegetarian Garden Phở made with 100% plant-based broth.
faq_4_q | What are your hours?
faq_4_a | Mon–Sat 11AM–9PM, Sun 11AM–8PM.
faq_5_q | Is parking available?
faq_5_a | Yes, free parking is available in our lot.
faq_6_q | Can I book for large groups?
faq_6_a | Absolutely! For parties of 9+, please call us directly to arrange.
faq_7_q | Do you offer takeout or delivery?
faq_7_a | Yes! Takeout available. Delivery via DoorDash and Uber Eats.
```

---

## SO SÁNH VỚI NAIL SALON

| | Nail Salon (NailOS) | Nhà hàng Phở (PhoOS) |
|--|---------------------|----------------------|
| Tab 1 | Bookings (lịch nail) | Reservations (đặt bàn) |
| Tab 2 | Staff (nhân viên nail) | Menu (thực đơn) |
| Tab 3 | Services (dịch vụ nail) | Gallery |
| Tab 4 | Gallery | Reviews |
| Tab 5 | Testimonials | About |
| Tab 6 | About | Settings |
| Tab 7 | Settings | ❌ Không cần |
| Booking fields | service, staff, date, time | party size, location, date, time |
| Schema | NailSalon | Restaurant |
