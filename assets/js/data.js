/* Code Library — snippet dataset.
   Plain JS array (not fetched) so the site also works when opened via file://. */

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
    id: "quicksort",
    title: "Quicksort",
    language: "javascript",
    tags: ["algorithms", "sorting", "recursion"],
    difficulty: "Intermediate",
    description: "A classic divide-and-conquer sorting algorithm with average-case O(n log n) performance.",
    explanation: `Quicksort sorts an array by repeatedly partitioning it around a chosen "pivot" value.

**How it works**

1. If the array has 0 or 1 elements, it's already sorted — this is the recursion's base case.
2. Otherwise, pick a pivot (here, the middle element) to compare everything else against.
3. Split the remaining elements into three buckets: \`left\` (smaller than the pivot), \`middle\` (equal to it), and \`right\` (larger than it).
4. Recursively quicksort \`left\` and \`right\`, then stitch the three buckets back together as \`[...left, ...middle, ...right]\`.

Because each recursive call works on a strictly smaller slice, the recursion always terminates. The average time complexity is O(n log n), though a poorly chosen pivot on already-sorted data can degrade to O(n²) — production sorts usually randomize or median-of-three the pivot to avoid that.`,
    code: `function quicksort(arr) {
  if (arr.length <= 1) return arr;

  const pivotIndex = Math.floor(arr.length / 2);
  const pivot = arr[pivotIndex];

  const left = [];
  const middle = [];
  const right = [];

  for (const value of arr) {
    if (value < pivot) left.push(value);
    else if (value > pivot) right.push(value);
    else middle.push(value);
  }

  return [...quicksort(left), ...middle, ...quicksort(right)];
}

// Usage
console.log(quicksort([5, 3, 8, 1, 9, 2]));
// [1, 2, 3, 5, 8, 9]`,
    preview: {
      type: "js",
      run: `function quicksort(arr) {
  if (arr.length <= 1) return arr;

  const pivotIndex = Math.floor(arr.length / 2);
  const pivot = arr[pivotIndex];

  const left = [];
  const middle = [];
  const right = [];

  for (const value of arr) {
    if (value < pivot) left.push(value);
    else if (value > pivot) right.push(value);
    else middle.push(value);
  }

  return [...quicksort(left), ...middle, ...quicksort(right)];
}

const input = [5, 3, 8, 1, 9, 2];
console.log("Input: ", JSON.stringify(input));
console.log("Sorted:", JSON.stringify(quicksort(input)));`,
    },
  },
  {
    id: "flexbox-center",
    title: "Perfect Centering",
    language: "css",
    tags: ["layout", "flexbox"],
    difficulty: "Beginner",
    description: "The one-liner combo that centers anything, both horizontally and vertically, inside its parent.",
    explanation: `This is the modern answer to "how do I center a div" — a question that used to require table hacks or absolute-positioning tricks.

**How it works**

1. \`display: flex\` turns the container into a flex container, activating the flexbox layout algorithm for its direct children.
2. \`justify-content: center\` centers children along the *main axis*, which defaults to horizontal (row).
3. \`align-items: center\` centers children along the *cross axis*, which defaults to vertical.
4. \`min-height\` gives the container somewhere to center within — without height, there's no vertical space to distribute.

Because flexbox recalculates on every resize, the centered content stays centered responsively with zero extra JavaScript.`,
    code: `.center-container {
  display: flex;
  justify-content: center; /* horizontal */
  align-items: center;     /* vertical */
  min-height: 100vh;
}

/* Works for any child, no matter its size */
.center-container .card {
  width: 320px;
  padding: 2rem;
}`,
    preview: {
      type: "html",
      height: 240,
      markup: `<div class="center-container" style="background:#efeaff;">
  <div class="card" style="background:#6c5ce7;color:#fff;border-radius:16px;text-align:center;font-family:-apple-system,Inter,sans-serif;font-weight:600;box-shadow:0 12px 32px rgba(108,92,231,0.35);">
    🎯 Centered, no matter what
  </div>
</div>`,
    },
  },
  {
    id: "promise-all-settled",
    title: "Parallel Requests with allSettled",
    language: "javascript",
    tags: ["async", "promises", "networking"],
    difficulty: "Intermediate",
    description: "Fire several async requests in parallel and collect every result — successes and failures alike.",
    explanation: `\`Promise.allSettled\` runs multiple promises concurrently and waits for *all* of them to finish, regardless of whether any individual one rejects.

**How it works**

1. \`urls.map(fetchJSON)\` immediately kicks off every fetch in parallel — none of them wait for each other, unlike a \`for\` loop with \`await\` inside it.
2. \`Promise.allSettled\` takes that array of in-flight promises and returns a single promise that resolves once *every* one of them has either resolved or rejected.
3. Each entry in the result array has a \`status\` field: \`"fulfilled"\` (with a \`value\`) or \`"rejected"\` (with a \`reason\`) — so one failed request can't blow up the whole batch, unlike \`Promise.all\`, which rejects immediately on the first failure.
4. The final \`filter\`/\`map\` step pulls out just the successful values, silently discarding failures (or you could log \`reason\` for the rejected ones).

This pattern is the go-to when you want "best effort" parallel fetching — e.g. loading several independent widgets on a dashboard where one failing shouldn't take down the rest.`,
    code: `async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(\`Request failed: \${res.status}\`);
  return res.json();
}

async function fetchAll(urls) {
  const results = await Promise.allSettled(urls.map(fetchJSON));

  return results
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value);
}

// Usage
const data = await fetchAll([
  "/api/users",
  "/api/posts",
  "/api/comments",
]);`,
    preview: {
      type: "js",
      run: `function fakeRequest(ms, value, shouldFail) {
  return new Promise((resolve, reject) => {
    setTimeout(() => (shouldFail ? reject(new Error(value)) : resolve(value)), ms);
  });
}

async function fetchAll(promises) {
  const results = await Promise.allSettled(promises);
  return results
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value);
}

console.log("Firing 3 requests in parallel (one will fail)...");
const requests = [
  fakeRequest(300, "users: [Ada, Alan]", false),
  fakeRequest(500, "posts: request timed out", true),
  fakeRequest(200, "comments: 12 items", false),
];

fetchAll(requests).then((data) => {
  console.log("All settled. Successful results kept:");
  data.forEach((d) => console.log("  - " + d));
});`,
    },
  },
  {
    id: "python-binary-search",
    title: "Binary Search",
    language: "python",
    tags: ["algorithms", "searching"],
    difficulty: "Beginner",
    description: "Find a value in a sorted list in O(log n) time by repeatedly halving the search space.",
    explanation: `Binary search only works on **sorted** data, but in exchange it's dramatically faster than scanning element by element.

**How it works**

1. Two pointers, \`low\` and \`high\`, mark the current search window — initially the whole list.
2. On each loop, \`mid\` is the midpoint of that window.
3. If \`arr[mid]\` is exactly the target, we're done.
4. If the target is *larger*, the entire left half (including \`mid\`) can never contain it, so \`low\` jumps past it.
5. If the target is *smaller*, the right half is discarded the same way by pulling \`high\` back.
6. Every iteration halves the remaining window, so a list of a million items needs at most ~20 comparisons instead of up to a million.

If \`low\` ever crosses \`high\`, the window is empty and the target isn't present, so the loop returns -1.`,
    code: `def binary_search(arr, target):
    low, high = 0, len(arr) - 1

    while low <= high:
        mid = (low + high) // 2

        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1

    return -1  # not found

# Usage
numbers = [1, 3, 5, 7, 9, 11, 13]
print(binary_search(numbers, 9))  # 4`,
    preview: {
      type: "text",
      output: `>>> numbers = [1, 3, 5, 7, 9, 11, 13]
>>> binary_search(numbers, 9)
4`,
      note: "Python runs outside the browser, so this shows what executing the snippet above would actually print.",
    },
  },
  {
    id: "css-grid-auto-fill",
    title: "Self-Wrapping Card Grid",
    language: "css",
    tags: ["layout", "grid", "responsive"],
    difficulty: "Intermediate",
    description: "A responsive grid that adds or removes columns automatically as the viewport resizes — no media queries needed.",
    explanation: `This single \`grid-template-columns\` declaration replaces what used to take several breakpoint-specific media queries.

**How it works**

1. \`repeat(auto-fill, ...)\` tells the grid to keep repeating the column pattern as many times as fit in the container's width.
2. \`minmax(240px, 1fr)\` gives every column a floor of 240px — columns never shrink below that — and a ceiling that lets them stretch to fill remaining space equally (\`1fr\`).
3. As the container narrows, columns that no longer fit at 240px collapse away, and the remaining columns redistribute the freed space between them. As it widens, more 240px-minimum columns fit, so a new column appears.
4. \`gap\` adds consistent spacing between both rows and columns without needing margin hacks that break at the grid's edges.

\`auto-fill\` (used here) keeps empty tracks if there's leftover space; the alternative \`auto-fit\` collapses those empty tracks so existing cards stretch to fill the row instead.`,
    code: `.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
}

/* Each card just needs to exist — no width math required */
.card-grid > .card {
  min-height: 180px;
}`,
    preview: {
      type: "html",
      height: 260,
      resizable: true,
      markup: `<div class="card-grid" style="padding:1rem;">
  <div class="card" style="background:#6c5ce7;"></div>
  <div class="card" style="background:#ff6b6b;"></div>
  <div class="card" style="background:#00c2a8;"></div>
  <div class="card" style="background:#ffab2e;"></div>
  <div class="card" style="background:#ff5fa2;"></div>
  <div class="card" style="background:#5341d6;"></div>
</div>`,
    },
  },
  {
    id: "js-deep-clone",
    title: "Deep Clone with structuredClone",
    language: "javascript",
    tags: ["objects", "browser-apis"],
    difficulty: "Beginner",
    description: "Create a true deep copy of nested objects and arrays using a built-in browser API — no libraries needed.",
    explanation: `Before \`structuredClone\` existed, deep-cloning an object usually meant \`JSON.parse(JSON.stringify(obj))\` — a hack that silently breaks on \`Date\`, \`Map\`, \`Set\`, \`undefined\` values, and circular references.

**How it works**

1. \`structuredClone\` is a global function implementing the same "structured clone algorithm" browsers already use internally for \`postMessage\` and IndexedDB.
2. It walks the entire object graph recursively, copying nested objects and arrays into brand new memory rather than copying references.
3. Unlike the JSON hack, it correctly preserves special types like \`Date\`, \`Map\`, \`Set\`, \`RegExp\`, and typed arrays, and it can even handle circular references without infinite-looping.
4. Because the clone is fully independent, mutating the copy (e.g. \`clone.user.name = "Bo"\`) never touches the original object.

The main limitation: it can't clone functions or DOM nodes — attempting to will throw a \`DataCloneError\`.`,
    code: `const original = {
  name: "Ada",
  createdAt: new Date(),
  tags: new Set(["engineer", "pioneer"]),
  address: { city: "London" },
};

const clone = structuredClone(original);

clone.address.city = "Paris";

console.log(original.address.city); // "London" — untouched
console.log(clone.address.city);    // "Paris"`,
    preview: {
      type: "js",
      run: `const original = {
  name: "Ada",
  createdAt: new Date(),
  tags: new Set(["engineer", "pioneer"]),
  address: { city: "London" },
};

const clone = structuredClone(original);
clone.address.city = "Paris";

console.log("original.address.city:", original.address.city);
console.log("clone.address.city:   ", clone.address.city);
console.log("clone.tags instanceof Set:", clone.tags instanceof Set);`,
    },
  },
  {
    id: "react-like-usefetch",
    title: "Tiny useFetch Hook",
    language: "javascript",
    tags: ["react", "hooks", "async"],
    difficulty: "Advanced",
    description: "A minimal custom React hook that fetches data, tracks loading/error state, and cleans up after itself.",
    explanation: `Custom hooks let you package a stateful pattern — here, "fetch some data and track its lifecycle" — into a single reusable function.

**How it works**

1. Three pieces of state track the request's lifecycle: \`data\` (the result), \`loading\` (in flight or not), and \`error\` (anything that went wrong).
2. The \`useEffect\` re-runs whenever \`url\` changes, so switching URLs automatically triggers a fresh fetch.
3. An \`AbortController\` is created per effect run. Its \`signal\` is passed into \`fetch\`, and the cleanup function calls \`controller.abort()\` when the component unmounts or \`url\` changes again — this prevents a slow, stale request from overwriting state after a newer one has already started (a common source of race-condition bugs).
4. The \`try/catch/finally\` block updates \`data\` on success, \`error\` on failure (ignoring intentional \`AbortError\`s from cleanup), and always turns \`loading\` off in \`finally\`.

The hook returns the three pieces of state as an object, so any component can destructure exactly what it needs: \`const { data, loading, error } = useFetch(url)\`.`,
    code: `function useFetch(url) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const controller = new AbortController();

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        setData(await res.json());
      } catch (err) {
        if (err.name !== "AbortError") setError(err);
      } finally {
        setLoading(false);
      }
    }

    run();
    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
}`,
    preview: {
      type: "text",
      output: `// state over time for useFetch("/api/user/42")

t=0ms    { data: null,        loading: true,  error: null }
t=180ms  { data: { id: 42 }, loading: false, error: null }

// if the request had failed instead:
t=180ms  { data: null,        loading: false, error: Error("HTTP 500") }`,
      note: "This hook depends on React and a live endpoint, so this preview shows the state shape over time rather than executing it in the browser.",
    },
  },
  {
    id: "python-list-comprehension",
    title: "List Comprehensions",
    language: "python",
    tags: ["fundamentals", "syntax"],
    difficulty: "Beginner",
    description: "Build new lists in a single readable expression instead of a manual for-loop with .append().",
    explanation: `A list comprehension is a compact way of expressing "for every item in this iterable, optionally filter it, then transform it into a new list."

**How it works**

1. The syntax \`[expression for item in iterable if condition]\` reads almost like the English sentence describing it.
2. Python evaluates it like an implicit loop: for each \`item\` in \`iterable\`, it checks the optional \`if condition\` — items that fail it are skipped entirely.
3. For items that pass, \`expression\` (often just a transformed version of \`item\`) is evaluated and appended to the new list being built.
4. The whole thing produces a brand-new list — the original iterable is never mutated.

Compared to a manual loop with \`.append()\`, comprehensions are usually faster (fewer bytecode operations) and, once you're used to the syntax, easier to read at a glance.`,
    code: `numbers = range(1, 21)

# Squares of even numbers only
even_squares = [n ** 2 for n in numbers if n % 2 == 0]
print(even_squares)
# [4, 16, 36, 64, 100, 144, 196, 256, 324, 400]

# Equivalent manual loop, for comparison
even_squares_manual = []
for n in numbers:
    if n % 2 == 0:
        even_squares_manual.append(n ** 2)`,
    preview: {
      type: "text",
      output: `>>> even_squares
[4, 16, 36, 64, 100, 144, 196, 256, 324, 400]`,
      note: "Python runs outside the browser, so this shows what executing the snippet above would actually print.",
    },
  },
  {
    id: "css-custom-properties-theme",
    title: "Theming with CSS Variables",
    language: "css",
    tags: ["theming", "custom-properties"],
    difficulty: "Intermediate",
    description: "Swap an entire color scheme at runtime by toggling one attribute — the technique behind most dark-mode switches.",
    explanation: `CSS custom properties (variables) can be redefined at any scope, and every element using \`var(--token)\` picks up the new value automatically — no re-render or JS style manipulation needed on each element.

**How it works**

1. \`:root\` defines the default ("light") values for a set of semantic tokens like \`--bg\` and \`--text\`, rather than hard-coding colors all over the stylesheet.
2. \`[data-theme="dark"]\` re-declares those *same* variable names with different values, scoped to any element carrying that attribute (typically \`<html data-theme="dark">\`).
3. Because CSS variables cascade and inherit like any other property, every descendant element that references \`var(--bg)\` or \`var(--text)\` re-resolves to the dark values automatically — the component styles never mention "dark mode" at all.
4. A tiny JS snippet just needs to flip the attribute (and optionally persist the choice in \`localStorage\`) — the actual repainting is handled entirely by the browser's CSS engine.

This keeps theme logic in one place instead of duplicating every component's styles for light and dark.`,
    code: `:root {
  --bg: #ffffff;
  --text: #1a1a1a;
  --accent: #6c5ce7;
}

[data-theme="dark"] {
  --bg: #14121f;
  --text: #f4f2ff;
  --accent: #a29bfe;
}

body {
  background: var(--bg);
  color: var(--text);
  transition: background 0.3s ease, color 0.3s ease;
}

.button {
  background: var(--accent);
}`,
    preview: {
      type: "html",
      height: 180,
      markup: `<div style="padding:2rem;text-align:center;font-family:-apple-system,Inter,sans-serif;">
  <p style="margin:0 0 1rem;">This box reads the CSS variables from the snippet above.</p>
  <button class="button" id="demoToggle" style="border:0;color:#fff;padding:0.6rem 1.2rem;border-radius:999px;font-weight:600;cursor:pointer;">Toggle theme</button>
</div>
<script>
  document.getElementById("demoToggle").addEventListener("click", () => {
    const root = document.documentElement;
    const isDark = root.getAttribute("data-theme") === "dark";
    root.setAttribute("data-theme", isDark ? "light" : "dark");
  });
</script>`,
    },
  },
  {
    id: "js-memoize",
    title: "Memoization Cache",
    language: "javascript",
    tags: ["performance", "closures", "caching"],
    difficulty: "Intermediate",
    description: "Wrap an expensive pure function so repeated calls with the same arguments return instantly from a cache.",
    explanation: `Memoization trades memory for speed: it remembers past results so identical work is never repeated.

**How it works**

1. \`memoize\` returns a wrapper function that closes over a \`Map\` used as its cache — this \`Map\` persists across every call to the wrapped function, since it lives in the closure rather than being recreated each time.
2. On each call, the arguments are serialized into a single string \`key\` via \`JSON.stringify\`. This makes \`(2, 3)\` and \`(3, 2)\` produce different keys, which is what you want for a function like addition where argument order can matter for the general case.
3. If that \`key\` already exists in the cache, the stored value is returned immediately — the original function never runs again for that input.
4. Otherwise, the real function runs once, and its result is stored under \`key\` before being returned, so the *next* call with the same arguments hits the cache.

This only makes sense for **pure** functions (same input always produces the same output) — memoizing something with side effects or external dependencies would return stale results.`,
    code: `function memoize(fn) {
  const cache = new Map();

  return function (...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// Usage — an expensive recursive fibonacci, made fast
const slowFib = (n) => (n <= 1 ? n : slowFib(n - 1) + slowFib(n - 2));
const fastFib = memoize(slowFib);

console.log(fastFib(30)); // computed once, cached forever`,
    preview: {
      type: "js",
      run: `function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

const slowSquare = (n) => {
  let total = 0;
  for (let i = 0; i < 3e6; i++) total += i; // simulate expensive work
  return n * n;
};
const fastSquare = memoize(slowSquare);

let start = performance.now();
console.log("First call with 7 (runs the real function):");
console.log("  result =", fastSquare(7), "  took", (performance.now() - start).toFixed(2) + "ms");

start = performance.now();
console.log("Second call with 7 (hits the cache):");
console.log("  result =", fastSquare(7), "  took", (performance.now() - start).toFixed(2) + "ms");`,
    },
  },
  {
    id: "python-context-manager",
    title: "Custom Context Manager",
    language: "python",
    tags: ["fundamentals", "resource-management"],
    difficulty: "Advanced",
    description: "Guarantee setup and teardown code always runs — even on error — using Python's 'with' statement protocol.",
    explanation: `A context manager guarantees that cleanup code runs no matter how the \`with\` block exits — normally, via \`return\`, or via an uncaught exception.

**How it works**

1. Any class implementing \`__enter__\` and \`__exit__\` can be used after \`with\`. Python calls \`__enter__\` when entering the block, and whatever it returns gets bound to the \`as\` variable.
2. Here, \`__enter__\` records the start time and returns \`self\`, so the block can reference the timer if needed.
3. When the block finishes — however it finishes — Python calls \`__exit__\` with three arguments describing any exception that occurred (\`exc_type\`, \`exc_value\`, \`traceback\`), or \`(None, None, None)\` if it exited cleanly.
4. \`__exit__\` runs the cleanup (printing the elapsed time here) regardless of which case happened. Returning \`False\` from \`__exit__\` tells Python "don't swallow the exception" — it keeps propagating normally after cleanup runs.

This pattern is how \`open(...)\` guarantees a file gets closed, and how \`threading.Lock()\` guarantees a lock gets released, even if the code inside the block raises.`,
    code: `import time

class Timer:
    def __enter__(self):
        self.start = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        elapsed = time.perf_counter() - self.start
        print(f"Elapsed: {elapsed:.4f}s")
        return False  # don't suppress exceptions

# Usage
with Timer():
    total = sum(n ** 2 for n in range(1_000_000))`,
    preview: {
      type: "text",
      output: `>>> with Timer():
...     total = sum(n ** 2 for n in range(1_000_000))
...
Elapsed: 0.0842s`,
      note: "Python runs outside the browser, so this shows what executing the snippet above would actually print.",
    },
  }
];
