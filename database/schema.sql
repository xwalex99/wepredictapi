-- Active: 1765132999174@@46.224.25.116@3306@wepredictapp

-- ========================================
-- Crear tabla wpuser con UUID (CHAR(36) para UUID)
-- ========================================
CREATE TABLE IF NOT EXISTS wpuser (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- Procedimiento: register_user
-- Registra un nuevo usuario
-- ========================================
DELIMITER $$

CREATE PROCEDURE register_user(
  IN p_email VARCHAR(255),
  IN p_username VARCHAR(100),
  IN p_password_hash VARCHAR(255)
)
BEGIN
  DECLARE v_user_id CHAR(36);
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
  BEGIN
    SELECT FALSE as success, 'Error al registrar usuario' as message, NULL as user_id;
  END;
  
  INSERT INTO wpuser (email, username, password, created_at, updated_at)
  VALUES (p_email, p_username, p_password_hash, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
  
  SELECT ID INTO v_user_id FROM wpuser WHERE email = p_email LIMIT 1;
  
  SELECT TRUE as success, 'Usuario registrado exitosamente' as message, v_user_id as user_id;
END$$

DELIMITER ;

-- ========================================
-- Procedimiento: login_user
-- Valida credenciales del usuario
-- ========================================
DELIMITER $$

CREATE PROCEDURE login_user(
  IN p_email VARCHAR(255),
  IN p_password_hash VARCHAR(255)
)
BEGIN
  DECLARE v_user_id CHAR(36);
  DECLARE v_username VARCHAR(100);
  DECLARE v_email VARCHAR(255);
  DECLARE v_password VARCHAR(255);
  
  SELECT id, username, email, password
  INTO v_user_id, v_username, v_email, v_password
  FROM wpuser
  WHERE wpuser.email = p_email
  LIMIT 1;
  
  IF v_user_id IS NULL THEN
    SELECT FALSE as success, 'Usuario no encontrado' as message, NULL as user_id, NULL as username, NULL as email;
  ELSEIF v_password != p_password_hash THEN
    SELECT FALSE as success, 'Credenciales inválidas' as message, NULL as user_id, NULL as username, NULL as email;
  ELSE
    SELECT TRUE as success, 'Login exitoso' as message, v_user_id as user_id, v_username as username, v_email as email;
  END IF;
END$$

DELIMITER ;

-- ========================================
-- Procedimiento: get_user_by_id
-- Obtiene datos del usuario por ID
-- ========================================
DELIMITER $$

CREATE PROCEDURE get_user_by_id(
  IN p_user_id CHAR(36)
)
BEGIN
  SELECT id, email, username, created_at
  FROM wpuser
  WHERE wpuser.id = p_user_id;
END$$

DELIMITER ;
