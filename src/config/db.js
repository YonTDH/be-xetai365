const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

let pool;

function toBoolean(value, fallback = false) {
  if (typeof value === "undefined") {
    return fallback;
  }

  return String(value).trim().toLowerCase() === "true";
}

function getPool() {
  if (pool) {
    return pool;
  }

  const useSsl = toBoolean(process.env.POSTGRES_SSL, false);

  pool = new Pool({
    host: process.env.POSTGRES_HOST || "127.0.0.1",
    port: Number(process.env.POSTGRES_PORT) || 5432,
    user: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "",
    database: process.env.POSTGRES_DB || "postgres",
    ssl: useSsl ? { rejectUnauthorized: false } : false,
  });

  return pool;
}

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id BIGSERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

function getMigrationFiles() {
  const migrationsDir = path.resolve(__dirname, "../../migrations");
  if (!fs.existsSync(migrationsDir)) {
    return [];
  }

  return fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort()
    .map((filename) => ({
      filename,
      fullPath: path.join(migrationsDir, filename),
    }));
}

async function hasMigration(client, filename) {
  const result = await client.query(
    "SELECT 1 FROM schema_migrations WHERE filename = $1 LIMIT 1",
    [filename]
  );
  return result.rowCount > 0;
}

async function applyPendingMigrations() {
  const client = await getPool().connect();

  try {
    await ensureMigrationsTable(client);
    const files = getMigrationFiles();

    for (const file of files) {
      const applied = await hasMigration(client, file.filename);
      if (applied) {
        continue;
      }

      const sql = fs.readFileSync(file.fullPath, "utf8");
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [
          file.filename,
        ]);
        await client.query("COMMIT");
        console.log(`Applied migration: ${file.filename}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  } finally {
    client.release();
  }
}

async function ensureSeedData() {
  await getPool().query(`
    INSERT INTO settings (
      id, title, keywords, description, giupdochiase, ten, email, website,
      dienthoai, diachi, fax, tennv, hotline, tennv1, hotline1, tennv2,
      hotline2, toado, facebook, youtube, yahoo, skype, twitter, zing,
      google, tip, linktip, analytics, dangky, tietkiem, hailong, updated_at
    )
    VALUES (
      1,
      'Xe Tai - Xe Dau Keo - Xe Chuyen Dung',
      'dongfeng, howo, hyundai, xe tai',
      'Thong tin cau hinh website va lien he cho XeTai365',
      3,
      'XE TAI 365 GROUP',
      'vanducbon99@gmail.com',
      'https://xetai365.vn',
      '0899.966.254',
      'So 16, Duong Dan Cau Phu Long, Binh Duong',
      '0899.966.254',
      '',
      '0899.966.254',
      '',
      '',
      '',
      '',
      '',
      'https://www.facebook.com/profile.php?id=100072217597486',
      'https://www.youtube.com/channel/UC24fCjRcXuDH1dnbgGewb1A',
      '',
      '',
      'http://twitter.com',
      '',
      'https://plus.google.com/u/0/',
      '<button>Chat</button>',
      '',
      '',
      '',
      '<iframe src=''https://www.google.com/maps/embed?pb=sample''></iframe>',
      '',
      NOW()
    )
    ON CONFLICT (id) DO NOTHING
  `);

  await getPool().query(`
    INSERT INTO users (username, full_name, email, phone, role, status, created_at)
    SELECT
      'user' || LPAD(gs::text, 4, '0'),
      'XeTai User ' || gs::text,
      'user' || LPAD(gs::text, 4, '0') || '@xetai365.local',
      '090' || LPAD(gs::text, 7, '0'),
      CASE WHEN gs = 1 THEN 'admin' ELSE 'customer' END,
      CASE WHEN (gs % 20) = 0 THEN 'inactive' ELSE 'active' END,
      NOW() - (gs || ' minutes')::interval
    FROM generate_series(1, 1000) AS gs
    WHERE NOT EXISTS (SELECT 1 FROM users)
  `);
}

async function connectDatabase() {
  const instance = getPool();
  const client = await instance.connect();

  try {
    await client.query("SELECT 1");
    await applyPendingMigrations();
    await ensureSeedData();
    console.log("PostgreSQL connected successfully");
  } finally {
    client.release();
  }
}

async function checkDatabaseHealth() {
  try {
    await getPool().query("SELECT 1");
    return { status: "up" };
  } catch (error) {
    return {
      status: "down",
      message: error.message,
    };
  }
}

module.exports = {
  getPool,
  connectDatabase,
  applyPendingMigrations,
  checkDatabaseHealth,
};
