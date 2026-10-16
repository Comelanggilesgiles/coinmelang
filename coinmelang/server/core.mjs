// ---------------------------------------------------------------------------
// Coinmelang backend core
// Storage-agnostic request handler shared by:
//   • server/index.mjs        (real Node.js HTTP server, JSON-file database)
//   • src/app/core/api.service (in-browser fallback, localStorage database)
// Uses only Web-standard APIs (Web Crypto) so it runs in Node 20+ and browsers.
// ---------------------------------------------------------------------------

const STARTING_CASH = 10000;

export const ASSETS = [
  { symbol: "BTC", name: "Bitcoin", price: 67240, color: "#F7931A" },
  { symbol: "ETH", name: "Ethereum", price: 3480, color: "#627EEA" },
  { symbol: "SOL", name: "Solana", price: 172.4, color: "#14F195" },
  { symbol: "BNB", name: "BNB", price: 590.2, color: "#F3BA2F" },
  { symbol: "XRP", name: "XRP", price: 0.62, color: "#23292F" },
  { symbol: "ADA", name: "Cardano", price: 0.45, color: "#0033AD" },
  { symbol: "DOGE", name: "Dogecoin", price: 0.162, color: "#C2A633" },
  { symbol: "POL", name: "Polygon", price: 0.72, color: "#8247E5" },
];

const SEED_TESTIMONIALS = [
  { name: "Leo Culhane", role: "Product Designer", rating: 5, quote: "Completely transformed my investment journey. Their platform is super user friendly, their customer support is top." },
  { name: "James Siphron", role: "Software Engineer", rating: 5, quote: "I've been using various crypto platforms for years, but Coinmelang stands out with its cutting-edge tools and reliability." },
  { name: "Phillip Lipshutz", role: "Entrepreneur", rating: 5, quote: "Coinmelang stands out with cutting-edge tools I can rely on. It's user friendly, and their support actually cares." },
];

export function emptyDb() {
  const now = Date.now();
  return {
    users: [],
    sessions: {},
    transactions: [],
    testimonials: SEED_TESTIMONIALS.map((t, i) => ({ id: uid(), ...t, createdAt: now - (i + 1) * 86400000 })),
    subscribers: [],
    messages: [],
  };
}

// ---------- helpers ----------
function uid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  // insecure-context fallback (randomUUID needs https/localhost)
  const b = globalThis.crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = hex(b);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
function hex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  if (!globalThis.crypto?.subtle) {
    // insecure-context fallback (browser demo only): iterated FNV-1a
    let h = 0x811c9dc5;
    const s = salt + ":" + password;
    for (let r = 0; r < 5000; r++) for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
    return "fnv" + h.toString(16);
  }
  const key = await globalThis.crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await globalThis.crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode(salt), iterations: 100000, hash: "SHA-256" }, key, 256);
  return hex(bits);
}
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const str = (v, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const fail = (status, message) => {
  throw new HttpError(status, message);
};

function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, createdAt: u.createdAt };
}

// ---------- market simulation (random walk, kept in memory) ----------
function createMarket() {
  const state = ASSETS.map((a) => {
    const history = [];
    let p = a.price * 0.96;
    for (let i = 0; i < 40; i++) {
      p *= 1 + (Math.random() - 0.47) * 0.012;
      history.push(p);
    }
    return { ...a, open: history[0], price: history[history.length - 1], history };
  });
  let last = Date.now();
  return {
    snapshot() {
      const steps = Math.min(20, Math.floor((Date.now() - last) / 1500));
      if (steps > 0) {
        last = Date.now();
        for (let s = 0; s < steps; s++) {
          for (const a of state) {
            a.price = Math.max(a.price * (1 + (Math.random() - 0.48) * 0.006), 0.0001);
            a.history.push(a.price);
            if (a.history.length > 40) a.history.shift();
          }
        }
      }
      return state.map((a) => ({
        symbol: a.symbol,
        name: a.name,
        color: a.color,
        price: a.price,
        change24h: ((a.price - a.open) / a.open) * 100,
        history: [...a.history],
      }));
    },
    price(symbol) {
      return state.find((a) => a.symbol === symbol)?.price;
    },
  };
}

// ---------- backend factory ----------
/**
 * @param {{ load(): any | Promise<any>, save(db: any): void | Promise<void> }} storage
 */
export function createBackend(storage) {
  const market = createMarket();
  let db = null;

  async function getDb() {
    if (!db) db = (await storage.load()) || emptyDb();
    return db;
  }
  async function commit() {
    await storage.save(db);
  }
  function auth(token) {
    const userId = token && db.sessions[token];
    const user = userId && db.users.find((u) => u.id === userId);
    if (!user) fail(401, "Please log in to continue.");
    return user;
  }
  function portfolio(user) {
    const prices = market.snapshot();
    const holdings = Object.entries(user.holdings)
      .filter(([, qty]) => qty > 1e-10)
      .map(([symbol, qty]) => {
        const a = prices.find((p) => p.symbol === symbol);
        return { symbol, name: a.name, color: a.color, qty, price: a.price, value: qty * a.price, change24h: a.change24h };
      })
      .sort((a, b) => b.value - a.value);
    const invested = holdings.reduce((s, h) => s + h.value, 0);
    const total = user.cash + invested;
    return {
      cash: user.cash,
      invested,
      total,
      pnl: total - STARTING_CASH,
      pnlPct: ((total - STARTING_CASH) / STARTING_CASH) * 100,
      holdings,
      transactions: db.transactions.filter((t) => t.userId === user.id).slice(-25).reverse(),
    };
  }

  const routes = {
    "GET /api/health": async () => ({ ok: true, time: Date.now() }),

    "GET /api/stats": async () => ({
      users: db.users.length,
      trades: db.transactions.length,
      subscribers: db.subscribers.length,
      reviews: db.testimonials.length,
    }),

    "POST /api/auth/signup": async ({ body }) => {
      const name = str(body.name, 60);
      const email = str(body.email, 120).toLowerCase();
      const password = typeof body.password === "string" ? body.password : "";
      if (name.length < 2) fail(400, "Please enter your name.");
      if (!EMAIL_RE.test(email)) fail(400, "Please enter a valid email address.");
      if (password.length < 6) fail(400, "Password must be at least 6 characters.");
      if (db.users.some((u) => u.email === email)) fail(409, "An account with this email already exists.");
      const salt = uid();
      const user = { id: uid(), name, email, salt, hash: await hashPassword(password, salt), createdAt: Date.now(), cash: STARTING_CASH, holdings: {} };
      db.users.push(user);
      const token = uid();
      db.sessions[token] = user.id;
      await commit();
      return { token, user: publicUser(user) };
    },

    "POST /api/auth/login": async ({ body }) => {
      const email = str(body.email, 120).toLowerCase();
      const user = db.users.find((u) => u.email === email);
      if (!user || (await hashPassword(String(body.password || ""), user.salt)) !== user.hash) fail(401, "Incorrect email or password.");
      const token = uid();
      db.sessions[token] = user.id;
      await commit();
      return { token, user: publicUser(user) };
    },

    "POST /api/auth/logout": async ({ token }) => {
      if (token) delete db.sessions[token];
      await commit();
      return { ok: true };
    },

    "GET /api/auth/me": async ({ token }) => ({ user: publicUser(auth(token)) }),

    "GET /api/market": async () => ({ assets: market.snapshot(), updatedAt: Date.now() }),

    "GET /api/portfolio": async ({ token }) => portfolio(auth(token)),

    "POST /api/trade": async ({ token, body }) => {
      const user = auth(token);
      const symbol = str(body.symbol, 10).toUpperCase();
      const side = body.side === "sell" ? "sell" : "buy";
      const usd = Number(body.amountUsd);
      const price = market.price(symbol);
      if (!price) fail(400, "Unknown asset.");
      if (!Number.isFinite(usd) || usd < 1) fail(400, "Minimum trade is $1.");
      const qty = usd / price;
      if (side === "buy") {
        if (usd > user.cash + 1e-9) fail(400, "Insufficient cash balance.");
        user.cash -= usd;
        user.holdings[symbol] = (user.holdings[symbol] || 0) + qty;
      } else {
        const held = user.holdings[symbol] || 0;
        if (qty > held + 1e-9) fail(400, `You only hold ${held.toFixed(6)} ${symbol}.`);
        user.holdings[symbol] = Math.max(0, held - qty);
        user.cash += usd;
      }
      const tx = { id: uid(), userId: user.id, symbol, side, qty, price, usd, createdAt: Date.now() };
      db.transactions.push(tx);
      await commit();
      return { transaction: tx, portfolio: portfolio(user) };
    },

    "GET /api/testimonials": async () => ({
      testimonials: [...db.testimonials].sort((a, b) => b.createdAt - a.createdAt).map(({ userId, ...t }) => t),
    }),

    "POST /api/testimonials": async ({ token, body }) => {
      const user = auth(token);
      const quote = str(body.quote, 280);
      const role = str(body.role, 40) || "Coinmelang member";
      const rating = Math.min(5, Math.max(1, Math.round(Number(body.rating) || 5)));
      if (quote.length < 10) fail(400, "Your review should be at least 10 characters.");
      const t = { id: uid(), userId: user.id, name: user.name, role, quote, rating, createdAt: Date.now() };
      db.testimonials.push(t);
      await commit();
      const { userId, ...pub } = t;
      return { testimonial: pub };
    },

    "POST /api/newsletter": async ({ body }) => {
      const email = str(body.email, 120).toLowerCase();
      if (!EMAIL_RE.test(email)) fail(400, "Please enter a valid email address.");
      if (db.subscribers.some((s) => s.email === email)) return { ok: true, message: "You're already subscribed — thanks!" };
      db.subscribers.push({ email, createdAt: Date.now() });
      await commit();
      return { ok: true, message: "You're on the list!" };
    },

    "POST /api/contact": async ({ body }) => {
      const name = str(body.name, 60);
      const email = str(body.email, 120).toLowerCase();
      const message = str(body.message, 1000);
      if (name.length < 2) fail(400, "Please enter your name.");
      if (!EMAIL_RE.test(email)) fail(400, "Please enter a valid email address.");
      if (message.length < 10) fail(400, "Message should be at least 10 characters.");
      db.messages.push({ id: uid(), name, email, message, createdAt: Date.now() });
      await commit();
      return { ok: true, message: "Thanks! Our team will reply within 24 hours." };
    },
  };

  /**
   * @returns {Promise<{ status: number, data: any }>}
   */
  async function handle(method, path, body, token) {
    const route = routes[`${method.toUpperCase()} ${path.split("?")[0]}`];
    if (!route) return { status: 404, data: { error: "Not found" } };
    try {
      await getDb();
      return { status: 200, data: await route({ body: body || {}, token }) };
    } catch (e) {
      if (e instanceof HttpError) return { status: e.status, data: { error: e.message } };
      console.error(e);
      return { status: 500, data: { error: "Something went wrong. Please try again." } };
    }
  }

  return { handle };
}
