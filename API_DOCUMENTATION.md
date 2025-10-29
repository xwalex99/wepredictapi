# WePredict API - Documentación de Endpoints

Esta documentación describe todos los endpoints disponibles de la API WePredict para que los desarrolladores frontend sepan cómo integrarse con ella.

## Información General

- **Base URL**: La URL base depende del entorno donde se despliegue la API
  - Desarrollo local: `http://localhost:3000`
  - Producción: `[URL de producción]`
- **Content-Type**: `application/json`
- **Formato de respuesta**: Todas las respuestas exitosas siguen este formato:

```json
{
  "success": true,
  "message": "Mensaje descriptivo",
  "data": { /* datos de respuesta */ }
}
```

## Endpoints

### 1. Health Check

Endpoint simple para verificar que la API está funcionando.

**Endpoint:** `GET /`

**Headers:** No requeridos

**Respuesta Exitosa (200 OK):**
```json
"Hello World!"
```

**Ejemplo de uso:**
```javascript
fetch('http://localhost:3000/')
  .then(response => response.text())
  .then(data => console.log(data)); // "Hello World!"
```

---

## Endpoints de Autenticación

Todos los endpoints de autenticación están bajo el prefijo `/auth`.

### 2. Registro de Usuario (Local)

Registra un nuevo usuario con email y contraseña.

**Endpoint:** `POST /auth/register`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "email": "user@example.com",
  "full_name": "John Doe",
  "password": "password123"
}
```

**Parámetros:**
- `email` (string, required): Email válido del usuario
- `full_name` (string, required): Nombre completo del usuario
- `password` (string, required): Contraseña con mínimo 6 caracteres

**Respuesta Exitosa (201 Created):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "provider": "local",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errores:**
- `400 Bad Request`: Email ya registrado o datos inválidos
  ```json
  {
    "statusCode": 400,
    "message": "El email ya está registrado",
    "error": "Bad Request"
  }
  ```

**Ejemplo de uso:**
```javascript
fetch('http://localhost:3000/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    full_name: 'John Doe',
    password: 'password123'
  })
})
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Usuario registrado:', data.data);
    }
  })
  .catch(error => console.error('Error:', error));
```

---

### 3. Iniciar Sesión (Local)

Autentica un usuario existente con email y contraseña.

**Endpoint:** `POST /auth/login`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Parámetros:**
- `email` (string, required): Email del usuario
- `password` (string, required): Contraseña del usuario

**Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "provider": "local",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errores:**
- `401 Unauthorized`: Credenciales inválidas
  ```json
  {
    "statusCode": 401,
    "message": "Email o contraseña incorrectos",
    "error": "Unauthorized"
  }
  ```
- `401 Unauthorized`: Usuario registrado con Google (sin contraseña local)
  ```json
  {
    "statusCode": 401,
    "message": "Esta cuenta no tiene contraseña local. Usa Google para iniciar sesión.",
    "error": "Unauthorized"
  }
  ```

**Ejemplo de uso:**
```javascript
fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
})
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Login exitoso:', data.data);
      // Guardar información del usuario en el estado de la app
    }
  })
  .catch(error => console.error('Error:', error));
```

---

### 4. Autenticación con Google OAuth (Recomendado)

Autentica o registra un usuario usando el ID Token de Google. Este es el método recomendado para integración con Google.

**Endpoint:** `POST /auth/google/callback`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij..."
}
```

**Parámetros:**
- `id_token` (string, required): ID Token obtenido de Google OAuth

**Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "message": "Autenticación con Google exitosa",
  "data": {
    "id": 1,
    "email": "user@gmail.com",
    "full_name": "John Doe",
    "google_sub": "12345678901234567890",
    "provider": "google",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Notas:**
- Este endpoint automáticamente crea el usuario si no existe o inicia sesión si ya existe
- El `id_token` debe obtenerse usando la librería oficial de Google Sign-In del frontend

**Errores:**
- `401 Unauthorized`: Token inválido o expirado
  ```json
  {
    "statusCode": 401,
    "message": "Token inválido o expirado",
    "error": "Unauthorized"
  }
  ```

**Ejemplo de uso con Google Sign-In:**
```javascript
// Primero, obtén el token de Google usando la librería de Google Sign-In
// Por ejemplo, con Google Identity Services:
async function handleGoogleSignIn() {
  const token = await google.accounts.oauth2.getAccessToken();
  // O usando el ID token de la respuesta de Google Sign-In
  
  fetch('http://localhost:3000/auth/google/callback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id_token: googleIdToken // Token obtenido de Google
    })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log('Autenticación exitosa:', data.data);
      }
    })
    .catch(error => console.error('Error:', error));
}
```

---

### 5. Registro con Google (Legacy)

⚠️ **Nota:** Este endpoint es legacy. Se recomienda usar `/auth/google/callback` en su lugar.

Registra un nuevo usuario con información de Google directamente.

**Endpoint:** `POST /auth/register/google`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "google_sub": "12345678901234567890",
  "email": "user@gmail.com",
  "full_name": "John Doe"
}
```

**Parámetros:**
- `google_sub` (string, required): ID de usuario de Google (subject)
- `email` (string, required): Email proporcionado por Google
- `full_name` (string, optional): Nombre completo del usuario

**Respuesta Exitosa (201 Created):**
```json
{
  "success": true,
  "message": "Usuario registrado con Google exitosamente",
  "data": {
    "id": 1,
    "email": "user@gmail.com",
    "full_name": "John Doe",
    "google_sub": "12345678901234567890",
    "provider": "google",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errores:**
- `400 Bad Request`: Error al registrar (email ya existe, etc.)
  ```json
  {
    "statusCode": 400,
    "message": "Error al registrar usuario con Google: [mensaje]",
    "error": "Bad Request"
  }
  ```

---

### 6. Login con Google (Legacy)

⚠️ **Nota:** Este endpoint es legacy. Se recomienda usar `/auth/google/callback` en su lugar.

Inicia sesión con un usuario existente usando información de Google.

**Endpoint:** `POST /auth/login/google`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "google_sub": "12345678901234567890",
  "email": "user@gmail.com",
  "full_name": "John Doe"
}
```

**Parámetros:**
- `google_sub` (string, required): ID de usuario de Google (subject)
- `email` (string, required): Email de Google
- `full_name` (string, optional): Nombre completo del usuario

**Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "message": "Login con Google exitoso",
  "data": {
    "id": 1,
    "email": "user@gmail.com",
    "full_name": "John Doe",
    "google_sub": "12345678901234567890",
    "provider": "google",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errores:**
- `401 Unauthorized`: Error al iniciar sesión (usuario no encontrado, etc.)
  ```json
  {
    "statusCode": 401,
    "message": "Error al iniciar sesión con Google: [mensaje]",
    "error": "Unauthorized"
  }
  ```

---

## Estructura de Datos del Usuario

La respuesta de los endpoints de autenticación devuelve un objeto usuario con la siguiente estructura:

```typescript
{
  id: number;                    // ID único del usuario
  email: string;                 // Email del usuario
  full_name: string;             // Nombre completo
  google_sub?: string;           // ID de Google (solo si provider es 'google')
  provider: 'local' | 'google';  // Método de autenticación
  created_at: string;            // Fecha de creación (ISO 8601)
  updated_at: string;            // Fecha de última actualización (ISO 8601)
}
```

**Nota:** El campo `password_hash` nunca se incluye en las respuestas por seguridad.

---

## Manejo de Errores

Todos los errores devuelven un formato consistente:

```json
{
  "statusCode": 400,
  "message": "Mensaje descriptivo del error",
  "error": "Bad Request"
}
```

**Códigos de estado comunes:**
- `200 OK`: Operación exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Datos inválidos o email ya registrado
- `401 Unauthorized`: Credenciales inválidas o token expirado
- `500 Internal Server Error`: Error del servidor

---

## Ejemplos de Integración Completa

### Flujo de Registro y Login Local

```javascript
// 1. Registro
const register = async (email, fullName, password) => {
  const response = await fetch('http://localhost:3000/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, full_name: fullName, password })
  });
  return await response.json();
};

// 2. Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return await response.json();
};

// Uso
try {
  // Registrar
  const registerResult = await register('user@example.com', 'John Doe', 'password123');
  if (registerResult.success) {
    console.log('Usuario registrado:', registerResult.data);
  }
  
  // Login
  const loginResult = await login('user@example.com', 'password123');
  if (loginResult.success) {
    console.log('Login exitoso:', loginResult.data);
    // Guardar usuario en estado local/contexto
  }
} catch (error) {
  console.error('Error:', error);
}
```

### Flujo con Google OAuth (Recomendado)

```javascript
// Usando Google Identity Services
function handleGoogleSignIn(credentialResponse) {
  const idToken = credentialResponse.credential;
  
  fetch('http://localhost:3000/auth/google/callback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_token: idToken })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log('Usuario autenticado:', data.data);
        // El endpoint automáticamente crea o inicia sesión
      }
    })
    .catch(error => console.error('Error:', error));
}
```

---

## Notas Adicionales

1. **Validación**: Todos los endpoints validan automáticamente los datos enviados. Los emails deben ser válidos y las contraseñas deben tener mínimo 6 caracteres.

2. **CORS**: Asegúrate de que el servidor tenga configurado CORS correctamente si tu frontend está en un dominio diferente.

3. **Swagger**: Si la API tiene Swagger habilitado, puedes acceder a la documentación interactiva en `/docs`.

4. **Seguridad**: 
   - Nunca almacenes contraseñas en texto plano
   - Usa HTTPS en producción
   - Valida los tokens de Google en el frontend antes de enviarlos

5. **Recomendación**: Para integración con Google, usa el endpoint `/auth/google/callback` en lugar de los endpoints legacy (`/auth/register/google` y `/auth/login/google`).

---

## Preguntas Frecuentes

**P: ¿Qué endpoint debo usar para Google Sign-In?**
R: Usa `/auth/google/callback` con el `id_token` de Google. Este endpoint automáticamente crea el usuario si no existe o inicia sesión si ya existe.

**P: ¿Cómo manejo los errores de validación?**
R: Los errores de validación se devuelven con código 400 y un mensaje descriptivo. Verifica el campo `message` en la respuesta de error.

**P: ¿El API requiere autenticación para otros endpoints?**
R: Actualmente, solo los endpoints de autenticación están disponibles. Futuras funcionalidades pueden requerir tokens de autenticación.

---

**Última actualización:** 2024-01-01

