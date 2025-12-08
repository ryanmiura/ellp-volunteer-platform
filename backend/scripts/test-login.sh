#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     ELLP Volunteer Platform - Login Test            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}\n"

API_URL="${1:-http://localhost:8080}"
echo -e "${YELLOW}🔗 Testing against: $API_URL${NC}\n"

# Function to test login
test_login() {
    local email=$1
    local password=$2
    local user_type=$3

    echo -e "${BLUE}Testing login for: $user_type${NC}"
    echo "  Email: $email"
    echo "  Password: $password"

    response=$(curl -s -X POST "$API_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\"}")

    if echo "$response" | grep -q '"token"'; then
        token=$(echo "$response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        user_name=$(echo "$response" | grep -o '"name":"[^"]*' | cut -d'"' -f4)
        role=$(echo "$response" | grep -o '"role":"[^"]*' | cut -d'"' -f4)

        echo -e "  ${GREEN}✅ Login successful!${NC}"
        echo "  User: $user_name"
        echo "  Role: $role"
        echo "  Token (first 20 chars): ${token:0:20}..."
        echo -e "  ${GREEN}Token: $token${NC}\n"
        
        return 0
    else
        error=$(echo "$response" | grep -o '"error":"[^"]*' | cut -d'"' -f4)
        echo -e "  ${RED}❌ Login failed!${NC}"
        echo "  Error: $error"
        echo "  Response: $response\n"
        return 1
    fi
}

# Function to test protected endpoint
test_protected_endpoint() {
    local token=$1
    local user_type=$2

    echo -e "${BLUE}Testing protected endpoint for: $user_type${NC}"

    response=$(curl -s -X GET "$API_URL/api/auth/me" \
        -H "Authorization: Bearer $token")

    if echo "$response" | grep -q '"email"'; then
        email=$(echo "$response" | grep -o '"email":"[^"]*' | cut -d'"' -f4)
        name=$(echo "$response" | grep -o '"name":"[^"]*' | cut -d'"' -f4)

        echo -e "  ${GREEN}✅ Protected endpoint access successful!${NC}"
        echo "  Name: $name"
        echo "  Email: $email\n"
        
        return 0
    else
        echo -e "  ${RED}❌ Protected endpoint access failed!${NC}"
        echo "  Response: $response\n"
        return 1
    fi
}

# Test Admin Login
echo -e "${YELLOW}═══════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Test 1: Admin Login${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════${NC}\n"

if test_login "admin@ellp.com" "admin123456" "Admin"; then
    admin_token=$(curl -s -X POST "$API_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@ellp.com","password":"admin123456"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    test_protected_endpoint "$admin_token" "Admin"
fi

# Test Regular User Login
echo -e "${YELLOW}═══════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Test 2: Regular User Login${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════${NC}\n"

if test_login "user@ellp.com" "user123456" "Regular User"; then
    user_token=$(curl -s -X POST "$API_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"user@ellp.com","password":"user123456"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    test_protected_endpoint "$user_token" "Regular User"
fi

# Test Invalid Login
echo -e "${YELLOW}═══════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Test 3: Invalid Login (should fail)${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════${NC}\n"

echo -e "${BLUE}Testing invalid login${NC}"
echo "  Email: invalid@email.com"
echo "  Password: wrongpassword"

response=$(curl -s -X POST "$API_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"invalid@email.com","password":"wrongpassword"}')

if echo "$response" | grep -q '"error"'; then
    error=$(echo "$response" | grep -o '"error":"[^"]*' | cut -d'"' -f4)
    echo -e "  ${GREEN}✅ Correctly rejected invalid credentials${NC}"
    echo "  Error: $error\n"
else
    echo -e "  ${RED}❌ Should have rejected invalid credentials!${NC}\n"
fi

# Summary
echo -e "${YELLOW}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 All login tests completed!${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════${NC}\n"

echo -e "${BLUE}📝 Test Users Created:${NC}"
echo "  1. Admin: admin@ellp.com / admin123456"
echo "  2. User: user@ellp.com / user123456"
echo "  3. Coordinator: coordinator@ellp.com / coord123456"
echo ""
echo -e "${BLUE}📚 Sample Data:${NC}"
echo "  - 9 Volunteers"
echo "  - 5 Workshops"
echo "  - 3 Users"
echo ""
