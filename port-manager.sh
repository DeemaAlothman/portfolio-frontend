#!/bin/bash

# مدير البورتات - Portfolio Frontend
# يساعد في تشغيل التطبيق على بورتات مختلفة

set -e

# الألوان للطباعة
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# دالة لطباعة رسائل ملونة
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# عرض القائمة الرئيسية
show_menu() {
    echo ""
    echo "=================================="
    echo "   مدير البورتات - Portfolio"
    echo "=================================="
    echo "1) تشغيل على بورت 3010 (Production)"
    echo "2) تشغيل على بورت 3011 (Staging)"
    echo "3) تشغيل على بورت 4000 (Development)"
    echo "4) تشغيل على جميع البورتات"
    echo "5) إيقاف جميع الخدمات"
    echo "6) عرض حالة الخدمات"
    echo "7) عرض Logs"
    echo "8) تغيير البورت في .env"
    echo "9) فحص البورتات المشغولة"
    echo "0) خروج"
    echo "=================================="
    echo -n "اختر رقم الخيار: "
}

# دالة لفحص البورتات
check_ports() {
    print_info "فحص البورتات المتاحة..."
    echo ""

    PORTS=(3000 3010 3011 4000)

    for port in "${PORTS[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
            PID=$(lsof -Pi :$port -sTCP:LISTEN -t)
            PROCESS=$(ps -p $PID -o comm=)
            print_warning "بورت $port مشغول - PID: $PID - Process: $PROCESS"
        else
            print_success "بورت $port متاح"
        fi
    done
}

# تشغيل على بورت محدد
run_on_port() {
    local port=$1
    local env=${2:-production}

    print_info "تشغيل التطبيق على بورت $port ($env)..."

    # تحديث ملف .env
    if grep -q "^PORT=" .env.production; then
        sed -i "s/^PORT=.*/PORT=$port/" .env.production
    else
        echo "PORT=$port" >> .env.production
    fi

    # بناء وتشغيل
    docker-compose build
    PORT=$port docker-compose up -d

    print_success "التطبيق يعمل الآن على http://217.76.53.136:$port"
}

# تشغيل جميع البورتات
run_all_ports() {
    print_info "تشغيل على جميع البورتات..."
    docker-compose -f docker-compose.multi-port.yml up -d
    docker-compose -f docker-compose.multi-port.yml --profile staging up -d
    docker-compose -f docker-compose.multi-port.yml --profile dev up -d
    print_success "جميع الخدمات تعمل الآن!"
}

# إيقاف جميع الخدمات
stop_all() {
    print_info "إيقاف جميع الخدمات..."
    docker-compose down
    docker-compose -f docker-compose.multi-port.yml down
    print_success "تم إيقاف جميع الخدمات"
}

# عرض حالة الخدمات
show_status() {
    print_info "حالة الخدمات:"
    echo ""
    docker-compose ps
    docker-compose -f docker-compose.multi-port.yml ps
}

# عرض Logs
show_logs() {
    echo -n "اختر البورت (3010/3011/4000/all): "
    read port_choice

    case $port_choice in
        3010)
            docker logs -f portfolio-frontend-3010
            ;;
        3011)
            docker logs -f portfolio-frontend-3011
            ;;
        4000)
            docker logs -f portfolio-frontend-4000
            ;;
        all)
            docker-compose -f docker-compose.multi-port.yml logs -f
            ;;
        *)
            docker-compose logs -f
            ;;
    esac
}

# تغيير البورت في .env
change_port() {
    echo -n "أدخل البورت الجديد (3000/3010/3011/4000): "
    read new_port

    if grep -q "^PORT=" .env.production; then
        sed -i "s/^PORT=.*/PORT=$new_port/" .env.production
        print_success "تم تحديث البورت إلى $new_port في .env.production"
    else
        echo "PORT=$new_port" >> .env.production
        print_success "تم إضافة PORT=$new_port إلى .env.production"
    fi

    print_info "لتطبيق التغييرات، قم بإعادة تشغيل الخدمة"
}

# الحلقة الرئيسية
while true; do
    show_menu
    read choice

    case $choice in
        1)
            run_on_port 3010 "production"
            ;;
        2)
            run_on_port 3011 "staging"
            ;;
        3)
            run_on_port 4000 "development"
            ;;
        4)
            run_all_ports
            ;;
        5)
            stop_all
            ;;
        6)
            show_status
            ;;
        7)
            show_logs
            ;;
        8)
            change_port
            ;;
        9)
            check_ports
            ;;
        0)
            print_info "مع السلامة!"
            exit 0
            ;;
        *)
            print_error "خيار غير صحيح!"
            ;;
    esac

    echo ""
    echo -n "اضغط Enter للمتابعة..."
    read
done
