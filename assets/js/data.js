/* Code Library — snippet dataset.
   Plain JS array (not fetched) so the site also works when opened via file://.
   Scope: web development only — vanilla JavaScript (frontend), Node.js (backend / full stack),
   and Tailwind CSS. */

const LANGUAGE_LABELS = {
  javascript: "JavaScript",
  node: "Node.js",
  tailwind: "Tailwind CSS",
};

const SNIPPETS = [
  {
    id: "debounce-function",
    title: "Debounce Function",
    language: "javascript",
    tags: ["functions", "performance", "closures"],
    difficulty: "Beginner",
    description: "Delay a function's execution until a burst of calls goes quiet — perfect for search inputs and resize handlers.",
    explanation: `A debounce wraps a function so that no matter how many times it's called in quick succession, the wrapped function only runs once — after a period of silence.

**How it works**

1. \`debounce\` returns a brand new function, and keeps a \`timeoutId\` alive in its closure between calls.
2. Every time the returned function fires, it immediately cancels any pending timer with \`clearTimeout\`.
3. It then schedules a fresh \`setTimeout\` for \`delay\` milliseconds. If another call arrives before that timer fires, step 2 wipes it out and the clock restarts.
4. Only when \`delay\` ms pass without a new call does the timer finally fire and invoke the original \`fn\`, with the right \`this\` and arguments preserved via \`apply\`.

This makes it ideal for things like a search-as-you-type box: instead of firing a network request on every keystroke, you wait until the user pauses.`,
    code: `function debounce(fn, delay = 300) {
  let timeoutId;

  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// Usage
const handleResize = debounce(() => {
  console.log("Window resized to", window.innerWidth);
}, 250);

window.addEventListener("resize", handleResize);`,
    preview: {
      type: "js",
      run: `function debounce(fn, delay = 300) {
  let timeoutId;
  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

let executions = 0;
const debounced = debounce(() => {
  executions++;
  console.log("Executed! (total executions so far: " + executions + ")");
}, 300);

console.log("Calling the debounced function 5 times rapidly...");
for (let i = 1; i <= 5; i++) {
  console.log("  call #" + i);
  debounced();
}
console.log("Waiting for 300ms of silence...");`,
    },
  },
  {
    id: "throttle-function",
    title: "Throttle Function",
    language: "javascript",
    tags: ["performance", "events", "scroll"],
    difficulty: "Beginner",
    description: "Ensure a function runs at most once every fixed interval — ideal for scroll and mousemove handlers that fire dozens of times a second.",
    explanation: `Throttling guarantees a function runs on a steady cadence no matter how rapidly it's triggered — unlike debounce, which waits for silence, throttle keeps firing at a fixed rate.

**How it works**

1. A \`isThrottled\` flag, closed over between calls, tracks whether we're inside a "cooldown" window.
2. The first call runs \`fn\` immediately and flips \`isThrottled\` to \`true\`.
3. Every call that arrives while \`isThrottled\` is \`true\` is silently dropped — the function simply doesn't run for them.
4. A \`setTimeout\` clears the flag after \`limit\` milliseconds, opening the door for the *next* call to run immediately and start a new cooldown.

This makes throttle the right tool for things like scroll-position tracking or infinite-scroll loading checks, where you want regular updates but not one for every single scroll event.`,
    code: `function throttle(fn, limit = 200) {
  let isThrottled = false;

  return function throttled(...args) {
    if (isThrottled) return;

    fn.apply(this, args);
    isThrottled = true;

    setTimeout(() => {
      isThrottled = false;
    }, limit);
  };
}

// Usage
const handleScroll = throttle(() => {
  console.log("Scroll position:", window.scrollY);
}, 200);

window.addEventListener("scroll", handleScroll);`,
    preview: {
      type: "js",
      run: `function throttle(fn, limit = 200) {
  let isThrottled = false;
  return function throttled(...args) {
    if (isThrottled) return;
    fn.apply(this, args);
    isThrottled = true;
    setTimeout(() => { isThrottled = false; }, limit);
  };
}

let runs = 0;
const throttled = throttle(() => {
  runs++;
  console.log("Ran! (execution #" + runs + ")");
}, 200);

console.log("Calling the throttled function every 60ms, 6 times...");
let i = 0;
const interval = setInterval(() => {
  i++;
  console.log("  call #" + i);
  throttled();
  if (i === 6) clearInterval(interval);
}, 60);`,
    },
  },
  {
    id: "fetch-with-timeout",
    title: "Fetch with a Timeout",
    language: "javascript",
    tags: ["fetch", "async", "networking", "abortcontroller"],
    difficulty: "Intermediate",
    description: "Wrap the Fetch API so a slow request automatically aborts after a timeout instead of hanging forever.",
    explanation: `By default, \`fetch\` has no timeout — a slow or hung server leaves your request pending indefinitely unless you build cancellation in yourself.

**How it works**

1. An \`AbortController\` is created per request; its \`signal\` is passed into \`fetch\`'s options, giving us a handle to cancel that specific request.
2. \`setTimeout\` schedules \`controller.abort()\` to fire after \`timeoutMs\` — if the server hasn't responded by then, this cancels the in-flight request, which makes \`fetch\` reject with an \`AbortError\`.
3. \`clearTimeout\` in the \`finally\` block cancels that pending timer as soon as the request *does* finish, success or failure — otherwise you'd fire a needless \`abort()\` on an already-completed request.
4. The \`try/catch\` re-throws a friendlier \`Error\` when the abort was caused by our own timeout, so calling code can distinguish "timed out" from other network failures if it wants to.

This pattern is the backbone of resilient front-end networking: a slow third-party API can't hang your UI forever.`,
    code: `async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    return await res.json();
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error(\`Request timed out after \${timeoutMs}ms\`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// Usage
const data = await fetchWithTimeout("/api/slow-endpoint", {}, 3000);`,
    preview: {
      type: "js",
      run: `function fakeSlowRequest(delayMs) {
  return new Promise((resolve) => setTimeout(() => resolve({ data: "payload" }), delayMs));
}

async function fetchWithTimeout(promiseFactory, timeoutMs) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("Request timed out after " + timeoutMs + "ms")), timeoutMs);
  });

  try {
    const result = await Promise.race([promiseFactory(), timeout]);
    console.log("Success:", JSON.stringify(result));
  } catch (err) {
    console.log(err.message);
  } finally {
    clearTimeout(timer);
  }
}

(async () => {
  console.log("Request 1 — server responds in 200ms, timeout is 500ms");
  await fetchWithTimeout(() => fakeSlowRequest(200), 500);

  console.log("Request 2 — server responds in 800ms, timeout is 400ms");
  await fetchWithTimeout(() => fakeSlowRequest(800), 400);
})();`,
    },
  },
  {
    id: "localstorage-json-helper",
    title: "LocalStorage JSON Helper",
    language: "javascript",
    tags: ["browser-apis", "storage", "utilities"],
    difficulty: "Beginner",
    description: "Safely read and write JSON-serializable values to localStorage without repeating try/catch and JSON.parse everywhere.",
    explanation: `\`localStorage\` only stores strings, so every real value needs to be serialized going in and parsed coming out — and parsing can throw if the stored value is corrupted or missing.

**How it works**

1. \`setItem\` calls \`JSON.stringify\` on whatever value you pass — objects, arrays, numbers, booleans all survive the round trip, unlike raw \`localStorage.setItem\`, which would silently coerce them to the string \`"[object Object]"\`.
2. \`getItem\` wraps the read in a \`try/catch\`: if the key doesn't exist, \`localStorage.getItem\` returns \`null\`, and \`JSON.parse(null)\` actually parses to the value \`null\` — so that case works naturally without special-casing.
3. If the stored string is corrupted (edited by hand, or written by an older version of your app with a different shape), \`JSON.parse\` throws — the \`catch\` swallows that and falls back to \`defaultValue\` instead of crashing the whole page.
4. Because both functions go through this one helper, every part of the app gets the same safe behavior for free instead of repeating \`JSON.parse(localStorage.getItem(...))\`, and forgetting the try/catch, in a dozen places.

This kind of small wrapper is exactly the sort of thing that's easy to skip until the one time a corrupted value crashes production.`,
    code: `const storage = {
  setItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  getItem(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? defaultValue : JSON.parse(raw);
    } catch {
      return defaultValue;
    }
  },

  removeItem(key) {
    localStorage.removeItem(key);
  },
};

// Usage
storage.setItem("preferences", { theme: "dark", fontSize: 16 });
const prefs = storage.getItem("preferences", {});
console.log(prefs.theme); // "dark"`,
    preview: {
      type: "js",
      run: `// This preview uses a plain object as a stand-in for real localStorage,
// since a sandboxed preview frame can't access the page's actual storage.
const fakeLocalStorage = {};

const storage = {
  setItem(key, value) {
    fakeLocalStorage[key] = JSON.stringify(value);
  },
  getItem(key, defaultValue = null) {
    try {
      const raw = key in fakeLocalStorage ? fakeLocalStorage[key] : null;
      return raw === null ? defaultValue : JSON.parse(raw);
    } catch {
      return defaultValue;
    }
  },
};

storage.setItem("preferences", { theme: "dark", fontSize: 16 });
console.log("Raw stored string:", fakeLocalStorage["preferences"]);

const prefs = storage.getItem("preferences", {});
console.log("Read back:", JSON.stringify(prefs));
console.log("prefs.theme =", prefs.theme);

console.log("Missing key with a default:", JSON.stringify(storage.getItem("missing-key", { fallback: true })));`,
    },
  },
  {
    id: "minimal-http-server",
    title: "Minimal HTTP Server",
    language: "node",
    tags: ["http", "server", "fundamentals"],
    difficulty: "Beginner",
    description: "Spin up a plain HTTP server with Node's built-in http module — no framework required.",
    explanation: `Node ships with a full HTTP server implementation out of the box; frameworks like Express are built on top of exactly this module.

**How it works**

1. \`http.createServer\` takes a request handler — a function called once per incoming request with \`req\` (the incoming message) and \`res\` (the object you use to send a response back).
2. Every response needs \`res.end()\` called eventually, or the client's connection hangs waiting for a body that never arrives.
3. \`res.writeHead\` sets the status code and headers *before* any body is written — headers can't be changed once the first chunk of the body has been sent.
4. Routing is manual here: \`req.url\` and \`req.method\` are just plain strings, so a simple \`if\`/\`else\` chain is enough to route a handful of endpoints without pulling in a router library.
5. \`server.listen(port)\` starts accepting connections on that port — the process stays alive as long as the server is listening.

This is worth understanding even if you always reach for Express, since it demystifies what a "web framework" is actually doing underneath.`,
    code: `const http = require("http");

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Hello from Node!" }));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});`,
    preview: {
      type: "text",
      output: `$ node server.js
Server running at http://localhost:3000

$ curl http://localhost:3000/
{"message":"Hello from Node!"}

$ curl http://localhost:3000/unknown
{"error":"Not found"}`,
      note: "This starts a real server process, so the preview shows the terminal output of running it and hitting it with curl rather than executing it in the browser.",
    },
  },
  {
    id: "express-async-route",
    title: "Async Error Handling in Express",
    language: "node",
    tags: ["express", "middleware", "error-handling"],
    difficulty: "Intermediate",
    description: "Handle async errors in an Express route correctly, so a rejected promise doesn't crash the process or hang the request.",
    explanation: `Express route handlers that use \`async\`/\`await\` have a sharp edge: if the returned promise rejects, Express 4 doesn't catch it automatically — the request just hangs, and the error is silently swallowed.

**How it works**

1. \`asyncHandler\` wraps a route function and returns a new function with the same \`(req, res, next)\` signature that Express expects.
2. Inside, it calls the original \`fn\` and immediately calls \`.catch(next)\` on the returned promise — \`next\` is Express's own mechanism for forwarding an error to its error-handling middleware.
3. Because \`.catch(next)\` is attached to every call, any rejection anywhere inside the async route — a failed database query, a thrown error, a failed \`await\` — gets funneled to \`next(err)\` instead of disappearing.
4. The error-handling middleware, the one with four parameters \`(err, req, res, next)\`, is Express's designated catch-all — it runs whenever \`next\` is called with a value, and is the right place to log the error and send a proper error response.

Express 5 fixes this automatically for async handlers, but a huge amount of code still runs on Express 4, where this wrapper (or an equivalent library like \`express-async-errors\`) is effectively required for async routes to fail safely.`,
    code: `function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

app.get(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const user = await db.users.findById(req.params.id);
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    res.json(user);
  })
);

// Catches whatever asyncHandler forwards via next(err)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message });
});`,
    preview: {
      type: "text",
      output: `$ curl http://localhost:3000/users/42
{"id":42,"name":"Ada Lovelace"}

$ curl http://localhost:3000/users/999
{"error":"User not found"}
# server log: 404 GET /users/999

$ curl http://localhost:3000/users/abc
{"error":"Cast to ObjectId failed for value \\"abc\\""}
# server log: 500 GET /users/abc — error forwarded by asyncHandler instead of hanging`,
      note: "This runs inside a real Express process, so the preview shows example request/response pairs rather than executing it in the browser.",
    },
  },
  {
    id: "env-config-loader",
    title: "Environment Config Loader",
    language: "node",
    tags: ["configuration", "environment", "validation"],
    difficulty: "Beginner",
    description: "Load and validate environment variables once at startup, so a missing config value fails fast instead of crashing deep inside the app later.",
    explanation: `Reading \`process.env.SOMETHING\` directly, scattered across a codebase, means a typo'd variable name or a missing \`.env\` entry silently becomes \`undefined\` and only breaks something much later — often in production.

**How it works**

1. All expected environment variables are declared once, in one place, with a required flag and an optional default value.
2. The loader iterates over that declaration, pulling each value from \`process.env\`.
3. If a variable is marked \`required\` and missing, it's collected into an \`errors\` array instead of immediately throwing — this way, running the app once tells you about *every* missing variable, not just the first one it happens to hit.
4. If \`errors\` isn't empty after checking everything, the process exits immediately with a clear message — failing at startup, obviously, is far better than failing three requests deep into real traffic.
5. The returned \`config\` object gives the rest of the app validated access — e.g. \`config.port\` instead of \`Number(process.env.PORT) || 3000\` repeated everywhere.

This "validate everything at boot" pattern turns an entire category of production incidents into a startup crash you catch in the first five seconds of \`npm start\`.`,
    code: `function loadConfig(schema) {
  const config = {};
  const errors = [];

  for (const [key, { required, default: fallback }] of Object.entries(schema)) {
    const value = process.env[key] ?? fallback;

    if (required && value === undefined) {
      errors.push(\`Missing required environment variable: \${key}\`);
      continue;
    }

    config[key] = value;
  }

  if (errors.length > 0) {
    console.error("Invalid configuration:\\n" + errors.join("\\n"));
    process.exit(1);
  }

  return config;
}

const config = loadConfig({
  PORT: { required: false, default: 3000 },
  DATABASE_URL: { required: true },
  NODE_ENV: { required: false, default: "development" },
});`,
    preview: {
      type: "text",
      output: `$ DATABASE_URL=postgres://localhost/app node server.js
# config loaded: { PORT: 3000, DATABASE_URL: "postgres://localhost/app", NODE_ENV: "development" }
Server started on port 3000

$ node server.js
Invalid configuration:
Missing required environment variable: DATABASE_URL
# process exits with code 1 — never even attempts to start`,
      note: "This validates real process.env values at startup, so the preview shows two example runs rather than executing it in the browser.",
    },
  },
  {
    id: "json-file-store",
    title: "Tiny JSON File Store",
    language: "node",
    tags: ["filesystem", "async", "persistence"],
    difficulty: "Intermediate",
    description: "A tiny file-backed JSON store using the fs/promises API — good enough for local tooling, seed scripts, or small side projects.",
    explanation: `For something too small to justify a real database, a single JSON file plus a thin read/write wrapper is often all you need.

**How it works**

1. \`read()\` uses \`fs.readFile\` with the \`"utf-8"\` encoding so it returns a string directly rather than a \`Buffer\`, then \`JSON.parse\`s it into a plain JS value.
2. If the file doesn't exist yet, \`readFile\` rejects with an error whose \`code\` is \`"ENOENT"\` — that specific case is caught and treated as "start from an empty array" rather than a real failure, so the store works correctly on its very first run.
3. \`write()\` calls \`JSON.stringify\` with indentation (\`null, 2\`) purely so the file stays human-readable if you open it directly — this doesn't affect how it's read back.
4. Both functions are \`async\` and use \`fs/promises\` rather than the callback-based \`fs\` API, so calling code can just \`await\` them like any other asynchronous operation.
5. Because every read re-parses the whole file and every write rewrites the whole thing, this pattern only scales to small, infrequently-updated datasets — it's a stopgap, not a database replacement.`,
    code: `import { readFile, writeFile } from "node:fs/promises";

const FILE = "./data.json";

async function read() {
  try {
    const raw = await readFile(FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

async function write(data) {
  await writeFile(FILE, JSON.stringify(data, null, 2));
}

// Usage
const items = await read();
items.push({ id: Date.now(), text: "Buy milk" });
await write(items);`,
    preview: {
      type: "text",
      output: `$ cat data.json
cat: data.json: No such file or directory

$ node add-item.mjs "Buy milk"
# read() catches ENOENT, starts from []
# write() creates data.json

$ cat data.json
[
  {
    "id": 1717000000000,
    "text": "Buy milk"
  }
]`,
      note: "This reads and writes a real file on disk, so the preview shows an example terminal session rather than executing it in the browser.",
    },
  },
  {
    id: "tailwind-responsive-grid",
    title: "Responsive Grid",
    language: "tailwind",
    tags: ["layout", "grid", "responsive"],
    difficulty: "Beginner",
    description: "Build a grid that adds columns at each breakpoint using Tailwind's responsive grid-cols utilities — no custom CSS at all.",
    explanation: `Tailwind's responsive prefixes (\`sm:\`, \`md:\`, \`lg:\`, …) apply a utility only once the viewport is at least that breakpoint's width, letting you describe an entire responsive layout directly in your markup.

**How it works**

1. \`grid grid-cols-1\` sets the base case — a single column — which applies at all screen sizes unless a breakpoint prefix overrides it.
2. \`sm:grid-cols-2\` overrides that to 2 columns once the viewport is ≥640px, and \`lg:grid-cols-4\` bumps it to 4 columns at ≥1024px — each breakpoint prefix only kicks in at its own width and above, since Tailwind's breakpoints are mobile-first (\`min-width\` based).
3. \`gap-4\` adds consistent spacing between grid items in both directions — equivalent to \`gap: 1rem\`.
4. Because every utility maps to a single, well-known CSS rule, there's no custom stylesheet to maintain — the entire responsive behavior is visible right there in the class list.

This is the Tailwind-idiomatic replacement for hand-written \`@media\` queries: the breakpoints live next to the markup they affect instead of in a separate CSS file.`,
    code: `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <div class="rounded-xl bg-indigo-500 p-6 text-white">1</div>
  <div class="rounded-xl bg-rose-500 p-6 text-white">2</div>
  <div class="rounded-xl bg-teal-500 p-6 text-white">3</div>
  <div class="rounded-xl bg-amber-500 p-6 text-white">4</div>
</div>`,
    preview: {
      type: "html",
      height: 220,
      resizable: true,
      markup: `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
  <div class="rounded-xl bg-indigo-500 p-6 text-center font-semibold text-white">1</div>
  <div class="rounded-xl bg-rose-500 p-6 text-center font-semibold text-white">2</div>
  <div class="rounded-xl bg-teal-500 p-6 text-center font-semibold text-white">3</div>
  <div class="rounded-xl bg-amber-500 p-6 text-center font-semibold text-white">4</div>
</div>`,
    },
  },
  {
    id: "tailwind-flex-center",
    title: "Perfect Centering",
    language: "tailwind",
    tags: ["layout", "flexbox"],
    difficulty: "Beginner",
    description: "Center anything, both ways, using Tailwind's flex utilities instead of hand-written CSS.",
    explanation: `This is the Tailwind translation of the classic \`display:flex; justify-content:center; align-items:center;\` centering trick — same mechanism, expressed as utility classes instead of custom CSS.

**How it works**

1. \`flex\` applies \`display: flex\` to the container, turning on flexbox layout for its direct children.
2. \`justify-center\` centers children along the main axis (horizontal, by default) — Tailwind's utility for \`justify-content: center\`.
3. \`items-center\` centers children along the cross axis (vertical, by default) — Tailwind's utility for \`align-items: center\`.
4. \`h-64\` gives the container something to center *within*, exactly like \`min-height\` in the plain-CSS version — without a height, there's no vertical space to distribute.

Because these are just utility classes, there's zero separate stylesheet to write or maintain — the layout logic lives entirely in the markup.`,
    code: `<div class="flex h-64 items-center justify-center rounded-xl bg-indigo-50">
  <div class="rounded-xl bg-indigo-600 px-8 py-6 font-semibold text-white shadow-lg">
    🎯 Centered, no matter what
  </div>
</div>`,
    preview: {
      type: "html",
      height: 220,
      markup: `<div class="flex h-56 items-center justify-center rounded-xl bg-indigo-50">
  <div class="rounded-xl bg-indigo-600 px-8 py-6 text-center font-semibold text-white shadow-lg">
    🎯 Centered, no matter what
  </div>
</div>`,
    },
  },
  {
    id: "tailwind-dark-mode-toggle",
    title: "Dark Mode Toggle",
    language: "tailwind",
    tags: ["dark-mode", "theming", "interactive"],
    difficulty: "Intermediate",
    description: "Flip an entire section between light and dark using Tailwind's class-based dark mode strategy and one small script.",
    explanation: `Tailwind ships every utility with an optional \`dark:\` variant. Setting \`darkMode: "class"\` switches it to a manual strategy: dark styles only apply when a \`dark\` class is present on an ancestor, usually \`<html>\`, which you control with a few lines of JS.

**How it works**

1. Every element that should change appearance gets both its light-mode utility (e.g. \`bg-white\`) and its dark-mode counterpart (e.g. \`dark:bg-slate-900\`) — Tailwind compiles the \`dark:\` variant into a rule scoped under \`.dark\`.
2. With \`darkMode: "class"\` configured, none of those \`dark:\` rules apply until something adds the literal class \`dark\` to an ancestor element — normally \`document.documentElement\`.
3. A toggle button's click handler does exactly that: \`classList.toggle("dark")\` flips the class on and off, and because CSS re-evaluates instantly, every \`dark:\`-prefixed utility on the page updates in one paint — no manual style changes needed anywhere else.
4. This is the same fundamental idea as swapping CSS custom properties for theming — one small state change cascades everywhere, just expressed through Tailwind's variant system instead of \`var(--token)\`.

Persisting the choice so it survives a reload just means saving \`"dark"\` or \`"light"\` to \`localStorage\` and re-applying the class on page load — the toggle logic itself stays the same.`,
    code: `<html class="">
  <body class="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
    <button id="theme-toggle" class="rounded-full bg-indigo-600 px-4 py-2 text-white dark:bg-indigo-400">
      Toggle theme
    </button>
  </body>
</html>

<script>
  document.getElementById("theme-toggle").addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
  });
</script>`,
    preview: {
      type: "html",
      height: 200,
      tailwindConfig: "{ darkMode: 'class' }",
      markup: `<div class="flex flex-col items-center gap-4 rounded-xl bg-white p-8 text-slate-900 transition-colors dark:bg-slate-900 dark:text-white">
  <p>This box reads Tailwind's <code class="rounded bg-slate-100 px-1 dark:bg-slate-700">dark:</code> variant.</p>
  <button id="theme-toggle" class="rounded-full bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700 dark:bg-indigo-400 dark:text-slate-900">
    Toggle theme
  </button>
</div>
<script>
  document.getElementById("theme-toggle").addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
  });
<\/script>`,
    },
  },
  {
    id: "tailwind-button-states",
    title: "Interactive Button States",
    language: "tailwind",
    tags: ["interactivity", "transitions", "buttons"],
    difficulty: "Beginner",
    description: "Style hover, focus, and active states — plus a smooth transition — entirely with Tailwind utility classes.",
    explanation: `Interactive states that would normally need separate \`:hover\`, \`:focus\`, and \`:active\` CSS rules are each just a variant prefix on the exact same class in Tailwind.

**How it works**

1. \`bg-indigo-600\` sets the resting background; \`hover:bg-indigo-700\` swaps it for a slightly darker shade the moment the pointer is over the button — Tailwind compiles this to a normal \`:hover\` rule scoped to that utility.
2. \`focus:ring-4 focus:ring-indigo-300\` adds a visible focus ring, critical for keyboard users tabbing through the page, only while the element has keyboard or programmatic focus.
3. \`active:scale-95\` shrinks the button slightly the instant it's pressed, giving tactile feedback that the click registered — it's cleared automatically the moment the mouse button or tap releases.
4. \`transition\` (short for \`transition-property: all\` plus sensible default duration and timing) makes all of the above animate smoothly between states instead of snapping instantly, without writing a single \`@keyframes\` or \`transition:\` rule by hand.

Stacking all four together on one element is idiomatic Tailwind: every interactive state lives right next to the base style, instead of being split across separate CSS selectors.`,
    code: `<button
  class="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white
         transition hover:bg-indigo-700
         focus:outline-none focus:ring-4 focus:ring-indigo-300
         active:scale-95"
>
  Click me
</button>`,
    preview: {
      type: "html",
      height: 160,
      markup: `<div class="flex items-center justify-center p-10">
  <button class="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 active:scale-95">
    Click me
  </button>
</div>`,
    },
  },
  {
    id: "curve-page-transition",
    title: "Curve Page Transition",
    language: "javascript",
    tags: ["animation", "svg", "transitions", "requestanimationframe"],
    difficulty: "Advanced",
    description: "A colored SVG panel with a curved leading edge sweeps over the page, swaps the content while it's fully hidden, then sweeps away again — a framework-free take on the 'wipe' route transitions popular on portfolio sites.",
    explanation: `A single SVG \`<path>\` is redrawn on every animation frame to sweep a colored panel across the screen, covering the page just long enough to swap its content, then sweeping away again to reveal it.

**How it works**

1. \`buildPanelPath\` computes a fresh \`d\` string every frame — a rectangle down to \`height - bulge\`, capped with one quadratic curve (\`Q\`) that bulges back up to the same height on the far side. That single curve is the panel's "wave" edge; when \`bulge\` is \`0\` it collapses into a flat, straight line.
2. \`animate("in")\` and \`animate("out")\` both drive the same \`requestAnimationFrame\` loop, just moving \`travel\` — how far down the panel currently reaches — in opposite directions: \`0 → height\` to cover the screen, \`height → 0\` to reveal it again.
3. \`bulge\` is driven by \`Math.sin(eased * Math.PI)\`, which starts at \`0\`, peaks exactly at the animation's midpoint, and returns to \`0\` by the end — so the curve appears while the panel is mid-motion and disappears the instant it settles, on both the way in and the way out.
4. \`easeInOutCubic\` shapes the raw linear progress (\`0\` to \`1\`) into a slow-fast-slow curve before it's used for anything, which is what keeps the sweep from feeling mechanical.
5. \`curveTransition(...).run(swapContent)\` chains the two phases around a real DOM mutation: cover completely, run \`swapContent()\` while nothing is visible, then reveal — the viewer never actually sees the underlying content change.

Because it's just path math driven by \`requestAnimationFrame\`, this works in any vanilla project with zero dependencies, and doesn't rely on any framework's mount/unmount lifecycle to know when to animate.`,
    code: `function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
}

function buildPanelPath(width, height, bulge) {
  // The bottom edge bulges downward by \`bulge\` px at the midpoint,
  // and flattens into a straight line as \`bulge\` approaches 0.
  return \`M0,0 L\${width},0 L\${width},\${height - bulge} Q\${width / 2},\${height + bulge} 0,\${height - bulge} Z\`;
}

function curveTransition({ container, color = "#4f46e5", duration = 650 } = {}) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("fill", color);
  svg.appendChild(path);
  container.appendChild(svg);

  function animate(direction) {
    // "in"  -> panel grows to cover the container (0 -> full height)
    // "out" -> panel shrinks away, revealing new content (full -> 0)
    return new Promise((resolve) => {
      const start = performance.now();
      const { width, height } = container.getBoundingClientRect();

      function frame(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = easeInOutCubic(t);
        const travel = direction === "in" ? eased * height : (1 - eased) * height;
        const bulge = Math.sin(eased * Math.PI) * (height * 0.08);

        path.setAttribute("d", buildPanelPath(width, travel, bulge));
        t < 1 ? requestAnimationFrame(frame) : resolve();
      }

      requestAnimationFrame(frame);
    });
  }

  return {
    async run(swapContent) {
      await animate("in");  // cover the container
      swapContent();         // swap the DOM while it's fully hidden
      await animate("out"); // reveal the new content
      svg.remove();
    },
  };
}

// Usage
const transition = curveTransition({ container: document.getElementById("app") });

link.addEventListener("click", (e) => {
  e.preventDefault();
  transition.run(() => {
    document.getElementById("app").innerHTML = renderNextPage();
  });
});`,
    preview: {
      type: "html",
      height: 340,
      markup: `<div class="relative mx-auto h-64 w-full max-w-sm overflow-hidden rounded-xl bg-slate-100" id="stage">
  <div class="absolute inset-0 flex items-center justify-center bg-indigo-50 text-indigo-900" id="pageA">
    <p class="text-lg font-semibold">Page A</p>
  </div>
  <div class="absolute inset-0 hidden items-center justify-center bg-amber-50 text-amber-900" id="pageB">
    <p class="text-lg font-semibold">Page B</p>
  </div>
</div>
<div class="mt-4 flex justify-center">
  <button id="go" class="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">Go to Page B</button>
</div>
<script>
  function easeInOutCubic(t) { return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2; }

  function buildPanelPath(width, height, bulge) {
    return "M0,0 L" + width + ",0 L" + width + "," + (height - bulge) +
      " Q" + (width / 2) + "," + (height + bulge) + " 0," + (height - bulge) + " Z";
  }

  const stage = document.getElementById("stage");
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("class", "pointer-events-none absolute inset-0 h-full w-full");
  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("fill", "#4f46e5");
  svg.appendChild(path);
  stage.appendChild(svg);

  function animate(direction) {
    return new Promise((resolve) => {
      const start = performance.now();
      const duration = 550;
      const rect = stage.getBoundingClientRect();

      function frame(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = easeInOutCubic(t);
        const travel = direction === "in" ? eased * rect.height : (1 - eased) * rect.height;
        const bulge = Math.sin(eased * Math.PI) * (rect.height * 0.08);
        path.setAttribute("d", buildPanelPath(rect.width, travel, bulge));
        if (t < 1) requestAnimationFrame(frame); else resolve();
      }

      requestAnimationFrame(frame);
    });
  }

  let showingB = false;
  document.getElementById("go").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    await animate("in");
    showingB = !showingB;
    document.getElementById("pageA").classList.toggle("hidden", showingB);
    document.getElementById("pageA").classList.toggle("flex", !showingB);
    document.getElementById("pageB").classList.toggle("hidden", !showingB);
    document.getElementById("pageB").classList.toggle("flex", showingB);
    btn.textContent = showingB ? "Back to Page A" : "Go to Page B";
    await animate("out");
    btn.disabled = false;
  });
<\/script>`,
    },
  },
  {
    id: "inner-page-transition",
    title: "Slide-Cover Page Transition",
    language: "javascript",
    tags: ["animation", "css-transitions", "transitions"],
    difficulty: "Intermediate",
    description: "Slide a panel up to cover the outgoing page while it shrinks back in perspective, swap the content underneath, then slide the panel away to reveal it — pure CSS transitions orchestrated by a few lines of JS.",
    explanation: `Two CSS classes describe the two visual states this transition moves between, and a small JS function toggles them with the right timing — no animation library required.

**How it works**

1. \`ensureStyles\` injects one \`<style>\` tag with the CSS this transition needs, only once — the same trick a small vanilla-JS library would use to ship its own styles without a separate stylesheet.
2. Adding \`is-leaving\` to the content triggers its own CSS transition: it scales down slightly and moves up a bit, reading as the page being pushed back in space. Adding \`is-covering\` to the panel slides it from fully below the viewport (\`translateY(100%)\`) up to its resting position, covering everything.
3. Both transitions share the same \`duration\` and easing curve, so a plain \`setTimeout(fn, duration)\` is a reliable enough stand-in for "wait until both animations finish" without wiring up two separate \`transitionend\` listeners.
4. The moment that timeout fires, the panel is fully covering the screen — that's exactly when \`swapContent()\` runs and \`is-leaving\` is removed, so the *next* page is sitting there, already back at its resting scale and position, just hidden behind the panel.
5. Removing \`is-covering\` on the following frame — via \`requestAnimationFrame\`, so the browser gets a chance to paint the reset content first — starts the panel's exit transition, sliding it back down and revealing the new page underneath.

This is a reusable template for any "cover, swap, reveal" transition: two CSS classes for the visual states, and one small function that toggles them with the right timing in between.`,
    code: `const STYLE_ID = "inner-transition-styles";

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = \`
    .page-content {
      transition: transform 0.6s cubic-bezier(0.76, 0, 0.24, 1), opacity 0.6s ease;
    }
    .page-content.is-leaving {
      transform: translateY(-40px) scale(0.94);
      opacity: 0.6;
    }
    .cover-panel {
      position: absolute;
      inset: 0;
      transform: translateY(100%);
      transition: transform 0.6s cubic-bezier(0.76, 0, 0.24, 1);
    }
    .cover-panel.is-covering {
      transform: translateY(0);
    }
  \`;
  document.head.appendChild(style);
}

function innerTransition({ panel, content, swapContent, duration = 600 }) {
  ensureStyles();

  return new Promise((resolve) => {
    // 1. push the outgoing content back and slide the cover panel up
    content.classList.add("is-leaving");
    panel.classList.add("is-covering");

    setTimeout(() => {
      // 2. content is now fully hidden behind the panel — swap it instantly
      swapContent();
      content.classList.remove("is-leaving");

      // 3. slide the panel back down, revealing the new content underneath
      requestAnimationFrame(() => panel.classList.remove("is-covering"));
      setTimeout(resolve, duration);
    }, duration);
  });
}

// Usage
const panel = document.querySelector(".cover-panel");
const content = document.querySelector(".page-content");

link.addEventListener("click", (e) => {
  e.preventDefault();
  innerTransition({
    panel,
    content,
    swapContent: () => {
      content.innerHTML = renderNextPage();
    },
  });
});`,
    preview: {
      type: "html",
      height: 340,
      markup: `<div class="relative mx-auto h-64 w-full max-w-sm overflow-hidden rounded-xl bg-slate-100">
  <div class="page-content flex h-full w-full items-center justify-center bg-indigo-50 text-indigo-900" id="content">
    <p class="text-lg font-semibold" id="label">Page A</p>
  </div>
  <div class="cover-panel bg-slate-900"></div>
</div>
<div class="mt-4 flex justify-center">
  <button id="go" class="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">Go to Page B</button>
</div>
<style>
  .page-content { transition: transform .6s cubic-bezier(.76,0,.24,1), opacity .6s ease; }
  .page-content.is-leaving { transform: translateY(-24px) scale(.94); opacity: .6; }
  .cover-panel { position: absolute; inset: 0; transform: translateY(100%); transition: transform .6s cubic-bezier(.76,0,.24,1); }
  .cover-panel.is-covering { transform: translateY(0); }
</style>
<script>
  let showingB = false;
  const content = document.getElementById("content");
  const label = document.getElementById("label");
  const panel = document.querySelector(".cover-panel");
  const btn = document.getElementById("go");

  function innerTransition(swapContent, duration) {
    return new Promise((resolve) => {
      content.classList.add("is-leaving");
      panel.classList.add("is-covering");
      setTimeout(() => {
        swapContent();
        content.classList.remove("is-leaving");
        requestAnimationFrame(() => panel.classList.remove("is-covering"));
        setTimeout(resolve, duration);
      }, duration);
    });
  }

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    await innerTransition(() => {
      showingB = !showingB;
      label.textContent = showingB ? "Page B" : "Page A";
      content.classList.toggle("bg-indigo-50", !showingB);
      content.classList.toggle("text-indigo-900", !showingB);
      content.classList.toggle("bg-amber-50", showingB);
      content.classList.toggle("text-amber-900", showingB);
      btn.textContent = showingB ? "Back to Page A" : "Go to Page B";
    }, 550);
    btn.disabled = false;
  });
<\/script>`,
    },
  },
  {
    id: "hover-carousel-nav-link",
    title: "Hover Carousel Nav Link",
    language: "javascript",
    tags: ["animation", "navigation", "hover-effects", "dom"],
    difficulty: "Intermediate",
    description: "Turn any nav link into a two-line 'carousel' that rolls a duplicate label in on hover, with a dot-to-bar underline animating underneath — wire up an entire nav bar with one function call per link.",
    explanation: `A common portfolio-site nav effect: hovering a link makes its label appear to scroll away while an identical copy scrolls in from the opposite edge, with a thin underline growing in from a centered dot. Building this by hand normally means duplicating markup per link — this version does it for you from a single function call.

**How it works**

1. \`initHoverCarouselLink\` takes a plain link element, remembers its existing content, then rebuilds the link's \`innerHTML\` around a small internal structure: a clipped \`.hc-viewport\`, a \`.hc-track\` holding two identical copies of that content stacked along the chosen \`direction\`, and an \`.hc-underline\` span.
2. Stacking two copies inside a track that's twice the viewport's size, then clipping the viewport with \`overflow: hidden\`, is what makes the "carousel" illusion possible — only one copy is ever visible at a time, and sliding the track by exactly half its own size swaps which copy shows.
3. On \`pointerenter\`, the track's \`transform\` moves to \`translateY(-50%)\` (or \`translateX(-50%)\` for direction \`"x"\`) — a CSS \`transition\` on \`transform\` animates that shift smoothly, sliding the first copy out one edge exactly as the second, identical copy slides in from the other.
4. \`pointerleave\` simply clears the inline transform, snapping back to the resting position — because both copies are identical, that instant reset is invisible to the eye, so the *next* hover always starts clean.
5. The underline is a separate span whose \`is-active\` class toggles several properties at once — \`width\`, \`height\`, \`border-radius\`, \`left\`, and \`opacity\` — each with its own CSS transition, so a small centered dot smoothly grows into a full-width bar and fades in on hover, then reverses back to a dot on hover-out.
6. Touch devices have no \`pointerenter\`/\`pointerleave\` to speak of, so \`initHoverCarouselLink\` checks \`matchMedia("(hover: none)")\` once and switches strategy entirely: the *first* tap calls \`preventDefault()\` and just plays the hover animation, "priming" the link; a *second* tap on that same link lets the click go through as a real navigation. Tapping anywhere else resets whichever link was primed back to its resting state first.

Because everything is scoped through a handful of \`hc-*\` classes and one initializer function, wiring this into a whole nav bar is a one-liner per link — no markup duplication required at the call site.`,
    code: `const STYLE_ID = "hover-carousel-link-styles";

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = \`
    .hc-link { position: relative; display: inline-flex; cursor: pointer; }
    .hc-viewport { overflow: hidden; display: inline-block; height: 1.25em; line-height: 1.25em; }
    .hc-track {
      display: flex;
      height: 200%;
      transition: transform 0.4s cubic-bezier(0.65, 0, 0.35, 1);
    }
    .hc-track--y { flex-direction: column; }
    .hc-track--x { flex-direction: row; width: 200%; height: 100%; }
    .hc-copy { display: flex; flex: 1 0 50%; align-items: center; justify-content: center; }

    .hc-underline {
      position: absolute;
      left: 50%;
      bottom: -6px;
      width: 4px;
      height: 4px;
      border-radius: 999px;
      opacity: 0;
      transform: translateX(-50%);
      transition:
        width 0.25s cubic-bezier(0.6, 0.05, 0.15, 0.95),
        height 0.25s ease,
        border-radius 0.25s ease,
        left 0.25s ease,
        opacity 0.25s ease;
    }
    .hc-underline.is-active {
      left: 0;
      width: 100%;
      height: 2px;
      border-radius: 0;
      opacity: 1;
      transform: translateX(0);
    }
  \`;
  document.head.appendChild(style);
}

function initHoverCarouselLink(link, { direction = "y", color = "currentColor" } = {}) {
  ensureStyles();

  const original = link.innerHTML;
  link.classList.add("hc-link");
  link.innerHTML = \`
    <span class="hc-viewport">
      <span class="hc-track hc-track--\${direction}">
        <span class="hc-copy">\${original}</span>
        <span class="hc-copy">\${original}</span>
      </span>
    </span>
    <span class="hc-underline" style="background:\${color}"></span>
  \`;

  const track = link.querySelector(".hc-track");
  const underline = link.querySelector(".hc-underline");
  const shift = direction === "y" ? "translateY(-50%)" : "translateX(-50%)";

  const enter = () => {
    track.style.transform = shift;
    underline.classList.add("is-active");
  };
  const leave = () => {
    track.style.transform = "";
    underline.classList.remove("is-active");
  };

  if (window.matchMedia("(hover: none)").matches) {
    // No real hover on touch: the first tap previews the effect, a second
    // tap on the same link lets the click through as a real navigation.
    let isPrimed = false;

    link.addEventListener("click", (e) => {
      if (!isPrimed) {
        e.preventDefault();
        enter();
        isPrimed = true;
      } else {
        leave();
        isPrimed = false;
      }
    });

    document.addEventListener("click", (e) => {
      if (isPrimed && !link.contains(e.target)) {
        leave();
        isPrimed = false;
      }
    });
  } else {
    link.addEventListener("pointerenter", enter);
    link.addEventListener("pointerleave", leave);
  }
}

// Usage — wire up every link in a nav bar in one line
document.querySelectorAll("nav a").forEach((link) => {
  initHoverCarouselLink(link, { direction: "y", color: "#4f46e5" });
});`,
    preview: {
      type: "html",
      height: 150,
      markup: `<nav class="flex items-center justify-center gap-8 p-10" id="demoNav">
  <a href="#" class="text-sm font-semibold text-slate-800">Home</a>
  <a href="#" class="text-sm font-semibold text-slate-800">Work</a>
  <a href="#" class="text-sm font-semibold text-slate-800">Contact</a>
</nav>
<script>
  function ensureStyles() {
    if (document.getElementById("hc-styles")) return;
    var style = document.createElement("style");
    style.id = "hc-styles";
    style.textContent =
      ".hc-link { position: relative; display: inline-flex; cursor: pointer; }" +
      ".hc-viewport { overflow: hidden; display: inline-block; height: 1.25em; line-height: 1.25em; }" +
      ".hc-track { display: flex; flex-direction: column; height: 200%; transition: transform 0.4s cubic-bezier(0.65,0,0.35,1); }" +
      ".hc-copy { display: flex; flex: 1 0 50%; align-items: center; justify-content: center; }" +
      ".hc-underline { position: absolute; left: 50%; bottom: -6px; width: 4px; height: 4px; border-radius: 999px; opacity: 0; transform: translateX(-50%); transition: width .25s cubic-bezier(.6,.05,.15,.95), height .25s ease, border-radius .25s ease, left .25s ease, opacity .25s ease; }" +
      ".hc-underline.is-active { left: 0; width: 100%; height: 2px; border-radius: 0; opacity: 1; transform: translateX(0); }";
    document.head.appendChild(style);
  }

  function initHoverCarouselLink(link, color) {
    ensureStyles();
    var original = link.innerHTML;
    link.classList.add("hc-link");
    link.innerHTML =
      '<span class="hc-viewport"><span class="hc-track">' +
      '<span class="hc-copy">' + original + '</span>' +
      '<span class="hc-copy">' + original + '</span>' +
      '</span></span>' +
      '<span class="hc-underline" style="background:' + color + '"></span>';

    var track = link.querySelector(".hc-track");
    var underline = link.querySelector(".hc-underline");

    function enter() {
      track.style.transform = "translateY(-50%)";
      underline.classList.add("is-active");
    }
    function leave() {
      track.style.transform = "";
      underline.classList.remove("is-active");
    }

    if (window.matchMedia("(hover: none)").matches) {
      var isPrimed = false;
      link.addEventListener("click", function (e) {
        if (!isPrimed) {
          e.preventDefault();
          enter();
          isPrimed = true;
        } else {
          leave();
          isPrimed = false;
        }
      });
      document.addEventListener("click", function (e) {
        if (isPrimed && !link.contains(e.target)) {
          leave();
          isPrimed = false;
        }
      });
    } else {
      link.addEventListener("pointerenter", enter);
      link.addEventListener("pointerleave", leave);
    }
  }

  document.querySelectorAll("#demoNav a").forEach(function (link) {
    initHoverCarouselLink(link, "#4f46e5");
  });
<\/script>`,
    },
  },
  {
    id: "hover-teaser-side-menu",
    title: "Side Menu with Hover Image Teasers",
    language: "javascript",
    tags: ["animation", "navigation", "hover-effects", "menu"],
    difficulty: "Advanced",
    description: "A side-menu nav where hovering a link slides a full-size themed panel out from behind the menu — a preview of where that link leads before you click it.",
    explanation: `A side-menu list where hovering a link slides a differently colored (or photographed) panel out from behind the menu — a subtle way to preview what each link leads to before you click it.

**How it works**

1. \`initHoverTeaserMenu\` builds the whole menu from a \`links\` array in one pass: a stack of \`.htm-teaser\` panels — one per link, each exactly as wide as the nav itself and resting fully *behind* it at \`translateX(0%)\` — plus a \`<nav>\` of \`.htm-link\` anchors rendered on top.
2. Giving \`.htm-nav\` and \`.htm-teaser\` the same \`width: 50%\` is what makes the trick reliable: every teaser is perfectly hidden behind the nav at rest (same footprint, nav painted in front), and sliding one out by exactly \`translateX(100%)\` — its own full width — lands it precisely in the empty half of the container beside the nav, with no gap and no overlap.
3. Each teaser panel and its matching link share the same id via \`data-teaser\`/\`data-link\`, so a hover handler can look up the *one* panel that belongs to the link being hovered — \`container.querySelector('[data-teaser="\${id}"]')\` — instead of tracking "which link is active" as separate state the way a framework component normally would.
4. The small \`.htm-dot\` next to the hovered link fades in and nudges sideways using the exact same transition timing as the teaser panel, so both movements read as one connected animation rather than two separate effects.
5. \`pointerleave\` removes \`is-active\` from both — because the transition lives on the base \`.htm-teaser\`/\`.htm-dot\` classes rather than only the \`.is-active\` variant, the panel slides back behind the nav with the same eased motion it came out with.
6. On touch devices — detected once via \`matchMedia("(hover: none)")\` — there's no hover to drive any of this, so each link's \`click\` is intercepted instead: the first tap calls \`preventDefault()\` and just reveals that link's teaser, "priming" it; a second tap on the same (already-primed) link lets the click through as a real navigation. A single \`primedLink\` variable shared across the whole menu makes sure tapping a different link — or tapping anywhere outside the menu — resets whichever one was previously primed first.

Everything the component needs — layout included — lives in the one injected stylesheet, so it has no dependency on Tailwind or any other framework being present. Swap the \`color\` field for a \`backgroundImage\` per link (and use \`background-image: url(...)\` instead of the inline \`background:\`) to reveal real photos instead of solid color panels — the mechanism doesn't change at all.`,
    code: `const STYLE_ID = "hover-teaser-menu-styles";

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = \`
    .htm-menu { position: relative; overflow: hidden; }
    .htm-teaser-layer { position: absolute; inset: 0; z-index: 0; overflow: hidden; }

    .htm-teaser {
      position: absolute;
      top: 0;
      left: 0;
      width: 50%;
      height: 100%;
      transform: translateX(0%);
      transition: transform 0.5s cubic-bezier(0.65, 0, 0.35, 1);
    }
    .htm-teaser.is-active { transform: translateX(100%); }

    .htm-nav {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 1rem;
      width: 50%;
      height: 100%;
    }
    .htm-link { position: relative; display: flex; align-items: center; gap: 0.5rem; }
    .htm-dot {
      width: 6px;
      height: 6px;
      border-radius: 999px;
      background: currentColor;
      opacity: 0;
      transform: translateX(0);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    .htm-link.is-active .htm-dot { opacity: 0.6; transform: translateX(10px); }
  \`;
  document.head.appendChild(style);
}

function initHoverTeaserMenu(container, links) {
  ensureStyles();
  container.classList.add("htm-menu");

  container.innerHTML = \`
    <div class="htm-teaser-layer">
      \${links.map((l) => \`<div class="htm-teaser" data-teaser="\${l.id}" style="background:\${l.color}"></div>\`).join("")}
    </div>
    <nav class="htm-nav">
      \${links
        .map(
          (l) => \`
        <a href="\${l.href}" class="htm-link" data-link="\${l.id}">
          <span>\${l.label}</span>
          <span class="htm-dot"></span>
        </a>\`
        )
        .join("")}
    </nav>
  \`;

  const isTouchDevice = window.matchMedia("(hover: none)").matches;
  let primed = null; // { link, leave } of whichever link is currently tap-primed

  container.querySelectorAll("[data-link]").forEach((link) => {
    const id = link.dataset.link;
    const teaser = container.querySelector(\`[data-teaser="\${id}"]\`);

    const enter = () => {
      link.classList.add("is-active");
      teaser.classList.add("is-active");
    };
    const leave = () => {
      link.classList.remove("is-active");
      teaser.classList.remove("is-active");
    };

    if (isTouchDevice) {
      // No real hover on touch: the first tap previews the teaser, a
      // second tap on that same link lets the click through as a real nav.
      link.addEventListener("click", (e) => {
        if (primed && primed.link !== link) {
          primed.leave();
          primed = null;
        }

        if (!primed) {
          e.preventDefault();
          enter();
          primed = { link, leave };
        } else {
          leave();
          primed = null;
        }
      });
    } else {
      link.addEventListener("pointerenter", enter);
      link.addEventListener("pointerleave", leave);
    }
  });

  if (isTouchDevice) {
    document.addEventListener("click", (e) => {
      if (primed && !container.contains(e.target)) {
        primed.leave();
        primed = null;
      }
    });
  }
}

// Usage — swap \`color\` for a \`backgroundImage\` to use real photos
initHoverTeaserMenu(document.getElementById("menu"), [
  { id: "beaches", label: "Beaches", href: "/beaches", color: "#0ea5e9" },
  { id: "mountains", label: "Mountains", href: "/mountains", color: "#16a34a" },
  { id: "cities", label: "Cities", href: "/cities", color: "#f59e0b" },
]);`,
    preview: {
      type: "html",
      height: 320,
      markup: `<div class="relative mx-auto h-72 w-full max-w-md overflow-hidden rounded-xl bg-slate-900 text-white" id="menuDemo"></div>
<script>
  function ensureStyles() {
    if (document.getElementById("htm-styles")) return;
    var style = document.createElement("style");
    style.id = "htm-styles";
    style.textContent =
      ".htm-teaser-layer { position: absolute; inset: 0; z-index: 0; overflow: hidden; }" +
      ".htm-teaser { position: absolute; top: 0; left: 0; width: 50%; height: 100%; display: flex; align-items: center; justify-content: center; font-weight: 600; transform: translateX(0%); transition: transform .5s cubic-bezier(.65,0,.35,1); }" +
      ".htm-teaser.is-active { transform: translateX(100%); }" +
      ".htm-nav { position: relative; z-index: 10; display: flex; flex-direction: column; justify-content: center; gap: 1.25rem; width: 50%; height: 100%; padding: 0 2rem; background: rgba(15,23,42,0.95); }" +
      ".htm-link { position: relative; display: flex; align-items: center; gap: .5rem; color: #fff; }" +
      ".htm-dot { width: 6px; height: 6px; border-radius: 999px; background: currentColor; opacity: 0; transform: translateX(0); transition: opacity .3s ease, transform .3s ease; }" +
      ".htm-link.is-active .htm-dot { opacity: .6; transform: translateX(10px); }";
    document.head.appendChild(style);
  }

  function initHoverTeaserMenu(container, links) {
    ensureStyles();

    var teasersHTML = links.map(function (l) {
      return '<div class="htm-teaser" data-teaser="' + l.id + '" style="background:' + l.color + '">' + l.label + '</div>';
    }).join("");

    var linksHTML = links.map(function (l) {
      return '<a href="#" class="htm-link" data-link="' + l.id + '">' +
        '<span>' + l.label + '</span><span class="htm-dot"></span></a>';
    }).join("");

    container.innerHTML =
      '<div class="htm-teaser-layer">' + teasersHTML + '</div>' +
      '<nav class="htm-nav">' + linksHTML + '</nav>';

    var isTouchDevice = window.matchMedia("(hover: none)").matches;
    var primed = null;

    container.querySelectorAll("[data-link]").forEach(function (link) {
      var id = link.dataset.link;
      var teaser = container.querySelector('[data-teaser="' + id + '"]');

      function enter() {
        link.classList.add("is-active");
        teaser.classList.add("is-active");
      }
      function leave() {
        link.classList.remove("is-active");
        teaser.classList.remove("is-active");
      }

      if (isTouchDevice) {
        link.addEventListener("click", function (e) {
          if (primed && primed.link !== link) {
            primed.leave();
            primed = null;
          }
          if (!primed) {
            e.preventDefault();
            enter();
            primed = { link: link, leave: leave };
          } else {
            leave();
            primed = null;
          }
        });
      } else {
        link.addEventListener("pointerenter", enter);
        link.addEventListener("pointerleave", leave);
      }
    });

    if (isTouchDevice) {
      document.addEventListener("click", function (e) {
        if (primed && !container.contains(e.target)) {
          primed.leave();
          primed = null;
        }
      });
    }
  }

  initHoverTeaserMenu(document.getElementById("menuDemo"), [
    { id: "beaches", label: "Beaches", color: "linear-gradient(135deg,#0ea5e9,#0369a1)" },
    { id: "mountains", label: "Mountains", color: "linear-gradient(135deg,#22c55e,#15803d)" },
    { id: "cities", label: "Cities", color: "linear-gradient(135deg,#f59e0b,#b45309)" }
  ]);
<\/script>`,
    },
  },
];
