# n8n Workflows dla Gemini CLI

Przykładowe workflow do zaimportowania w n8n.

## 📦 Dostępne workflows

### 1. **gemini-simple-chat.json**
Prosty workflow do testowania Gemini CLI.

**Struktura:**
```
[Manual Trigger] → [Prepare Prompt] → [Call Gemini CLI] → [Format Response]
```

**Użycie:**
- Kliknij "Test workflow"
- Zmień prompt w node "Prepare Prompt"
- Zobacz odpowiedź w "Format Response"

---

### 2. **gemini-webhook-chatbot.json**
Chatbot z webhookiem - gotowy do integracji z aplikacjami.

**Struktura:**
```
[Webhook] → [Check Question] → [Call Gemini] → [Respond Success/Error]
```

**Użycie:**
```bash
# Test webhook
curl -X POST http://localhost:5678/webhook/gemini-chat \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Co to jest AI?",
    "temperature": 0.7,
    "maxTokens": 500
  }'
```

**Response:**
```json
{
  "success": true,
  "question": "Co to jest AI?",
  "answer": { ... },
  "timestamp": "2025-11-09T12:00:00.000Z"
}
```

---

### 3. **gemini-batch-processing.json**
Przetwarzanie wielu pytań jednocześnie.

**Struktura:**
```
[Manual Trigger] → [Prepare Questions] → [Call Gemini Batch] → [Split Results] → [Format Each]
```

**Użycie:**
- Dodaj wiele pytań w node "Prepare Questions"
- Workflow przetworzy wszystkie naraz przez `/batch` endpoint
- Każda odpowiedź zostanie rozdzielona i sformatowana

---

## 🚀 Jak zaimportować workflow

### W n8n UI:

1. Otwórz n8n w przeglądarce
2. Kliknij menu (3 kreski) w prawym górnym rogu
3. Wybierz **"Import from File"** lub **"Import from URL"**
4. Wybierz jeden z plików JSON
5. Kliknij **"Import"**

### Ważne: Zmień URL

Po zaimportowaniu, w każdym workflow zmień URL w node "HTTP Request":

**Obecny URL:**
```
http://10.10.20.100:3000/query
```

**Zmień na:**
- `http://ai-container:3000/query` - jeśli kontenery są w tej samej sieci Docker
- `http://localhost:3000/query` - jeśli n8n i wrapper są na tym samym hoście
- `http://[YOUR_IP]:3000/query` - dla innego IP

---

## 🎨 Customizacja

### Zmiana temperatury (kreatywność):
W node "Call Gemini" znajdź:
```json
{
  "options": {
    "temperature": 0.7  // ← zmień (0.0 = precyzyjny, 1.0 = kreatywny)
  }
}
```

### Limit tokenów:
```json
{
  "options": {
    "maxTokens": 1000  // ← zmień limit
  }
}
```

### Model Gemini:
```json
{
  "options": {
    "model": "gemini-pro"  // ← zmień model
  }
}
```

---

## 💡 Przykłady użycia

### Integracja z formularzem web:
1. Użyj **gemini-webhook-chatbot.json**
2. W formularzu wyślij POST na webhook URL
3. Odbierz odpowiedź w czasie rzeczywistym

### Automatyczne podsumowania:
1. Dodaj **Schedule Trigger** przed batch workflow
2. Pobierz dane z API/bazy
3. Wyślij do Gemini do analizy
4. Zapisz wyniki

### Asystent email:
1. Trigger: Email Trigger (IMAP)
2. Wyślij treść email do Gemini
3. Generuj odpowiedź
4. Wyślij przez SMTP

---

## 🐛 Troubleshooting

### Error: "Connection refused"
- Sprawdź czy Gemini wrapper działa: `curl http://10.10.20.100:3000/health`
- Zmień URL na prawidłowy adres IP/hostname

### Error: "Prompt is required"
- Upewnij się że pole z promptem jest poprawnie zmapowane
- Sprawdź składnię: `{{ $json.field_name }}`

### Timeout
- Zwiększ timeout w node HTTP Request (Options → Timeout)
- Domyślnie: 60 sekund

### Webhook nie działa
- Sprawdź czy workflow jest **aktywny** (przełącznik w prawym górnym rogu)
- Test webhook URL: `http://localhost:5678/webhook-test/gemini-chat`

---

## 📚 Więcej przykładów

Potrzebujesz więcej przykładów? Możesz łączyć te workflow z:
- **Google Sheets** - analiza danych
- **Discord/Slack** - bot
- **Database** - zapisywanie historii
- **Cron** - automatyczne raporty

