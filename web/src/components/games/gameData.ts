// ============================================================
// GAME DATA — Educational content for all 6 games
// ============================================================

// ---------- CODE BATTLE ----------
export interface CodeChallenge {
  id: number
  title: string
  description: string
  codeSnippet?: string
  options: string[]
  correctIndex: number
  difficulty: 'easy' | 'medium' | 'hard'
}

export const codeChallenges: CodeChallenge[] = [
  {
    id: 1,
    title: 'Array Method',
    description: 'Which array method returns a NEW array with elements that pass a test?',
    options: ['forEach()', 'filter()', 'find()', 'includes()'],
    correctIndex: 1,
    difficulty: 'easy',
  },
  {
    id: 2,
    title: 'Promise Chaining',
    description: 'What does `.catch()` handle in a Promise chain?',
    options: ['Fulfilled promises', 'Rejected promises', 'Pending promises', 'Cancelled promises'],
    correctIndex: 1,
    difficulty: 'easy',
  },
  {
    id: 3,
    title: 'Fix the Bug',
    description: 'What is wrong with this code?',
    codeSnippet: `const items = [1, 2, 3];\nconst doubled = items.map(i => { i * 2 });`,
    options: [
      'map() does not exist on arrays',
      'Arrow function with braces needs an explicit return',
      'i is not defined',
      'items should be let, not const',
    ],
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    id: 4,
    title: 'TypeScript Generics',
    description: 'What does `T` represent in `function identity<T>(arg: T): T`?',
    options: ['A type parameter', 'A variable named T', 'The return type only', 'A class'],
    correctIndex: 0,
    difficulty: 'medium',
  },
  {
    id: 5,
    title: 'Event Loop',
    description: 'In Node.js, which phase of the event loop handles setTimeout callbacks?',
    options: ['Poll phase', 'Timer phase', 'Check phase', 'Close callbacks phase'],
    correctIndex: 1,
    difficulty: 'hard',
  },
  {
    id: 6,
    title: 'HTTP Status Codes',
    description: 'Which HTTP status code indicates the server understood the request but refuses to authorize it?',
    options: ['401 Unauthorized', '403 Forbidden', '404 Not Found', '405 Method Not Allowed'],
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    id: 7,
    title: 'SQL Injection',
    description: 'Which approach best prevents SQL injection?',
    options: ['Input validation only', 'Parameterized queries / prepared statements', 'Escaping special characters', 'Using POST instead of GET'],
    correctIndex: 1,
    difficulty: 'hard',
  },
  {
    id: 8,
    title: 'React Hooks',
    description: 'When does `useEffect` with an empty dependency array run?',
    options: ['On every render', 'Only on mount', 'Only on unmount', 'Never'],
    correctIndex: 1,
    difficulty: 'easy',
  },
  {
    id: 9,
    title: 'Database Indexing',
    description: 'What is the primary purpose of a database index?',
    options: ['Reduce storage space', 'Speed up data retrieval', 'Enforce unique constraints', 'Encrypt data at rest'],
    correctIndex: 1,
    difficulty: 'medium',
  },
  {
    id: 10,
    title: 'Closure',
    description: 'What will `counter()` return the SECOND time it is called?',
    codeSnippet: `function makeCounter() {\n  let count = 0;\n  return function() { return ++count; };\n}\nconst counter = makeCounter();`,
    options: ['0', '1', '2', 'undefined'],
    correctIndex: 2,
    difficulty: 'hard',
  },
]

// ---------- DEBUG DUNGEON ----------
export interface DungeonFloor {
  floor: number
  title: string
  bugType: string
  code: string
  question: string
  options: string[]
  correctIndex: number
  hint: string
  explanation: string
}

export const dungeonFloors: DungeonFloor[] = [
  {
    floor: 1,
    title: 'The Off-By-One Cavern',
    bugType: 'Off-by-one error',
    code: `function getLastItem(arr) {\n  return arr[arr.length];\n}`,
    question: 'This function should return the last element. What is the bug?',
    options: [
      'Should be arr[arr.length - 1]',
      'Should use arr.pop()',
      'arr is not defined',
      'Should be arr[0]',
    ],
    correctIndex: 0,
    hint: 'Array indices are zero-based, so the last valid index is length minus one.',
    explanation: 'arr[arr.length] accesses one position past the end of the array, returning undefined. The fix is arr[arr.length - 1].',
  },
  {
    floor: 2,
    title: 'The Scope Shadows',
    bugType: 'Variable shadowing',
    code: `let score = 100;\nfunction updateScore(score) {\n  score = score + 50;\n}\nupdateScore(score);\nconsole.log(score); // Expected: 150`,
    question: 'Why does console.log(score) still print 100?',
    options: [
      'The parameter name shadows the outer variable',
      'score + 50 is not valid',
      'updateScore is never called',
      'let does not allow reassignment',
    ],
    correctIndex: 0,
    hint: 'When a function parameter has the same name as an outer variable, which one gets modified?',
    explanation: 'The function parameter "score" shadows the outer "score". The assignment modifies only the local parameter, not the outer variable.',
  },
  {
    floor: 3,
    title: 'The Async Abyss',
    bugType: 'Missing await',
    code: `async function fetchUser(id) {\n  const response = fetch(\`/api/users/\${id}\`);\n  const data = response.json();\n  return data;\n}`,
    question: 'This async function fails silently. What is missing?',
    options: [
      'await before fetch() and response.json()',
      'try-catch block',
      'return type annotation',
      'Headers in fetch call',
    ],
    correctIndex: 0,
    hint: 'fetch() returns a Promise. What keyword do you need in an async function to resolve a Promise?',
    explanation: 'Without await, response is a Promise object, not the actual Response. response.json() then fails because .json() is not a method on a Promise.',
  },
  {
    floor: 4,
    title: 'The Mutation Maze',
    bugType: 'Unintended mutation',
    code: `const defaults = { theme: 'dark', lang: 'en' };\nfunction createConfig(overrides) {\n  const config = defaults;\n  Object.assign(config, overrides);\n  return config;\n}`,
    question: 'Calling createConfig({lang:"fr"}) mutates defaults. Why?',
    options: [
      'config is a reference to defaults, not a copy',
      'Object.assign does not work with const',
      'overrides is undefined',
      'createConfig is not pure because of Object.assign',
    ],
    correctIndex: 0,
    hint: 'Objects in JavaScript are assigned by reference, not by value.',
    explanation: 'const config = defaults assigns by reference. Object.assign(config, overrides) mutates the same object. Fix: const config = { ...defaults, ...overrides }.',
  },
  {
    floor: 5,
    title: 'The Comparison Crypt',
    bugType: 'Loose equality',
    code: `function isAdmin(user) {\n  if (user.role == true) {\n    return 'Access granted';\n  }\n  return 'Access denied';\n}\n// user.role is the string "admin"`,
    question: 'Why does isAdmin({ role: "admin" }) return "Access denied"?',
    options: [
      '"admin" == true is false due to type coercion rules',
      'user.role should use dot notation',
      'if statements cannot compare strings',
      'The function needs a return type',
    ],
    correctIndex: 0,
    hint: 'JavaScript loose equality with == performs type coercion. What does "admin" coerce to as a number?',
    explanation: '"admin" == true converts both sides: true becomes 1, "admin" becomes NaN. NaN == 1 is false. Use strict equality (===) and compare against the string "admin".',
  },
]

// ---------- CONCEPT QUEST ----------
export interface ConceptBoss {
  name: string
  title: string
  maxHp: number
  emoji: string
  questions: {
    text: string
    options: string[]
    correctIndex: number
    damage: number
  }[]
}

export const conceptBosses: ConceptBoss[] = [
  {
    name: 'REST Revenant',
    title: 'Guardian of API Design',
    maxHp: 100,
    emoji: '🧟',
    questions: [
      { text: 'Which HTTP method is idempotent and used to update an entire resource?', options: ['POST', 'PUT', 'PATCH', 'DELETE'], correctIndex: 1, damage: 35 },
      { text: 'What does a 201 status code indicate?', options: ['OK', 'Created', 'No Content', 'Accepted'], correctIndex: 1, damage: 35 },
      { text: 'Which header tells the server what format the client expects in the response?', options: ['Content-Type', 'Accept', 'Authorization', 'Cache-Control'], correctIndex: 1, damage: 30 },
    ],
  },
  {
    name: 'Database Dragon',
    title: 'Lord of Queries',
    maxHp: 120,
    emoji: '🐉',
    questions: [
      { text: 'What does ACID stand for in database transactions?', options: ['Atomicity, Consistency, Isolation, Durability', 'Access, Control, Index, Data', 'Async, Cache, Insert, Delete', 'Aggregate, Count, Inner, Drop'], correctIndex: 0, damage: 30 },
      { text: 'Which JOIN returns rows that have matching values in BOTH tables?', options: ['LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL OUTER JOIN'], correctIndex: 2, damage: 30 },
      { text: 'What is database normalization primarily used for?', options: ['Speeding up queries', 'Reducing data redundancy', 'Adding indexes', 'Encrypting data'], correctIndex: 1, damage: 30 },
      { text: 'Which type of index is best for columns with high cardinality?', options: ['Bitmap index', 'B-tree index', 'Hash index', 'Full-text index'], correctIndex: 1, damage: 30 },
    ],
  },
  {
    name: 'Async Archmage',
    title: 'Master of Concurrency',
    maxHp: 140,
    emoji: '🧙',
    questions: [
      { text: 'What does Promise.all() do if one promise rejects?', options: ['Ignores it', 'Rejects immediately with that reason', 'Resolves with partial results', 'Retries the failed promise'], correctIndex: 1, damage: 28 },
      { text: 'What is the purpose of the microtask queue?', options: ['Handle setTimeout callbacks', 'Process Promise callbacks before the next task', 'Manage I/O operations', 'Schedule CSS animations'], correctIndex: 1, damage: 28 },
      { text: 'Which pattern prevents callback hell?', options: ['Nested callbacks', 'Promise chaining or async/await', 'Synchronous I/O', 'Global variables'], correctIndex: 1, damage: 28 },
      { text: 'What does Promise.allSettled() return?', options: ['Only fulfilled results', 'Only rejected reasons', 'An array of outcome objects for all promises', 'The first settled promise'], correctIndex: 2, damage: 28 },
      { text: 'In Node.js, which function defers execution to the next iteration of the event loop?', options: ['setTimeout(fn, 0)', 'setImmediate(fn)', 'process.nextTick(fn)', 'queueMicrotask(fn)'], correctIndex: 2, damage: 28 },
    ],
  },
]

// ---------- 60-SECOND CHALLENGE ----------
export interface SprintQuestion {
  question: string
  options: string[]
  correctIndex: number
}

export const sprintQuestions: SprintQuestion[] = [
  { question: 'What does CSS stand for?', options: ['Cascading Style Sheets', 'Computer Style System', 'Creative Style Syntax', 'Component Styling Standard'], correctIndex: 0 },
  { question: 'Which keyword declares a block-scoped variable in JS?', options: ['var', 'let', 'function', 'global'], correctIndex: 1 },
  { question: 'What does JSON stand for?', options: ['JavaScript Object Notation', 'Java Standard Object Network', 'JSON Script Object Name', 'Joint System Open Notation'], correctIndex: 0 },
  { question: 'Which HTTP method is used to create a resource?', options: ['GET', 'POST', 'PUT', 'DELETE'], correctIndex: 1 },
  { question: 'What symbol starts a JSX expression in React?', options: ['( )', '{ }', '[ ]', '< >'], correctIndex: 1 },
  { question: 'What does API stand for?', options: ['Application Programming Interface', 'Applied Protocol Integration', 'Automated Process Interface', 'Application Process Interchange'], correctIndex: 0 },
  { question: 'Which data structure uses FIFO ordering?', options: ['Stack', 'Queue', 'Tree', 'Graph'], correctIndex: 1 },
  { question: 'What does the `===` operator check in JavaScript?', options: ['Value only', 'Value and type', 'Reference only', 'Type only'], correctIndex: 1 },
  { question: 'What is the time complexity of binary search?', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], correctIndex: 2 },
  { question: 'Which Git command creates a new branch?', options: ['git branch <name>', 'git new <name>', 'git create <name>', 'git init <name>'], correctIndex: 0 },
  { question: 'What does DOM stand for?', options: ['Document Object Model', 'Data Object Management', 'Document Order Method', 'Digital Object Mapping'], correctIndex: 0 },
  { question: 'Which port does HTTPS use by default?', options: ['80', '443', '8080', '3000'], correctIndex: 1 },
  { question: 'What does `null` represent in JavaScript?', options: ['Undefined variable', 'Intentional absence of value', 'Empty string', 'Zero'], correctIndex: 1 },
  { question: 'Which method converts a JSON string to an object?', options: ['JSON.stringify()', 'JSON.parse()', 'JSON.convert()', 'JSON.decode()'], correctIndex: 1 },
  { question: 'What is a closure in JavaScript?', options: ['A way to close the browser', 'A function that retains access to its outer scope', 'A method to end a loop', 'An error handling mechanism'], correctIndex: 1 },
  { question: 'Which SQL keyword is used to filter grouped results?', options: ['WHERE', 'HAVING', 'FILTER', 'GROUP BY'], correctIndex: 1 },
  { question: 'What does REST stand for?', options: ['Representational State Transfer', 'Remote Execution Standard Technology', 'Resource Entry System Type', 'Relational Entity State Transform'], correctIndex: 0 },
  { question: 'Which React hook manages side effects?', options: ['useState', 'useEffect', 'useRef', 'useMemo'], correctIndex: 1 },
  { question: 'What is the output of typeof null?', options: ['"null"', '"undefined"', '"object"', '"boolean"'], correctIndex: 2 },
  { question: 'Which command installs a Node.js package?', options: ['node install', 'npm install', 'npm add', 'node get'], correctIndex: 1 },
]

// ---------- SKILL GRAPH QUEST ----------
export interface SkillNode {
  id: string
  label: string
  x: number
  y: number
  dependencies: string[]
  challenge: {
    question: string
    options: string[]
    correctIndex: number
  }
}

export const skillNodes: SkillNode[] = [
  { id: 'html', label: 'HTML', x: 50, y: 20, dependencies: [], challenge: { question: 'Which HTML tag defines an unordered list?', options: ['<ol>', '<ul>', '<li>', '<list>'], correctIndex: 1 } },
  { id: 'css', label: 'CSS', x: 20, y: 45, dependencies: ['html'], challenge: { question: 'Which CSS property controls element spacing outside the border?', options: ['padding', 'margin', 'border', 'gap'], correctIndex: 1 } },
  { id: 'js', label: 'JavaScript', x: 80, y: 45, dependencies: ['html'], challenge: { question: 'Which method adds an element to the end of an array?', options: ['unshift()', 'push()', 'append()', 'add()'], correctIndex: 1 } },
  { id: 'react', label: 'React', x: 50, y: 65, dependencies: ['js', 'css'], challenge: { question: 'What is the React virtual DOM used for?', options: ['Database queries', 'Efficient UI updates', 'Server routing', 'State persistence'], correctIndex: 1 } },
  { id: 'ts', label: 'TypeScript', x: 80, y: 75, dependencies: ['js'], challenge: { question: 'What does TypeScript add to JavaScript?', options: ['Runtime speed', 'Static type checking', 'Server capabilities', 'Database access'], correctIndex: 1 } },
  { id: 'node', label: 'Node.js', x: 15, y: 75, dependencies: ['js'], challenge: { question: 'What runtime does Node.js use?', options: ['SpiderMonkey', 'V8', 'JavaScriptCore', 'Chakra'], correctIndex: 1 } },
  { id: 'api', label: 'REST APIs', x: 50, y: 90, dependencies: ['node', 'react'], challenge: { question: 'Which HTTP status code means "Not Found"?', options: ['401', '403', '404', '500'], correctIndex: 2 } },
]

// ---------- AI MYSTERY ----------
export interface MysteryScenario {
  id: number
  title: string
  description: string
  clues: { label: string; content: string; type: 'log' | 'metric' | 'error' | 'config' }[]
  possibleCauses: string[]
  correctCauseIndex: number
  explanation: string
  hint: string
}

export const mysteryScenarios: MysteryScenario[] = [
  {
    id: 1,
    title: 'The Midnight Outage',
    description: 'At 2:03 AM, the production API started returning 503 errors. The on-call engineer reports the application server is running, but no requests are being processed. Traffic levels are normal.',
    clues: [
      { label: 'Application Logs', content: 'ERROR: SequelizeConnectionError: too many connections for role "app_user"\nERROR: Connection pool exhausted, 50/50 active connections\nWARN: Queries queuing, average wait time 45s', type: 'log' },
      { label: 'Database Metrics', content: 'Active connections: 50 (max pool)\nIdle connections: 0\nAverage query time: 230ms → 12,400ms (spike at 2:01 AM)\nLong-running queries: 3 queries running > 60s each', type: 'metric' },
      { label: 'Recent Deployment', content: 'Deploy #487 at 1:55 AM:\n- Added analytics tracking query to /api/dashboard\n- Query: SELECT * FROM events JOIN users ON ... (no LIMIT, no index on events.created_at)', type: 'config' },
      { label: 'Error Response', content: 'HTTP 503 Service Unavailable\n{ "error": "Service temporarily unavailable", "retry_after": 30 }', type: 'error' },
    ],
    possibleCauses: [
      'DDoS attack overwhelming the server',
      'Unoptimized query in recent deploy exhausted the connection pool',
      'Database server ran out of disk space',
      'SSL certificate expired causing connection failures',
    ],
    correctCauseIndex: 1,
    explanation: 'Deploy #487 introduced a SELECT * query with no LIMIT joining two large tables without proper indexing. These long-running queries held connections open, exhausting the pool (50/50). New requests could not acquire connections, causing 503 errors.',
    hint: 'Look at the timing of the recent deployment and the connection pool metrics.',
  },
  {
    id: 2,
    title: 'The Memory Ghost',
    description: 'A Node.js microservice restarts every 4-6 hours in production. Each restart causes a 30-second downtime. The Kubernetes pod shows OOMKilled status after each restart.',
    clues: [
      { label: 'Container Logs', content: 'WARN: Heap usage at 85% (680MB / 800MB limit)\nWARN: Heap usage at 92% (736MB / 800MB limit)\nFATAL: JavaScript heap out of memory\nProcess exited with code 137 (OOMKilled)', type: 'log' },
      { label: 'Memory Metrics', content: 'Memory pattern: steady climb from 200MB to 800MB over 4-6 hours\nGC frequency: increasing over time\nGC pause duration: 50ms → 800ms\nNo memory drops after GC cycles', type: 'metric' },
      { label: 'Code Review', content: '// Event listener registration in request handler\napp.get("/stream", (req, res) => {\n  eventEmitter.on("data", (chunk) => {\n    res.write(chunk);\n  });\n  // No cleanup on connection close\n});', type: 'config' },
      { label: 'K8s Events', content: 'Type: Warning  Reason: OOMKilled\nContainer used 824Mi, limit is 800Mi\nRestart count: 47 in last 7 days\nLast restart: 3 hours ago', type: 'error' },
    ],
    possibleCauses: [
      'Kubernetes memory limit is too low for the workload',
      'Memory leak from unremoved event listeners accumulating over time',
      'Node.js garbage collector is broken',
      'Too many concurrent requests for the server to handle',
    ],
    correctCauseIndex: 1,
    explanation: 'The /stream endpoint registers a new event listener for every request but never removes it when the client disconnects. Over hours, thousands of orphaned listeners accumulate, each holding references to closed response objects, causing a steady memory leak until OOM.',
    hint: 'Check the code for resource cleanup patterns. What happens when a client disconnects?',
  },
  {
    id: 3,
    title: 'The Silent Data Loss',
    description: 'Users report that form submissions sometimes "disappear" — they submit data, see a success message, but the data never appears in their account. This happens intermittently, affecting roughly 5% of submissions.',
    clues: [
      { label: 'API Logs', content: 'POST /api/forms 202 Accepted (avg 15ms)\nPublished message to queue "form-submissions"\nQueue depth: 0 → normal\nNo error responses logged', type: 'log' },
      { label: 'Worker Logs', content: 'Processing message batch (10 messages)\nERROR: Unique constraint violation on forms.email for 2 messages\nBatch NACK — 10 messages returned to queue\nRetry attempt 3/3 failed — messages sent to DLQ', type: 'error' },
      { label: 'Architecture Diagram', content: 'Flow: API → Message Queue → Worker → Database\nWorker batch size: 10 messages\nACK strategy: Batch (all-or-nothing)\nDLQ: configured but not monitored', type: 'config' },
      { label: 'Database Constraints', content: 'Table: forms\n- email: UNIQUE constraint\n- created_at: DEFAULT now()\nNo partial unique index or conflict resolution', type: 'metric' },
    ],
    possibleCauses: [
      'The API is returning false success responses',
      'Batch processing causes valid messages to be discarded when one fails due to all-or-nothing ACK',
      'The database is dropping random inserts under load',
      'Network issues between the worker and database',
    ],
    correctCauseIndex: 1,
    explanation: 'The worker processes messages in batches of 10 with all-or-nothing acknowledgment. When even one message fails (e.g., duplicate email), the entire batch of 10 is NACK\'d. After 3 retries, all 10 messages go to the unmonitored DLQ, silently losing the 8 valid submissions along with the 2 duplicates.',
    hint: 'Think about what happens to the OTHER messages in a batch when one fails.',
  },
]
