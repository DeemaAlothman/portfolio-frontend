#!/bin/bash

# سكريبت للتحقق من التضارب قبل النشر
# يفحص البورتات والـ Containers والـ Networks

set -e

# الألوان
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   فحص التضارب قبل النشر   ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

CONFLICTS=0

# 1. فحص البورتات
echo -e "${BLUE}1️⃣  فحص البورتات...${NC}"
echo ""

# قراءة البورت من .env
PORT=3010
if [ -f .env.production ]; then
    source .env.production
fi

PORTS_TO_CHECK=($PORT 3000 3010 3011 4000)

for port in "${PORTS_TO_CHECK[@]}"; do
    if command -v lsof &> /dev/null; then
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
            PID=$(lsof -Pi :$port -sTCP:LISTEN -t)
            PROCESS=$(ps -p $PID -o comm= 2>/dev/null || echo "unknown")

            if [ "$port" == "$PORT" ]; then
                echo -e "${RED}   ❌ بورت $port مشغول!${NC}"
                echo -e "${YELLOW}      PID: $PID | Process: $PROCESS${NC}"
                CONFLICTS=$((CONFLICTS + 1))
            else
                echo -e "${YELLOW}   ⚠️  بورت $port مشغول (لكن مش البورت المطلوب)${NC}"
            fi
        else
            if [ "$port" == "$PORT" ]; then
                echo -e "${GREEN}   ✅ بورت $port متاح${NC}"
            fi
        fi
    fi
done

echo ""

# 2. فحص الـ Containers
echo -e "${BLUE}2️⃣  فحص الـ Docker Containers...${NC}"
echo ""

if command -v docker &> /dev/null; then
    CONTAINER_NAME="portfolio-frontend-next"

    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        STATUS=$(docker ps -a --filter "name=^${CONTAINER_NAME}$" --format '{{.Status}}')
        echo -e "${YELLOW}   ⚠️  Container '$CONTAINER_NAME' موجود${NC}"
        echo -e "${YELLOW}      الحالة: $STATUS${NC}"
        echo -e "${GREEN}   ℹ️  سيتم إيقافه وإعادة إنشائه عند النشر${NC}"
    else
        echo -e "${GREEN}   ✅ لا يوجد container بنفس الاسم${NC}"
    fi

    # عرض جميع الـ containers العاملة
    echo ""
    echo -e "${BLUE}   Containers العاملة حالياً:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | head -10
else
    echo -e "${RED}   ❌ Docker غير مثبت!${NC}"
    CONFLICTS=$((CONFLICTS + 1))
fi

echo ""

# 3. فحص الـ Networks
echo -e "${BLUE}3️⃣  فحص الـ Docker Networks...${NC}"
echo ""

if command -v docker &> /dev/null; then
    NETWORK_NAME="portfolio-frontend-network"

    if docker network ls --format '{{.Name}}' | grep -q "^${NETWORK_NAME}$"; then
        echo -e "${YELLOW}   ⚠️  Network '$NETWORK_NAME' موجودة${NC}"
        echo -e "${GREEN}   ℹ️  سيتم استخدامها أو إعادة إنشائها${NC}"
    else
        echo -e "${GREEN}   ✅ Network جديدة سيتم إنشاؤها${NC}"
    fi
fi

echo ""

# 4. فحص المساحة المتاحة
echo -e "${BLUE}4️⃣  فحص المساحة المتاحة...${NC}"
echo ""

AVAILABLE_SPACE=$(df -h . | awk 'NR==2 {print $4}')
echo -e "${GREEN}   ✅ المساحة المتاحة: $AVAILABLE_SPACE${NC}"

echo ""

# 5. فحص Docker Compose
echo -e "${BLUE}5️⃣  فحص Docker Compose...${NC}"
echo ""

if command -v docker-compose &> /dev/null; then
    VERSION=$(docker-compose --version)
    echo -e "${GREEN}   ✅ $VERSION${NC}"
else
    echo -e "${RED}   ❌ Docker Compose غير مثبت!${NC}"
    CONFLICTS=$((CONFLICTS + 1))
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# النتيجة النهائية
echo ""
if [ $CONFLICTS -eq 0 ]; then
    echo -e "${GREEN}✅ كل شي تمام! يمكنك النشر الآن${NC}"
    echo ""
    echo -e "${BLUE}📋 ملخص الإعدادات:${NC}"
    echo -e "   • البورت: ${GREEN}$PORT${NC}"
    echo -e "   • Container: ${GREEN}$CONTAINER_NAME${NC}"
    echo -e "   • Network: ${GREEN}$NETWORK_NAME${NC}"
    echo -e "   • URL: ${GREEN}http://217.76.53.136:$PORT${NC}"
    echo ""
    echo -e "${YELLOW}للنشر، نفّذ الأمر:${NC}"
    echo -e "${GREEN}   ./deploy.sh${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}⚠️  يوجد $CONFLICTS مشكلة يجب حلها قبل النشر${NC}"
    echo ""
    echo -e "${YELLOW}الحلول المقترحة:${NC}"

    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "   1. إيقاف العملية على بورت $PORT:"
        PID=$(lsof -Pi :$PORT -sTCP:LISTEN -t)
        echo -e "      ${GREEN}kill -9 $PID${NC}"
        echo -e "   2. أو تغيير البورت في .env.production"
    fi

    echo ""
    exit 1
fi
