# API de ChatGPT - Guía para Frontend

Esta guía explica cómo integrar el endpoint de ChatGPT en tu aplicación frontend.

## 📋 Información General

- **URL Base**: `http://localhost:3000` (o la URL de tu servidor en producción)
- **Endpoint**: `POST /chatgpt/chat`
- **Autenticación**: Requerida (JWT Bearer Token)
- **Content-Type**: `application/json`

## 🔐 Autenticación

El endpoint requiere autenticación mediante JWT. Debes incluir el token en el header `Authorization` de todas las peticiones.

### Cómo obtener el token

1. Primero, realiza un login o registro para obtener el token JWT:
   - `POST /auth/login` o `POST /auth/register`
   - La respuesta incluirá un campo `token`

2. Guarda el token (por ejemplo, en localStorage o en el estado de tu aplicación)

3. Incluye el token en cada petición al endpoint de ChatGPT

## 📤 Formato de la Petición

### Headers Requeridos

```
Authorization: Bearer <tu-token-jwt>
Content-Type: application/json
```

### Body de la Petición

```json
{
  "message": "string (requerido)",
  "model": "string (opcional)",
  "temperature": "number (opcional)",
  "maxTokens": "number (opcional)"
}
```

#### Parámetros

| Campo | Tipo | Requerido | Descripción | Valores por Defecto |
|-------|------|-----------|-------------|---------------------|
| `message` | string | ✅ Sí | El mensaje o prompt que quieres enviar a ChatGPT | - |
| `model` | string | ❌ No | Modelo de OpenAI a usar | `gpt-3.5-turbo` |
| `temperature` | number | ❌ No | Controla la creatividad (0-2). Más alto = más creativo | `0.7` |
| `maxTokens` | number | ❌ No | Número máximo de tokens en la respuesta | Sin límite |

## 📥 Formato de la Respuesta

### Respuesta Exitosa (200 OK)

```json
{
  "response": "La respuesta generada por ChatGPT...",
  "model": "gpt-3.5-turbo",
  "usage": {
    "promptTokens": 10,
    "completionTokens": 50,
    "totalTokens": 60
  }
}
```

### Errores

#### 401 Unauthorized
```json
{
  "message": "Token JWT requerido o inválido",
  "error": "Unauthorized",
  "statusCode": 401
}
```

#### 400 Bad Request
```json
{
  "message": "Error de OpenAI API: <descripción del error>",
  "error": "Bad Request",
  "statusCode": 400
}
```

## 💻 Ejemplos de Código

### JavaScript / TypeScript (Fetch API)

```javascript
async function chatWithGPT(message, token) {
  try {
    const response = await fetch('http://localhost:3000/chatgpt/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: message,
        model: 'gpt-3.5-turbo',
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error en la petición');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Uso
const token = localStorage.getItem('jwt_token');
chatWithGPT('¿Qué es el machine learning?', token)
  .then(result => {
    console.log('Respuesta:', result.response);
    console.log('Tokens usados:', result.usage);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

### Axios

```javascript
import axios from 'axios';

async function chatWithGPT(message, token) {
  try {
    const response = await axios.post(
      'http://localhost:3000/chatgpt/chat',
      {
        message: message,
        model: 'gpt-3.5-turbo',
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      // Error de la API
      console.error('Error:', error.response.data);
      throw new Error(error.response.data.message);
    } else {
      // Error de red
      console.error('Error de red:', error.message);
      throw error;
    }
  }
}

// Uso
const token = localStorage.getItem('jwt_token');
chatWithGPT('Explícame qué es React', token)
  .then(result => {
    console.log('Respuesta:', result.response);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

### React Hook Example

```typescript
import { useState } from 'react';
import axios from 'axios';

interface ChatGptResponse {
  response: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export function useChatGPT() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (message: string): Promise<ChatGptResponse> => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('jwt_token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await axios.post<ChatGptResponse>(
        'http://localhost:3000/chatgpt/chat',
        {
          message,
          model: 'gpt-3.5-turbo',
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Error desconocido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading, error };
}

// Uso en un componente
function ChatComponent() {
  const { sendMessage, loading, error } = useChatGPT();
  const [response, setResponse] = useState<string>('');

  const handleSend = async () => {
    try {
      const result = await sendMessage('¿Qué es TypeScript?');
      setResponse(result.response);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div>
      <button onClick={handleSend} disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar mensaje'}
      </button>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {response && <p>{response}</p>}
    </div>
  );
}
```

### Angular Service Example

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

interface ChatGptRequest {
  message: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface ChatGptResponse {
  response: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ChatGptService {
  private apiUrl = 'http://localhost:3000/chatgpt/chat';

  constructor(private http: HttpClient) {}

  sendMessage(request: ChatGptRequest): Observable<ChatGptResponse> {
    const token = localStorage.getItem('jwt_token');
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<ChatGptResponse>(this.apiUrl, request, { headers });
  }
}

// Uso en un componente
export class ChatComponent {
  response: string = '';
  loading: boolean = false;

  constructor(private chatGptService: ChatGptService) {}

  sendMessage() {
    this.loading = true;
    this.chatGptService.sendMessage({
      message: '¿Qué es Angular?',
      model: 'gpt-3.5-turbo',
      temperature: 0.7
    }).subscribe({
      next: (result) => {
        this.response = result.response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.loading = false;
      }
    });
  }
}
```

## 🔧 Manejo de Errores

### Errores Comunes

1. **401 Unauthorized**
   - El token JWT no está presente o es inválido
   - Solución: Verifica que el token esté incluido en el header y que no haya expirado

2. **400 Bad Request**
   - El mensaje está vacío o hay un error en la petición a OpenAI
   - Solución: Verifica que el campo `message` no esté vacío

3. **Error de Red**
   - No se puede conectar al servidor
   - Solución: Verifica que la URL del servidor sea correcta y que esté disponible

### Ejemplo de Manejo de Errores

```javascript
async function chatWithGPT(message, token) {
  try {
    const response = await fetch('http://localhost:3000/chatgpt/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message })
    });

    if (response.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('jwt_token');
      window.location.href = '/login';
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error en la petición');
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica que el servidor esté disponible.');
    }
    throw error;
  }
}
```

## 📝 Notas Importantes

1. **Tokens**: El token JWT tiene una validez de 24 horas. Si expira, deberás hacer login nuevamente.

2. **Rate Limiting**: Ten en cuenta que OpenAI tiene límites de uso. Si excedes el límite, recibirás un error 400.

3. **CORS**: Asegúrate de que tu frontend esté en la lista de orígenes permitidos en el servidor (configurado en `CORS_ORIGIN`).

4. **Modelos Disponibles**: 
   - `gpt-3.5-turbo` (recomendado, más económico)
   - `gpt-4` (más potente, más costoso)
   - `gpt-4-turbo` (balance entre potencia y costo)

5. **Temperature**: 
   - `0.0-0.3`: Respuestas más deterministas y precisas
   - `0.7-1.0`: Balance entre creatividad y precisión (recomendado)
   - `1.5-2.0`: Respuestas muy creativas y variadas

## 🧪 Pruebas

Puedes probar el endpoint usando:

1. **Swagger UI**: `http://localhost:3000/docs`
2. **Postman**: Importa la colección o crea una petición manual
3. **cURL**:
```bash
curl -X POST http://localhost:3000/chatgpt/chat \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "¿Qué es el machine learning?",
    "model": "gpt-3.5-turbo",
    "temperature": 0.7
  }'
```

## 📚 Recursos Adicionales

- [Documentación de OpenAI API](https://platform.openai.com/docs/api-reference)
- [Swagger UI de la API](http://localhost:3000/docs)
- [Documentación de JWT](https://jwt.io/)

