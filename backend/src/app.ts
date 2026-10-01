import express from "express";
import cors from "cors";
import taskRoutes from "./routes/task.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

const allowedOrigins: string[] = ["http://localhost:5173"];
const frontendUrl = process.env.FRONTEND_URL ?? process.env.CORS_ORIGIN;
if (frontendUrl) allowedOrigins.push(frontendUrl);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Mini Trello API is running",
  });
});

app.use("/api/tasks", taskRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
