require("dotenv").config();

const app = require("./app");
const { connectDatabase } = require("./config/db");

const port = Number(process.env.PORT) || 3000;

async function bootstrap() {
  try {
    await connectDatabase();

    app.listen(port, () => {
      console.log(`XeTai365 backend listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect PostgreSQL:", error.message);
    process.exit(1);
  }
}

bootstrap();
