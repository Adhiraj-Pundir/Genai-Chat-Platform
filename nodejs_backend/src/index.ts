import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import agentRoutes from "./routes/agent";
import chatRoutes from "./routes/chat";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "nodejs-backend" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/chat", chatRoutes);

// Global error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Backend] Server running on port ${PORT}`);
});
