const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const { PrismaClient } = require("./generated/prisma");
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const { errorHandler } = require("./middleware/ErrorHandler.middleware");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;
const prisma = new PrismaClient();

// --- Middlewares ---
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || "*", // Adjust in production
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
// Load your Swagger file
const swaggerDocument = YAML.load("./swagger.yaml");

// Serve Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json()); // Parse JSON bodies
app.use(morgan("combined")); // Logging

// --- Health Check ---
app.get("/", (_, res) => {
  res.status(200).send({ message: "Server is healthy" });
});

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

// --- Error Handling ---
app.use(errorHandler);

// --- Graceful Prisma Shutdown ---
process.on("SIGINT", async () => {
  console.log("SIGINT received. Disconnecting Prisma...");
  await prisma.$disconnect();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Disconnecting Prisma...");
  await prisma.$disconnect();
  process.exit(0);
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode at http://localhost:${PORT}`);
});

module.exports = app; // export for testing if needed
