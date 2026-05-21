import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import mesageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { app , server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT;

// CORS
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// BODY PARSERS (ONLY ONCE)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/messages", mesageRoutes);

server.listen(PORT, () => {
  console.log("server is running on port:" + PORT);
  connectDB();
});
