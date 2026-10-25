// Front-end logic: theme toggle, health check, quote fetcher, contact form.
const $ = (s) => document.querySelector(s);

// ---- Theme (remembered per browser) ----
const root = document.documentElement;
try {
  const saved = localStorage.getItem("theme");
  if (saved) root.dataset.theme = saved;
} catch {}
$("#theme-toggle").addEventListener("click", () => {
  const dark = root.dataset.theme
    ? root.dataset.theme === "dark"
    : matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = dark ? "light" : "dark";
  try { localStorage.setItem("theme", root.dataset.theme); } catch {}
});

$("#year").textContent = new Date().getFullYear();

// ---- Backend health ----
(async () => {
  const status = $("#status"), text = $("#status-text");
  try {
    const t0 = performance.now();
    const res = await fetch("/api/health");
    const data = await res.json();
    const ms = Math.round(performance.now() - t0);
    status.classList.add("ok");
    text.textContent = `Backend online · ${ms} ms · ${data.region}`;
  } catch {
    status.classList.add("down");
    text.textContent = "Backend unreachable";
  }
})();

// ---- Quote ----
const quoteBtn = $("#quote-btn"), quote = $("#quote");
let lastId = -1;
quoteBtn.addEventListener("click", async () => {
  quoteBtn.disabled = true;
  quote.classList.add("fading");
  try {
    const res = await fetch(`/api/quote?exclude=${lastId}`);
    if (!res.ok) throw new Error();
    const q = await res.json();
    lastId = q.id;
    setTimeout(() => {
      $("#quote-text").textContent = `“${q.text}”`;
      $("#quote-author").textContent = `— ${q.author}`;
      $("#quote-meta").innerHTML = `Served by <code>GET /api/quote</code> at ${new Date(q.servedAt).toLocaleTimeString()}`;
      quote.classList.remove("fading");
    }, 250);
  } catch {
    quote.classList.remove("fading");
    $("#quote-meta").textContent = "Couldn't reach the API. Try again.";
  } finally {
    quoteBtn.disabled = false;
  }
});

// ---- Contact form ----
const form = $("#contact-form"), msg = $("#form-msg");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.className = "";
  if (!form.checkValidity()) {
    msg.className = "err";
    msg.textContent = "Please fill in every field with a valid email.";
    return;
  }
  const btn = form.querySelector("button");
  btn.disabled = true;
  btn.textContent = "Sending…";
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Something went wrong.");
    msg.className = "ok";
    msg.textContent = data.message;
    form.reset();
  } catch (err) {
    msg.className = "err";
    msg.textContent = err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = "Send message";
  }
});
