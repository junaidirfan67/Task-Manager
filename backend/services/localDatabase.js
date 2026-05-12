const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const dataFile = path.join(dataDir, "local-db.json");
const emptyDb = { users: [], tasks: [] };

async function ensureLocalDatabase() {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(dataFile);
  } catch {
    await writeDb(emptyDb);
  }
}

async function readDb() {
  await ensureLocalDatabase();
  const raw = await fs.readFile(dataFile, "utf8");
  return JSON.parse(raw);
}

async function writeDb(db) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFile, `${JSON.stringify(db, null, 2)}\n`);
}

function createId() {
  return crypto.randomUUID();
}

module.exports = {
  createId,
  ensureLocalDatabase,
  readDb,
  writeDb
};
