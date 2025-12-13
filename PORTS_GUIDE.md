# دليل إدارة البورتات 🔌

## البورتات المتاحة على السيرفر
- **3000** - Backend API
- **3010** - Frontend Production (الافتراضي)
- **3011** - Frontend Staging
- **4000** - Frontend Development

---

## الطريقة الأولى: استخدام مدير البورتات (موصى به)

### 1. تشغيل مدير البورتات التفاعلي
```bash
chmod +x port-manager.sh
./port-manager.sh
```

### 2. الخيارات المتاحة:
- **الخيار 1**: تشغيل على بورت 3010 (Production)
- **الخيار 2**: تشغيل على بورت 3011 (Staging)
- **الخيار 3**: تشغيل على بورت 4000 (Development)
- **الخيار 4**: تشغيل على جميع البورتات
- **الخيار 9**: فحص البورتات المشغولة

---

## الطريقة الثانية: النشر البسيط

### تغيير البورت وتشغيل
```bash
# 1. تعديل البورت في .env.production
nano .env.production
# غيّر السطر: PORT=3010

# 2. تشغيل النشر
./deploy.sh
```

---

## الطريقة الثالثة: أوامر مباشرة

### تشغيل على بورت محدد
```bash
# تشغيل على بورت 3010
PORT=3010 docker-compose up -d

# تشغيل على بورت 3011
PORT=3011 docker-compose up -d

# تشغيل على بورت 4000
PORT=4000 docker-compose up -d
```

### تشغيل نسخ متعددة معاً
```bash
# تشغيل Production و Staging و Development معاً
docker-compose -f docker-compose.multi-port.yml up -d
docker-compose -f docker-compose.multi-port.yml --profile staging up -d
docker-compose -f docker-compose.multi-port.yml --profile dev up -d
```

---

## إدارة الخدمات

### فحص البورتات المشغولة
```bash
# Linux
lsof -i :3010
netstat -tulpn | grep 3010

# أو استخدم مدير البورتات
./port-manager.sh  # ثم اختر 9
```

### عرض الخدمات العاملة
```bash
docker-compose ps
docker ps
```

### عرض Logs لخدمة محددة
```bash
# بورت 3010
docker logs -f portfolio-frontend

# بورت 3011
docker logs -f portfolio-frontend-3011

# بورت 4000
docker logs -f portfolio-frontend-4000
```

### إيقاف خدمة محددة
```bash
# إيقاف الخدمة الرئيسية
docker-compose down

# إيقاف جميع النسخ
docker-compose -f docker-compose.multi-port.yml down
```

### إعادة تشغيل
```bash
docker-compose restart
```

---

## سيناريوهات الاستخدام

### السيناريو 1: بيئة Production فقط
```bash
# تعديل .env.production
PORT=3010

# تشغيل
./deploy.sh
```
**النتيجة**: التطبيق على http://217.76.53.136:3010

---

### السيناريو 2: Production + Staging
```bash
# تشغيل Production
PORT=3010 docker-compose up -d

# تشغيل Staging
docker-compose -f docker-compose.multi-port.yml --profile staging up -d
```
**النتيجة**:
- Production: http://217.76.53.136:3010
- Staging: http://217.76.53.136:3011

---

### السيناريو 3: جميع البيئات
```bash
./port-manager.sh
# اختر الخيار 4
```
**النتيجة**:
- Production: http://217.76.53.136:3010
- Staging: http://217.76.53.136:3011
- Development: http://217.76.53.136:4000

---

## استكشاف الأخطاء

### المشكلة: البورت مشغول
```bash
# معرفة من يستخدم البورت
lsof -i :3010

# إيقاف العملية
kill -9 <PID>

# أو استخدم بورت آخر
PORT=3011 docker-compose up -d
```

### المشكلة: Container لا يعمل
```bash
# فحص الحالة
docker ps -a

# عرض Logs
docker logs portfolio-frontend

# إعادة البناء
docker-compose build --no-cache
docker-compose up -d
```

### المشكلة: تغيير البورت لا يعمل
```bash
# التأكد من إيقاف الخدمة القديمة
docker-compose down

# حذف الـ containers القديمة
docker rm -f portfolio-frontend

# تشغيل بالبورت الجديد
PORT=3011 docker-compose up -d
```

---

## نصائح مهمة

1. **البورت الافتراضي**: 3010 (مضبوط في .env.production)
2. **Backend API**: يعمل على بورت 3000
3. **تأكد من تحديث NEXT_PUBLIC_API_URL** إذا غيرت بورت الـ API
4. **للتطوير المحلي**: استخدم بورت 4000
5. **للاختبار (Staging)**: استخدم بورت 3011
6. **للإنتاج (Production)**: استخدم بورت 3010

---

## الأوامر السريعة

```bash
# تغيير سريع للبورت
echo "PORT=3011" > .env.production && ./deploy.sh

# فحص جميع البورتات
for port in 3000 3010 3011 4000; do echo "Port $port:"; lsof -i :$port; done

# إيقاف كل شيء
docker stop $(docker ps -q) && docker-compose down

# عرض URLs
echo "Production: http://217.76.53.136:3010"
echo "Staging: http://217.76.53.136:3011"
echo "Development: http://217.76.53.136:4000"
echo "API: http://217.76.53.136:3000"
```

---

## إعداد Nginx للبورتات المتعددة (اختياري)

```nginx
# Production
server {
    listen 80;
    server_name portfolio.yourdomain.com;

    location / {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}

# Staging
server {
    listen 80;
    server_name staging.portfolio.yourdomain.com;

    location / {
        proxy_pass http://localhost:3011;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```
