require("dotenv").config();

const { applyPendingMigrations } = require("../src/config/db");

async function run() {
  await applyPendingMigrations();
  console.log("Migration completed.");
}

run().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exit(1);
});
