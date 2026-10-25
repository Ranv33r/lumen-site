// GET /api/quote?exclude=<id> — returns a random quote from an in-memory list.
const QUOTES = [
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "The details are not the details. They make the design.", author: "Charles Eames" },
  { text: "Less, but better.", author: "Dieter Rams" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Good design is as little design as possible.", author: "Dieter Rams" },
  { text: "Programs must be written for people to read.", author: "Harold Abelson" },
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
  { text: "Simple things should be simple, complex things should be possible.", author: "Alan Kay" },
  { text: "Quality is not an act, it is a habit.", author: "Will Durant" },
];

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const exclude = Number.parseInt(req.query?.exclude, 10);
  let id;
  do {
    id = Math.floor(Math.random() * QUOTES.length);
  } while (id === exclude && QUOTES.length > 1);

  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ id, ...QUOTES[id], servedAt: new Date().toISOString() });
}
