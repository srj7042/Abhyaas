export interface TrainingChallenge {
  id: string
  title: string
  category: 'coding' | 'mcqs' | 'sql' | 'debugging'
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  roles: string[] // e.g. ['AI Engineer', 'Software Engineer', 'Backend Developer', 'Frontend Developer', 'Fullstack Developer']
  question: string
  codeSnippet?: string
  options?: string[] // Optional for open text entries
  correctAnswer: string // Exact string or option index (string format)
  explanation: string
  hint: string
}

export const trainingChallenges: TrainingChallenge[] = [
  // ==================== CODING PROBLEMS ====================
  {
    id: 'code-1',
    title: 'Array Mapping',
    category: 'coding',
    topic: 'JavaScript Fundamentals',
    difficulty: 'easy',
    roles: ['Software Engineer', 'Frontend Developer', 'Fullstack Developer'],
    question: 'Complete the arrow function to double each number in the array.',
    codeSnippet: 'const doubleAll = (arr) => arr.map(x => /* missing code */);',
    options: ['x * 2', 'x => x * 2', 'return x * 2', 'x * x'],
    correctAnswer: '0',
    explanation: 'The map method takes a callback function. Since the arrow function is `x => ...`, the expression to double each element is simply `x * 2`.',
    hint: 'Multiply the element x by 2.'
  },
  {
    id: 'code-2',
    title: 'Object Destructuring',
    category: 'coding',
    topic: 'ES6 Syntax',
    difficulty: 'easy',
    roles: ['Software Engineer', 'Frontend Developer', 'Fullstack Developer'],
    question: 'How do you extract the property "username" from a user object using destructuring?',
    codeSnippet: 'const user = { id: 1, username: "dev123" };\n// Write the destructuring line below to get "username":\nconst { /* missing code */ } = user;',
    options: ['username', ':username', 'username: name', 'user.username'],
    correctAnswer: '0',
    explanation: 'Object destructuring syntax matches the property key: `const { username } = user;`.',
    hint: 'Use the exact property name inside curly braces.'
  },
  {
    id: 'code-3',
    title: 'Python List Comprehension',
    category: 'coding',
    topic: 'Python',
    difficulty: 'medium',
    roles: ['AI Engineer', 'Data Scientist', 'Software Engineer'],
    question: 'Complete the Python list comprehension to filter for numbers greater than 5.',
    codeSnippet: 'numbers = [2, 4, 6, 8, 10]\nfiltered = [num for num in numbers if /* missing code */]',
    options: ['num > 5', 'if num > 5', 'num for num > 5', 'numbers > 5'],
    correctAnswer: '0',
    explanation: 'List comprehension syntax in Python is `[item for item in iterable if condition]`. The condition is `num > 5`.',
    hint: 'Write a basic boolean check comparing num and 5.'
  },
  {
    id: 'code-4',
    title: 'React useState Hook',
    category: 'coding',
    topic: 'React Hooks',
    difficulty: 'easy',
    roles: ['Frontend Developer', 'Fullstack Developer'],
    question: 'Complete the useState initialization line to set the default count to 0.',
    codeSnippet: 'const [count, setCount] = /* missing code */(0);',
    options: ['useState', 'React.state', 'React.useState', 'createState'],
    correctAnswer: '0',
    explanation: 'The React hook for managing local state is called `useState`.',
    hint: 'It is imported directly from the "react" package.'
  },
  {
    id: 'code-5',
    title: 'Model Train Function',
    category: 'coding',
    topic: 'Machine Learning',
    difficulty: 'hard',
    roles: ['AI Engineer', 'Data Scientist'],
    question: 'In PyTorch, which method must you call on the optimizer to reset gradients to zero before backpropagation?',
    codeSnippet: 'optimizer = torch.optim.SGD(model.parameters(), lr=0.01)\n# Loop start...\noptimizer./* missing method */()\nloss.backward()\noptimizer.step()',
    options: ['zero_grad', 'reset_grad', 'clear_grad', 'zero_gradients'],
    correctAnswer: '0',
    explanation: '`optimizer.zero_grad()` resets the gradients of all optimized variables to zero. This is crucial because gradients accumulate by default.',
    hint: 'The method starts with "zero_" and is followed by the short name for gradients.'
  },

  // ==================== MCQS ====================
  {
    id: 'mcq-1',
    title: 'Rest vs Spread',
    category: 'mcqs',
    topic: 'JavaScript Advanced',
    difficulty: 'medium',
    roles: ['Software Engineer', 'Frontend Developer', 'Fullstack Developer'],
    question: 'What is the primary difference between the Spread operator and the Rest parameter?',
    options: [
      'Spread packs elements into an array; Rest unpacks them.',
      'Spread unpacks elements from an array/object; Rest gathers multiple elements into a single array.',
      'Spread is only for objects; Rest is only for arrays.',
      'There is no difference; they are identical.'
    ],
    correctAnswer: '1',
    explanation: 'Spread `...` expands/unpacks iterable elements, whereas Rest `...` collects multiple arguments or properties into a single array/object container.',
    hint: 'Think about spreading crumbs vs gathering the rest of the items.'
  },
  {
    id: 'mcq-2',
    title: 'Overfitting Mitigation',
    category: 'mcqs',
    topic: 'Deep Learning',
    difficulty: 'medium',
    roles: ['AI Engineer', 'Data Scientist'],
    question: 'Which of the following techniques is NOT used to prevent overfitting in deep neural networks?',
    options: [
      'L2 Regularization (Weight Decay)',
      'Dropout',
      'Data Augmentation',
      'Increasing the learning rate to 10.0'
    ],
    correctAnswer: '3',
    explanation: 'Increasing the learning rate to an extremely high value like 10.0 will cause the gradient descent to diverge and fail, rather than regularize or mitigate overfitting.',
    hint: 'Look for a technique that would destabilize gradient descent optimization.'
  },
  {
    id: 'mcq-3',
    title: 'REST Idempotency',
    category: 'mcqs',
    topic: 'Web Services',
    difficulty: 'medium',
    roles: ['Software Engineer', 'Backend Developer', 'Fullstack Developer'],
    question: 'Which of the following HTTP methods is considered non-idempotent by definition?',
    options: ['GET', 'PUT', 'DELETE', 'POST'],
    correctAnswer: '3',
    explanation: 'POST is non-idempotent because making multiple identical POST requests will result in creating multiple new resources, whereas GET, PUT, and DELETE have idempotent side-effects.',
    hint: 'Which HTTP method is typically used to create a new resource on every invocation?'
  },
  {
    id: 'mcq-4',
    title: 'Redis Use Cases',
    category: 'mcqs',
    topic: 'System Design',
    difficulty: 'easy',
    roles: ['Software Engineer', 'Backend Developer', 'Fullstack Developer'],
    question: 'What is Redis primarily used for in modern web architectures?',
    options: [
      'Long-term archival storage',
      'In-memory caching and session management',
      'Heavy relational analytical queries (OLAP)',
      'Running machine learning inference'
    ],
    correctAnswer: '1',
    explanation: 'Redis is an open-source, in-memory data structure store used widely as a database, cache, and message broker.',
    hint: 'It is highly performant because it stores data in RAM.'
  },

  // ==================== SQL & DATABASE DESIGN ====================
  {
    id: 'sql-1',
    title: 'Inner Joins',
    category: 'sql',
    topic: 'SQL Joins',
    difficulty: 'easy',
    roles: ['Software Engineer', 'Backend Developer', 'Fullstack Developer', 'Data Scientist', 'AI Engineer'],
    question: 'Write the query clause to join the "users" table with the "profiles" table on the user ID column.',
    codeSnippet: 'SELECT users.email, profiles.full_name\nFROM users\n/* missing join clause */ profiles ON users.id = profiles.user_id;',
    options: ['INNER JOIN', 'OUTER JOIN', 'LEFT JOIN', 'UNION'],
    correctAnswer: '0',
    explanation: 'INNER JOIN returns rows when there is a match in both tables. Since we are matching `users.id = profiles.user_id`, this completes the inner join syntax.',
    hint: 'The most common join type.'
  },
  {
    id: 'sql-2',
    title: 'Aggregate Functions',
    category: 'sql',
    topic: 'SQL Aggregations',
    difficulty: 'medium',
    roles: ['Software Engineer', 'Backend Developer', 'Fullstack Developer', 'Data Scientist'],
    question: 'Which SQL keyword must you use to filter aggregated results computed by a GROUP BY clause?',
    options: ['WHERE', 'HAVING', 'FILTER', 'LIMIT'],
    correctAnswer: '1',
    explanation: 'The `HAVING` clause is used instead of `WHERE` to filter groups or aggregate values (e.g. `HAVING COUNT(id) > 5`).',
    hint: 'Starts with an H and filters groups.'
  },
  {
    id: 'sql-3',
    title: 'ACID Properties',
    category: 'sql',
    topic: 'Database Transactions',
    difficulty: 'hard',
    roles: ['Software Engineer', 'Backend Developer', 'Fullstack Developer'],
    question: 'Which ACID property guarantees that database changes made by a committed transaction survive crashes and hardware failures?',
    options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
    correctAnswer: '3',
    explanation: 'Durability ensures that once a transaction has been committed, it will remain in the database even in the event of a system crash.',
    hint: 'A word related to how long-lasting a building or material is.'
  },

  // ==================== DEBUGGING SCENARIOS ====================
  {
    id: 'debug-1',
    title: 'Asynchronous Foreach',
    category: 'debugging',
    topic: 'Async JavaScript',
    difficulty: 'hard',
    roles: ['Software Engineer', 'Backend Developer', 'Fullstack Developer', 'Frontend Developer'],
    question: 'Why does this code print "Done!" BEFORE fetching all users?',
    codeSnippet: 'async function fetchAll(ids) {\n  ids.forEach(async (id) => {\n    const user = await api.getUser(id);\n    console.log(user.name);\n  });\n  console.log("Done!");\n}',
    options: [
      'forEach does not wait for async callback functions to resolve',
      'api.getUser is not a real promise',
      'Done! is printed inside the forEach block',
      'The function should be marked generator instead of async'
    ],
    correctAnswer: '0',
    explanation: '`Array.prototype.forEach` is not designed for promise orchestration. It calls the async callback synchronously and immediately executes the trailing code. Use `for...of` or `Promise.all(ids.map(...))` instead.',
    hint: 'forEach is a synchronous array iterator that discards returned Promises.'
  },
  {
    id: 'debug-2',
    title: 'React State Mutation',
    category: 'debugging',
    topic: 'React State',
    difficulty: 'medium',
    roles: ['Frontend Developer', 'Fullstack Developer'],
    question: 'Why does the React UI fail to re-render when a new item is added to the list?',
    codeSnippet: 'const [items, setItems] = useState([1, 2]);\n\nconst addItem = (item) => {\n  items.push(item);\n  setItems(items);\n};',
    options: [
      'Push is not a function on state arrays',
      'setItems mutated the original array reference, so React assumes no state change',
      'addItem should return a new list',
      'useState requires objects, not arrays'
    ],
    correctAnswer: '1',
    explanation: 'React compares state values using reference equality. By mutating the existing `items` array with `push` and calling `setItems(items)`, the reference remains unchanged, causing React to skip re-rendering. Fix: `setItems([...items, item])`.',
    hint: 'Directly mutating React state bypasses the virtual DOM detection.'
  },
  {
    id: 'debug-3',
    title: 'Python Mutable Default Arguments',
    category: 'debugging',
    topic: 'Python Gotchas',
    difficulty: 'hard',
    roles: ['AI Engineer', 'Data Scientist', 'Software Engineer'],
    question: 'Why does calling `append_to(1)` twice yield `[1, 1]` instead of `[1]`?',
    codeSnippet: 'def append_to(element, target=[]):\n    target.append(element)\n    return target\n\nprint(append_to(1)) # Output: [1]\nprint(append_to(1)) # Output: [1, 1]',
    options: [
      'The default list parameter is instantiated only once at function definition time',
      'target is a global variable',
      'Python does not support list appending',
      'target is immutable'
    ],
    correctAnswer: '0',
    explanation: 'In Python, default arguments are evaluated once when the function is defined. A mutable default like `target=[]` is shared across all calls, accumulating values.',
    hint: 'Python evaluates the parameter default expression exactly once when importing/defining the function.'
  }
]
