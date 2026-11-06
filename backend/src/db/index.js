import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import pg from "pg";
import { config } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let sqliteDb = null;
let pgPool = null;

const isPostgres = config.databaseUrl.startsWith("postgres://") || config.databaseUrl.startsWith("postgresql://");

function initSqlite() {
  let dbPath = config.databaseUrl.replace(/^sqlite:/, "").trim();
  if (dbPath !== ":memory:") {
    if (!path.isAbsolute(dbPath)) {
      dbPath = path.resolve(__dirname, "../../", dbPath);
    }
    const dir = path.dirname(dbPath);
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    } catch {
      // directory might already exist or handled by host
    }
  }

  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec("PRAGMA journal_mode = WAL;");
  return db;
}

function initPostgres() {
  const pool = new pg.Pool({
    connectionString: config.databaseUrl,
    ssl: config.isProduction ? { rejectUnauthorized: false } : false,
  });
  return pool;
}

export function getDatabase() {
  if (isPostgres) {
    if (!pgPool) pgPool = initPostgres();
    return { type: "postgres", client: pgPool };
  } else {
    if (!sqliteDb) sqliteDb = initSqlite();
    return { type: "sqlite", client: sqliteDb };
  }
}

/**
 * Executes a query returning all rows
 */
export async function query(sql, params = []) {
  const { type, client } = getDatabase();
  if (type === "sqlite") {
    const stmt = client.prepare(sql);
    return stmt.all(...params);
  } else {
    // Convert ? to $1, $2, etc for postgres
    let index = 1;
    const pgSql = sql.replace(/\?/g, () => `$${index++}`);
    const res = await client.query(pgSql, params);
    return res.rows;
  }
}

/**
 * Executes a query returning a single row
 */
export async function get(sql, params = []) {
  const { type, client } = getDatabase();
  if (type === "sqlite") {
    const stmt = client.prepare(sql);
    return stmt.get(...params) || null;
  } else {
    let index = 1;
    const pgSql = sql.replace(/\?/g, () => `$${index++}`);
    const res = await client.query(pgSql, params);
    return res.rows[0] || null;
  }
}

/**
 * Executes an INSERT / UPDATE / DELETE statement
 */
export async function run(sql, params = []) {
  const { type, client } = getDatabase();
  if (type === "sqlite") {
    const stmt = client.prepare(sql);
    const result = stmt.run(...params);
    return { changes: result.changes, lastInsertRowid: result.lastInsertRowid };
  } else {
    let index = 1;
    const pgSql = sql.replace(/\?/g, () => `$${index++}`);
    const res = await client.query(pgSql, params);
    return { changes: res.rowCount, lastInsertRowid: null };
  }
}

/**
 * Executes raw SQL statements (schema migrations)
 */
export async function exec(sql) {
  const { type, client } = getDatabase();
  if (type === "sqlite") {
    client.exec(sql);
  } else {
    await client.query(sql);
  }
}

/**
 * Runs callback within a database transaction
 */
export async function transaction(callback) {
  const { type, client } = getDatabase();
  if (type === "sqlite") {
    client.exec("BEGIN IMMEDIATE;");
    try {
      const result = await callback();
      client.exec("COMMIT;");
      return result;
    } catch (err) {
      client.exec("ROLLBACK;");
      throw err;
    }
  } else {
    const clientConn = await client.connect();
    try {
      await clientConn.query("BEGIN;");
      const result = await callback(clientConn);
      await clientConn.query("COMMIT;");
      return result;
    } catch (err) {
      await clientConn.query("ROLLBACK;");
      throw err;
    } finally {
      clientConn.release();
    }
  }
}

/**
 * Initialize database schema
 */
export async function initializeDatabase() {
  // 1. Ensure grade_level column exists in existing tables before running index definitions
  try {
    const { type, client } = getDatabase();
    if (type === "sqlite") {
      const tableInfo = client.prepare("PRAGMA table_info(books)").all();
      if (tableInfo.length > 0) {
        const hasGradeLevel = tableInfo.some((col) => col.name === "grade_level");
        if (!hasGradeLevel) {
          client.exec("ALTER TABLE books ADD COLUMN grade_level TEXT NOT NULL DEFAULT 'General';");
        }
      }
    }
  } catch {
    // Books table might not exist yet
  }

  // 2. Execute schema DDL and indexes
  const schemaPath = path.resolve(__dirname, "./schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf-8");
  await exec(schemaSql);
}
