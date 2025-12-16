const express = require("express");
const client = require("prom-client");

const app = express();
const PORT = 3000;

// Collect default system metrics (CPU, memory, etc.)
client.collectDefaultMetrics();

// Histogram for request latency (this is SRE gold)
const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request latency",
  labelNames: ["method", "route", "status"],
  buckets: [0.05, 0.1, 0.2, 0.3, 0.5, 1, 2]
});

// Middleware to track metrics
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer({
    method: req.method,
    route: req.path
  });

  res.on("finish", () => {
    end({ status: res.statusCode });
  });

  next();
});

// Routes
app.get("/", (req, res) => {
  res.json({
    service: "cloud-sre-observability",
    status: "running"
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/ready", (req, res) => {
  res.status(200).json({ status: "ready" });
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ App running on http://localhost:${PORT}`);
});
