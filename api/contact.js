// POST /api/contact — validates a message and (optionally) forwards it.
// Nothing is stored. If CONTACT_WEBHOOK_URL is set in Vercel's environment
// variables (e.g. a Discord/Slack webhook), the message is forwarded there;
// otherwise it is only logged to Vercel's function logs.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (v, max) => String(v ?? "").trim().slice(0, max);

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "Invalid JSON." }); }
  }
  body = body || {};

  // Honeypot: bots fill hidden fields. Pretend success, do nothing.
  if (body.company) return res.status(200).json({ message: "Thanks! Your message was received." });

  const name = clean(body.name, 80);
  const email = clean(body.email, 120);
  const message = clean(body.message, 2000);

  if (!name || !email || !message) return res.status(400).json({ error: "All fields are required." });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "Please enter a valid email." });
  if (message.length < 5) return res.status(400).json({ error: "Message is a little too short." });

  const webhook = process.env.CONTACT_WEBHOOK_URL;
  try {
    if (webhook) {
      const r = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // `content` works for Discord, `text` for Slack.
        body: JSON.stringify({
          content: `**New message from ${name}** (${email})\n${message}`,
          text: `New message from ${name} (${email})\n${message}`,
        }),
      });
      if (!r.ok) throw new Error(`Webhook responded ${r.status}`);
    } else {
      console.log("[contact]", { name, email, message });
    }
  } catch (err) {
    console.error("[contact] forward failed:", err.message);
    return res.status(502).json({ error: "Couldn't deliver your message. Please try again." });
  }

  return res.status(200).json({ message: `Thanks, ${name.split(" ")[0]}! Your message was received.` });
}
