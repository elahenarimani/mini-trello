import { runDatabaseCommand } from "./database-command.js";

if (require.main === module) {
  void runDatabaseCommand("Connection check", async () => {});
}
