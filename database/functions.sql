-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- crypt(), gen_salt()
CREATE EXTENSION IF NOT EXISTS citext;   -- email case-insensitive

-- Tipo para proveedor de auth (opcional pero limpio)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'auth_provider') THEN
    CREATE TYPE auth_provider AS ENUM ('local', 'google');
  END IF;
END$$;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  email         CITEXT UNIQUE NOT NULL,
  full_name     TEXT NOT NULL,
  password_hash TEXT,
  google_sub    TEXT UNIQUE,                 -- "sub" del ID token de Google
  provider      auth_provider NOT NULL DEFAULT 'local',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Debe existir al menos un método de autenticación
  CHECK (password_hash IS NOT NULL OR google_sub IS NOT NULL),
  -- Si el proveedor es local, debe haber password
  CHECK (provider <> 'local'  OR password_hash IS NOT NULL),
  -- Si el proveedor es google, debe haber google_sub
  CHECK (provider <> 'google' OR google_sub IS NOT NULL)
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_set_updated_at ON users;
CREATE TRIGGER trg_users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

----------------------------------------------------------------------
-- FUNCIONES DE REGISTRO / LOGIN (LOCAL Y GOOGLE)
----------------------------------------------------------------------

-- Registro local: crea usuario si no existe; si existe sin password, se la añade.
CREATE OR REPLACE FUNCTION register_user(p_email CITEXT, p_full_name TEXT, p_password TEXT)
RETURNS users AS $$
DECLARE
  v_user users;
BEGIN
  INSERT INTO users(email, full_name, password_hash, provider)
  VALUES (p_email, p_full_name, crypt(p_password, gen_salt('bf')), 'local')
  ON CONFLICT (email) DO NOTHING
  RETURNING * INTO v_user;

  IF v_user.id IS NULL THEN
    -- Existe el email: si no tenía password, la añadimos (p.ej. cuenta creada por Google)
    UPDATE users
       SET password_hash = COALESCE(password_hash, crypt(p_password, gen_salt('bf'))),
           full_name     = COALESCE(p_full_name, full_name)
     WHERE email = p_email
       AND password_hash IS NULL
    RETURNING * INTO v_user;

    IF v_user.id IS NULL THEN
      RAISE EXCEPTION 'El email % ya está registrado con contraseña.', p_email
        USING ERRCODE = 'unique_violation';
    END IF;
  END IF;

  RETURN v_user;
END;
$$ LANGUAGE plpgsql;

-- Login local: valida email + password. Devuelve la fila de users o error.
CREATE OR REPLACE FUNCTION verify_user(p_email CITEXT, p_password TEXT)
RETURNS users AS $$
DECLARE
  u users;
BEGIN
  SELECT * INTO u FROM users WHERE email = p_email;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Credenciales inválidas.';
  END IF;

  IF u.password_hash IS NULL THEN
    RAISE EXCEPTION 'Esta cuenta no tiene contraseña local (usa Google).';
  END IF;

  IF u.password_hash = crypt(p_password, u.password_hash) THEN
    RETURN u;
  ELSE
    RAISE EXCEPTION 'Credenciales inválidas.';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Registro con Google:
-- - Si existe un usuario con mismo email y sin google_sub, lo enlaza.
-- - Si no existe, crea uno nuevo con provider = 'google'.
CREATE OR REPLACE FUNCTION register_user_google(p_google_sub TEXT, p_email CITEXT, p_full_name TEXT)
RETURNS users AS $$
DECLARE
  u users;
BEGIN
  -- Caso: ya existe por sub (reintentos idempotentes)
  SELECT * INTO u FROM users WHERE google_sub = p_google_sub;
  IF FOUND THEN
    RETURN u;
  END IF;

  -- Caso: existe por email, enlazar Google si no estaba enlazado
  SELECT * INTO u FROM users WHERE email = p_email;
  IF FOUND THEN
    IF u.google_sub IS NULL THEN
      UPDATE users
         SET google_sub = p_google_sub,
             provider   = 'google',
             full_name  = COALESCE(p_full_name, full_name)
       WHERE id = u.id
      RETURNING * INTO u;
      RETURN u;
    ELSE
      -- Mismo email ya enlazado a otro sub o ya tenía sub
      RETURN u;
    END IF;
  END IF;

  -- Crear usuario nuevo con Google
  INSERT INTO users(email, full_name, google_sub, provider)
  VALUES (p_email, p_full_name, p_google_sub, 'google')
  RETURNING * INTO u;

  RETURN u;
END;
$$ LANGUAGE plpgsql;

-- Login con Google:
-- - Busca por sub; si no existe pero hay email, enlaza.
-- - Si no hay nada, crea usuario (sign-in/up silencioso).
CREATE OR REPLACE FUNCTION login_google(p_google_sub TEXT, p_email CITEXT, p_full_name TEXT DEFAULT NULL)
RETURNS users AS $$
DECLARE
  u users;
BEGIN
  SELECT * INTO u FROM users WHERE google_sub = p_google_sub;
  IF FOUND THEN
    RETURN u;
  END IF;

  SELECT * INTO u FROM users WHERE email = p_email;
  IF FOUND THEN
    IF u.google_sub IS NULL THEN
      UPDATE users
         SET google_sub = p_google_sub,
             provider   = 'google',
             full_name  = COALESCE(p_full_name, full_name)
       WHERE id = u.id
      RETURNING * INTO u;
      RETURN u;
    ELSE
      RETURN u;
    END IF;
  END IF;

  -- Crear cuenta nueva (primera vez con Google)
  INSERT INTO users(email, full_name, google_sub, provider)
  VALUES (p_email, COALESCE(p_full_name, p_email::text), p_google_sub, 'google')
  RETURNING * INTO u;

  RETURN u;
END;
$$ LANGUAGE plpgsql;

