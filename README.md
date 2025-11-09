# Gemini CLI HTTP Wrapper

Prosty HTTP wrapper dla Gemini CLI umożliwiający integrację z n8n bez konieczności płacenia za API.

## Instalacja

W kontenerze z Gemini CLI:

```bash
cd /path/to/gemini-http-wrapper
npm install
```

## Uruchomienie

```bash
# Standardowe uruchomienie
npm start

# Lub z nodemon (auto-restart przy zmianach)
npm run dev

# Z custom portem
PORT=3001 npm start
```

## API Endpoints

### Health Check
```
GET /health
```

Sprawdza czy serwer działa.

**Response:**
```json
{
  "status": "ok",
  "service": "gemini-cli-wrapper"
}
```

### Single Query
```
POST /query
```

Wykonuje pojedyncze zapytanie do Gemini CLI.

**Request Body:**
```json
{
  "prompt": "Wyjaśnij czym jest rekurencja",
  "options": {
    "temperature": 0.7,
    "maxTokens": 2048,
    "model": "gemini-pro"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    // Odpowiedź z Gemini CLI w formacie JSON
  },
  "metadata": {
    "prompt": "Wyjaśnij czym jest rekurencja",
    "options": {},
    "timestamp": "2025-11-09T12:00:00.000Z"
  }
}
```

### Batch Queries
```
POST /batch
```

Wykonuje wiele zapytań sekwencyjnie.

**Request Body:**
```json
{
  "prompts": [
    "Pierwsze pytanie",
    {
      "prompt": "Drugie pytanie",
      "options": {
        "temperature": 0.9
      }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "total": 2,
  "results": [
    {
      "success": true,
      "prompt": "Pierwsze pytanie",
      "data": {}
    },
    {
      "success": true,
      "prompt": "Drugie pytanie",
      "data": {}
    }
  ],
  "timestamp": "2025-11-09T12:00:00.000Z"
}
```

## Konfiguracja w n8n

### Użycie HTTP Request Node

1. Dodaj node **HTTP Request** do swojego workflow
2. Skonfiguruj:
   - **Method**: POST
   - **URL**: `http://nazwa-kontenera-gemini:3000/query`
   - **Body Content Type**: JSON
   - **Specify Body**: Using Fields Below
   - **Body Parameters**:
     ```json
     {
       "prompt": "={{ $json.yourPromptField }}",
       "options": {
         "temperature": 0.7
       }
     }
     ```

### Przykład workflow n8n

```
[Manual Trigger]
    ↓
[Function/Set Node] (przygotowanie prompta)
    ↓
[HTTP Request] → POST http://gemini:3000/query
    ↓
[Function Node] (przetworzenie odpowiedzi)
```

### Przykładowa konfiguracja HTTP Request:

**URL:** `http://gemini-container:3000/query`

**Headers:**
- Content-Type: `application/json`

**Body (JSON):**
```json
{
  "prompt": "{{ $json.userQuestion }}",
  "options": {
    "temperature": 0.7,
    "maxTokens": 1000
  }
}
```

**Response:**
Odpowiedź będzie dostępna w `$json.data`

## Docker Compose - Przykład sieci

Jeśli używasz Docker Compose, upewnij się że kontenery są w tej samej sieci:

```yaml
version: '3.8'

services:
  gemini-cli:
    image: twoj-gemini-image
    container_name: gemini-container
    networks:
      - n8n-network
    # ... reszta konfiguracji
    command: npm start # uruchomienie HTTP wrappera

  n8n:
    image: n8nio/n8n
    container_name: n8n
    networks:
      - n8n-network
    ports:
      - "5678:5678"

networks:
  n8n-network:
    driver: bridge
```

W n8n używasz URL: `http://gemini-container:3000/query`

## Zmienne środowiskowe

Skopiuj `.env.example` do `.env` i dostosuj:

```bash
PORT=3000
```

## Testowanie

```bash
# Health check
curl http://localhost:3000/health

# Test query
curl -X POST http://localhost:3000/query \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, test!"}'

# Test batch
curl -X POST http://localhost:3000/batch \
  -H "Content-Type: application/json" \
  -d '{"prompts": ["First question", "Second question"]}'
```

## Troubleshooting

### Gemini CLI nie jest znaleziony
Upewnij się że `gemini` jest dostępny w PATH kontenera:
```bash
which gemini
gemini --version
```

### Timeout errors
Zwiększ timeout w `server.js` (domyślnie 60s):
```javascript
timeout: 120000  // 120 sekund
```

### Błędy parsowania JSON
Sprawdź czy Gemini CLI zwraca poprawny JSON:
```bash
gemini -p "test" --output-format json
```
