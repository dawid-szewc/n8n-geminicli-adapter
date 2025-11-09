#!/bin/bash

# Skrypt testowy dla Gemini HTTP Wrapper

BASE_URL="http://localhost:3000"

echo "🧪 Testing Gemini HTTP Wrapper"
echo "================================"

# Test 1: Health check
echo -e "\n1️⃣  Testing health endpoint..."
curl -s "$BASE_URL/health" | jq '.'

# Test 2: Simple query
echo -e "\n2️⃣  Testing simple query..."
curl -s -X POST "$BASE_URL/query" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is 2+2? Answer in one word."
  }' | jq '.'

# Test 3: Query with options
echo -e "\n3️⃣  Testing query with options..."
curl -s -X POST "$BASE_URL/query" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Napisz krótką definicję AI",
    "options": {
      "temperature": 0.7,
      "maxTokens": 100
    }
  }' | jq '.'

# Test 4: Batch queries
echo -e "\n4️⃣  Testing batch queries..."
curl -s -X POST "$BASE_URL/batch" \
  -H "Content-Type: application/json" \
  -d '{
    "prompts": [
      "Co to jest Python?",
      "Co to jest JavaScript?"
    ]
  }' | jq '.'

# Test 5: Error handling - missing prompt
echo -e "\n5️⃣  Testing error handling (missing prompt)..."
curl -s -X POST "$BASE_URL/query" \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.'

echo -e "\n✅ Tests completed!"
