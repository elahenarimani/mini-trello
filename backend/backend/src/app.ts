import express from "express";
import cors from "cors";
import taskRoutes from "./routes/task.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));
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
