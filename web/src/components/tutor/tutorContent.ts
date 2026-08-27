export interface GeneratedTutorContent {
  explanation: string
  analogy: string
  keyTakeaway: string
  socraticProblem: string
  socraticGuidingQuestion: string
  interviewQuestion: string
  interviewDescription: string
  flashcardQuestion: string
  flashcardAnswer: string
  mentorProjectFocus: string
}

export const getFallbackContent = (moduleTitle: string, careerGoal: string): GeneratedTutorContent => {
  const title = moduleTitle.toLowerCase()

  if (title.includes('math') || title.includes('stat') || title.includes('probab')) {
    return {
      explanation: 'Mathematical foundations (Linear Algebra, Calculus, and Probability) form the core of machine learning parameters, defining how models optimize and evaluate data representations.',
      analogy: 'Imagine building a skyscraper. Math and statistics are the bedrock foundations and steel frames. Without them, any complex structure you build on top will collapse under stress.',
      keyTakeaway: 'Understanding vector dot products, partial derivatives, and probability distributions prevents models from being treated as black boxes.',
      socraticProblem: 'How do we mathematically measure the rate of change of a multi-variable function at a specific point?',
      socraticGuidingQuestion: 'Recall single-variable calculus rates of change. When we have multiple dimensions, what operator extends the derivative to compute rates of change across all axes simultaneously?',
      interviewQuestion: 'Explain the difference between L1 (Manhattan) and L2 (Euclidean) distance metrics.',
      interviewDescription: 'How do these metrics behave under high dimensionality, and what are their corresponding geometric interpretations?',
      flashcardQuestion: 'What is the derivative of the sigmoid activation function in terms of its output?',
      flashcardAnswer: 'σ(x) * (1 - σ(x))',
      mentorProjectFocus: `Build a Matrix Multiplication and Linear Regression solver from scratch using native arrays to understand vector arithmetic.`
    }
  }

  if (title.includes('python') || title.includes('programm') || title.includes('cod')) {
    return {
      explanation: 'Python is the industry standard for machine learning, offering high-level readability, extensive libraries (NumPy, Pandas, PyTorch), and powerful scripting flexibility.',
      analogy: 'Think of Python as a universal remote control. By itself, it is simple and lightweight. But with the right attachments (packages), it can control and orchestrate any device or data scale.',
      keyTakeaway: 'Mastering generators, list comprehensions, decorators, and memory-efficient iterations is key to handling heavy datasets.',
      socraticProblem: 'How can we process a 10GB CSV file in Python on a system with only 4GB of RAM?',
      socraticGuidingQuestion: 'If loading the entire file into memory causes an OOM error, how can we stream the file line-by-line or in chunks using standard iterators?',
      interviewQuestion: 'What is the Difference between a List and a Generator in Python?',
      interviewDescription: 'Contrast memory footprint, execution speed, and use cases for large collections.',
      flashcardQuestion: 'What is the purpose of the Python global interpreter lock (GIL)?',
      flashcardAnswer: 'It limits execution to a single thread at a time per process to ensure thread safety.',
      mentorProjectFocus: `Create an asynchronous web scraper that harvests technical job posts, parses skills, and aggregates them into a database.`
    }
  }

  if (title.includes('regression') || title.includes('linear') || title.includes('gradient') || title.includes('optimiz')) {
    return {
      explanation: 'Linear regression models the relationship between dependent target variables and independent predictors. Optimization techniques like Gradient Descent systematically minimize cost functions.',
      analogy: 'Imagine you are blindfolded on a foggy hill. To find the lowest valley (minimum cost), you feel the slope under your feet and take a step downwards. Repeating this step-by-step leads you to the base.',
      keyTakeaway: 'The learning rate governs the size of optimization steps. Too high, and you overshoot the minimum; too low, and training takes forever.',
      socraticProblem: 'What happens to Gradient Descent if our learning rate parameter is set to 10.0?',
      socraticGuidingQuestion: 'If the step size is larger than the local gradient slope, will the algorithm converge to the valley or bounce and diverge upwards?',
      interviewQuestion: 'Explain the bias-variance tradeoff in linear models.',
      interviewDescription: 'How does model complexity affect training versus validation errors?',
      flashcardQuestion: 'What does ordinary least squares (OLS) attempt to minimize?',
      flashcardAnswer: 'The sum of squared residuals (differences between observed and predicted values).',
      mentorProjectFocus: `Develop a Gradient Descent optimizer from scratch using basic arrays to predict housing values.`
    }
  }

  if (title.includes('neural') || title.includes('deep') || title.includes('network') || title.includes('nlp') || title.includes('cnn') || title.includes('transformers')) {
    return {
      explanation: 'Neural networks are layered architectures inspired by biological synapses. Deep neural networks extract hierarchies of features from data to solve complex non-linear problems.',
      analogy: 'Imagine a assembly line. The first worker checks basic shapes, the next checks textures, the third identifies components, and the final inspector stamps the product label.',
      keyTakeaway: 'Backpropagation uses the chain rule to distribute loss gradients backward from the output layer to update all network weights.',
      socraticProblem: 'Why does adding too many layers to a standard feedforward neural network sometimes degrade performance?',
      socraticGuidingQuestion: 'Consider multiplying values between 0 and 1 repeatedly during backpropagation. What happens to the gradient magnitude as it travels backward through 50 layers?',
      interviewQuestion: 'What is the vanishing gradient problem and how do we resolve it?',
      interviewDescription: 'Discuss activation functions (ReLU) and architecture styles (residual connections).',
      flashcardQuestion: 'Which activation function outputs values in the range of -1 to 1?',
      flashcardAnswer: 'Tanh (Hyperbolic Tangent)',
      mentorProjectFocus: `Fine-tune a pretrained BERT model on custom feedback sentiment datasets and deploy it as a REST endpoint.`
    }
  }

  // Fallback / default
  return {
    explanation: `This module covers the core specifications of "${moduleTitle}". Applying these principles enables you to design highly scalable systems matching ${careerGoal} targets.`,
    analogy: 'Think of learning this concept like learning to read sheet music. It seems abstract at first, but once mastered, you can play and compose complex symphonies effortlessly.',
    keyTakeaway: 'Consistently reviewing core topics and writing active code solutions is the fastest path to mastery.',
    socraticProblem: `How does this concept apply to real-world architectures in the field of ${careerGoal}?`,
    socraticGuidingQuestion: 'What are the main constraints (memory, speed, bandwidth) we face when implementing this in production?',
    interviewQuestion: `How would you describe the significance of this module in a technical interview for a ${careerGoal} role?`,
    interviewDescription: 'Provide practical performance metrics or trade-offs that a senior developer should consider.',
    flashcardQuestion: `What is the primary objective of studying ${moduleTitle}?`,
    flashcardAnswer: `To acquire the operational skills needed to build and scale systems in ${careerGoal}.`,
    mentorProjectFocus: `Develop a clean git repository demonstrating an implementation of ${moduleTitle} and write unit tests.`
  }
}
