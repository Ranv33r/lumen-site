// GET /api/health — lightweight liveness check.
export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    status: "ok",
    region: process.env.VERCEL_REGION || "local",
    time: new Date().toISOString(),
  });
}
