-- Este archivo se ejecuta automáticamente cuando se crea el contenedor de PostgreSQL
-- Asegura que el schema y permisos estén correctos

-- Crear schema si no existe
CREATE SCHEMA IF NOT EXISTS public;

-- Dar todos los permisos al usuario admin
GRANT ALL ON SCHEMA public TO admin;
ALTER SCHEMA public OWNER TO admin;

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE 'Database initialized successfully!';
END
$$;