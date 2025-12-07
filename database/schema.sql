-- ========================================
-- Crear tabla wpuser
-- ========================================
CREATE TABLE IF NOT EXISTS wpuser (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- Procedimiento: sp_register_user
-- Registra un nuevo usuario
-- ========================================
CREATE OR REPLACE FUNCTION sp_register_user(
  p_email VARCHAR,
  p_username VARCHAR,
  p_password_hash VARCHAR
)
RETURNS TABLE (
  success BOOLEAN,
  message VARCHAR,
  user_id INTEGER
) AS $$
DECLARE
  v_user_id INTEGER;
BEGIN
  -- Insertar usuario
  INSERT INTO wpuser (email, username, password, created_at, updated_at)
  VALUES (p_email, p_username, p_password_hash, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  RETURNING id INTO v_user_id;

  RETURN QUERY SELECT true, 'Usuario registrado exitosamente'::VARCHAR, v_user_id;

EXCEPTION WHEN unique_violation THEN
  RETURN QUERY SELECT false, 'El email o username ya existe'::VARCHAR, NULL::INTEGER;
WHEN OTHERS THEN
  RETURN QUERY SELECT false, 'Error al registrar usuario'::VARCHAR, NULL::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- Procedimiento: sp_login_user
-- Valida credenciales del usuario
-- ========================================
CREATE OR REPLACE FUNCTION sp_login_user(
  p_email VARCHAR,
  p_password_hash VARCHAR
)
RETURNS TABLE (
  success BOOLEAN,
  message VARCHAR,
  user_id INTEGER,
  username VARCHAR,
  email VARCHAR
) AS $$
DECLARE
  v_user_id INTEGER;
  v_username VARCHAR;
  v_email VARCHAR;
  v_password VARCHAR;
BEGIN
  -- Buscar usuario por email
  SELECT id, username, email, password
  INTO v_user_id, v_username, v_email, v_password
  FROM wpuser
  WHERE wpuser.email = p_email;

  -- Si no existe
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, 'Usuario no encontrado'::VARCHAR, NULL::INTEGER, NULL::VARCHAR, NULL::VARCHAR;
    RETURN;
  END IF;

  -- Validar contraseña (comparar hashes)
  IF v_password != p_password_hash THEN
    RETURN QUERY SELECT false, 'Credenciales inválidas'::VARCHAR, NULL::INTEGER, NULL::VARCHAR, NULL::VARCHAR;
    RETURN;
  END IF;

  RETURN QUERY SELECT true, 'Login exitoso'::VARCHAR, v_user_id, v_username, v_email;

EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT false, 'Error al realizar login'::VARCHAR, NULL::INTEGER, NULL::VARCHAR, NULL::VARCHAR;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- Procedimiento: sp_get_user_by_id
-- Obtiene datos del usuario por ID
-- ========================================
CREATE OR REPLACE FUNCTION sp_get_user_by_id(
  p_user_id INTEGER
)
RETURNS TABLE (
  id INTEGER,
  email VARCHAR,
  username VARCHAR,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT wpuser.id, wpuser.email, wpuser.username, wpuser.created_at
  FROM wpuser
  WHERE wpuser.id = p_user_id;
END;
$$ LANGUAGE plpgsql;
