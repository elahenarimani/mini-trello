import app from "./app.js";
import { getDatabase } from "./config/database.js";

// Fail clearly at local startup; this validates configuration without running SQL.
getDatabase();

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
