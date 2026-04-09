require("dotenv").config();

const app = require("./app");

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`XeTai365 backend listening on port ${port}`);
});
