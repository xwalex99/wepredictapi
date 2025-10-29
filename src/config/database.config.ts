import { registerAs } from '@nestjs/config';

/**
 * Parses a PostgreSQL connection URL into its components
 */
function parsePostgresUrl(url: string): {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl: boolean | { rejectUnauthorized: boolean };
} | null {
  try {
    const parsed = new URL(url);
    const sslMode = parsed.searchParams.get('sslmode') || parsed.searchParams.get('ssl');
    
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port || '5432', 10) || 5432,
      username: parsed.username,
      password: parsed.password,
      database: parsed.pathname.slice(1) || 'postgres', // Remove leading '/'
      ssl: sslMode === 'require' || sslMode === 'true' 
        ? { rejectUnauthorized: false } 
        : false,
    };
  } catch (error) {
    console.warn('⚠️  Failed to parse POSTGRES_URL:', error.message);
    return null;
  }
}

export default registerAs('database', () => {
  // Priority 1: Parse POSTGRES_URL if available
  const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  const parsedUrl = postgresUrl ? parsePostgresUrl(postgresUrl) : null;

  // Debug logging for development
  if (process.env.NODE_ENV !== 'production') {
    if (postgresUrl) {
      console.log('🔗 Found POSTGRES_URL, parsing connection string...');
      if (parsedUrl) {
        console.log(`✅ Parsed host: ${parsedUrl.host}`);
      } else {
        console.warn('⚠️  Failed to parse POSTGRES_URL, falling back to individual env vars');
      }
    } else {
      console.log('ℹ️  No POSTGRES_URL found, using individual environment variables');
    }
  }

  // Priority 2: Individual environment variables (with multiple naming conventions)
  const host = 
    parsedUrl?.host ||
    process.env.DB_HOST ||
    process.env.POSTGRES_HOST ||
    'localhost';
  
  const port = 
    parsedUrl?.port ||
    parseInt(process.env.DB_PORT || process.env.POSTGRES_PORT || '5432', 10) || 5432;
  
  const username = 
    parsedUrl?.username ||
    process.env.DB_USERNAME ||
    process.env.DB_USER ||
    process.env.POSTGRES_USER ||
    'postgres';
  
  const password = 
    parsedUrl?.password ||
    process.env.DB_PASSWORD ||
    process.env.POSTGRES_PASSWORD ||
    'postgres';
  
  const database = 
    parsedUrl?.database ||
    process.env.DB_NAME ||
    process.env.DB_DATABASE ||
    process.env.POSTGRES_DB ||
    'postgres';
  
  // SSL configuration: from URL, or env var, or default to false
  const ssl = 
    parsedUrl?.ssl ||
    (process.env.DB_SSL === 'require' || process.env.POSTGRES_SSL === 'require'
      ? { rejectUnauthorized: false }
      : false);

  // Log the host being used (without sensitive data) for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔌 Database config: ${host}:${port}/${database}`);
  }

  return {
    host,
    port,
    username,
    password,
    database,
    ssl,
  };
});
