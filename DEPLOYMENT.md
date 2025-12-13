# دليل النشر على السيرفر 🚀

## المتطلبات
- Docker و Docker Compose مثبتين على السيرفر
- الوصول SSH للسيرفر

## خطوات النشر

### 1. الاتصال بالسيرفر
```bash
ssh root@217.76.53.136
```

### 2. تثبيت Docker (إذا لم يكن مثبتاً)
```bash
# تحديث النظام
apt update && apt upgrade -y

# تثبيت Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# تثبيت Docker Compose
apt install docker-compose -y

# التحقق من التثبيت
docker --version
docker-compose --version
```

### 3. رفع المشروع للسيرفر
من جهازك المحلي:
```bash
# ضغط المشروع
tar -czf portfolio-frontend.tar.gz .

# رفع للسيرفر
scp portfolio-frontend.tar.gz root@217.76.53.136:/root/

# الاتصال بالسيرفر
ssh root@217.76.53.136

# فك الضغط
cd /root
mkdir -p portfolio-frontend
tar -xzf portfolio-frontend.tar.gz -C portfolio-frontend/
cd portfolio-frontend
```

### 4. بناء وتشغيل المشروع
```bash
# إعطاء صلاحيات التنفيذ لملف النشر
chmod +x deploy.sh

# تشغيل النشر
./deploy.sh
```

### 5. الأوامر المفيدة

#### عرض السجلات (Logs)
```bash
docker-compose logs -f
```

#### إيقاف التطبيق
```bash
docker-compose down
```

#### إعادة تشغيل التطبيق
```bash
docker-compose restart
```

#### التحقق من حالة الـ Containers
```bash
docker-compose ps
```

#### البناء من جديد
```bash
docker-compose build --no-cache
docker-compose up -d
```

### 6. الوصول للتطبيق
بعد النشر، التطبيق سيكون متاحاً على:
```
http://217.76.53.136:3000
```

## نشر سريع (Quick Deploy)
للتحديثات السريعة:
```bash
ssh root@217.76.53.136
cd /root/portfolio-frontend
git pull  # إذا كنت تستخدم Git
./deploy.sh
```

## استكشاف الأخطاء

### المشكلة: Container لا يعمل
```bash
docker-compose logs portfolio-frontend
docker-compose ps
```

### المشكلة: Port مشغول
```bash
# معرفة من يستخدم Port 3000
lsof -i :3000
# أو
netstat -tulpn | grep 3000

# إيقاف العملية
kill -9 <PID>
```

### المشكلة: مساحة القرص ممتلئة
```bash
# تنظيف Docker
docker system prune -a
docker volume prune
```

## الأمان

### إعداد Firewall
```bash
# السماح بـ Port 3000
ufw allow 3000/tcp
ufw enable
ufw status
```

### استخدام Nginx كـ Reverse Proxy (اختياري)
```bash
# تثبيت Nginx
apt install nginx -y

# إنشاء ملف إعدادات
nano /etc/nginx/sites-available/portfolio
```

إضافة:
```nginx
server {
    listen 80;
    server_name 217.76.53.136;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# تفعيل الإعدادات
ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## النسخ الاحتياطي

### نسخ احتياطي يدوي
```bash
cd /root
tar -czf portfolio-backup-$(date +%Y%m%d).tar.gz portfolio-frontend/
```

### نسخ احتياطي تلقائي (Cron Job)
```bash
crontab -e
```
إضافة السطر:
```
0 2 * * * tar -czf /root/backups/portfolio-$(date +\%Y\%m\%d).tar.gz /root/portfolio-frontend/
```
