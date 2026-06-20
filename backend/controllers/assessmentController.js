import Assessment from '../models/Assessment.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// @desc    Get all assessments (with auto-seeding if empty)
// @route   GET /api/assessments
// @access  Private (Student)
export const getAssessments = async (req, res) => {
  try {
    const count = await Assessment.countDocuments({});
    if (count === 0) {
      const frontendQuestions = [
        { questionText: 'Which React Hook is specifically designed to perform side effects in functional components?', options: ['useState', 'useContext', 'useEffect', 'useMemo'], correctOption: 2 },
        { questionText: 'What does CSS specificity determine?', options: ['The font rendering speed of the page', 'Which CSS rules are applied by the browser when multiple rules match', 'The priority of loading stylesheets in HTML', 'The inheritance depth of nested block components'], correctOption: 1 },
        { questionText: 'What is the purpose of React\'s Virtual DOM?', options: ['To bypass HTML rendering constraints entirely', 'To calculate the minimum layout updates needed using diffs and optimize rendering speed', 'To enable local storage caching of DOM nodes', 'To directly manipulate browser paint timings'], correctOption: 1 },
        { questionText: 'Which ES6 method is used to create a new array with all elements that pass a test?', options: ['map()', 'forEach()', 'reduce()', 'filter()'], correctOption: 3 },
        { questionText: 'What is a closure in JavaScript?', options: ['A way to close browser windows programmatically', 'A function combined with references to its surrounding state (lexical environment)', 'An execution scope that terminates immediately on return', 'A syntax configuration that blocks access to prototype methods'], correctOption: 1 },
        { questionText: 'Which CSS layout system is ideal for 1-dimensional layouts (either a single row or column)?', options: ['CSS Grid', 'Float layouts', 'Flexbox', 'Table layouts'], correctOption: 2 },
        { questionText: 'In the JavaScript Event Loop, which of the following is executed as a microtask?', options: ['setTimeout callback', 'Promise.then callback', 'setInterval callback', 'DOM click event listener'], correctOption: 1 },
        { questionText: 'What is the difference between useMemo and useCallback in React?', options: ['useMemo memoizes a value, while useCallback memoizes a callback function', 'useMemo works with state, while useCallback works with props', 'useMemo executes on every render, while useCallback is asynchronous', 'There is no difference; they are aliases for the same function'], correctOption: 0 },
        { questionText: 'What does the "key" prop help React identify?', options: ['CSS classes for active styling transitions', 'Which items in a list have changed, been added, or been removed', 'Secure access tokens for component state databases', 'Encrypted hooks inside nested iteration loops'], correctOption: 1 },
        { questionText: 'How does an arrow function handle the "this" keyword in JavaScript?', options: ['To bind "this" to the function itself', 'To create its own dynamic "this" binding based on call arguments', 'To lexically inherits "this" from its parent execution context', 'To set "this" to undefined in strict mode'], correctOption: 2 },
        { questionText: 'Which CSS selector has the highest specificity?', options: ['An element selector (e.g., div)', 'A class selector (e.g., .container)', 'An ID selector (e.g., #header)', 'An inline style attribute'], correctOption: 3 },
        { questionText: 'What is the main benefit of code splitting in frontend frameworks?', options: ['It divides the database into multiple tables', 'It reduces the initial bundle size, speeding up page load times', 'It prevents CSS conflicts between components', 'It increases security by hiding Javascript code'], correctOption: 1 },
        { questionText: 'Which Web Vital metric measures layout stability?', options: ['LCP (Largest Contentful Paint)', 'FID (First Input Delay)', 'CLS (Cumulative Layout Shift)', 'TTFB (Time to First Byte)'], correctOption: 2 },
        { questionText: 'In React, what is the correct way to update state based on a previous state value?', options: ['setState(state + 1)', 'setState(prev => prev + 1)', 'state = state + 1', 'forceUpdate()'], correctOption: 1 },
        { questionText: 'Which header handles resource sharing between different origins in the browser?', options: ['Content-Security-Policy', 'Access-Control-Allow-Origin', 'X-Frame-Options', 'Strict-Transport-Security'], correctOption: 1 },
        { questionText: 'What is the purpose of debouncing in input event handlers?', options: ['To speed up keypress response timings', 'To delay function execution until a specified idle time has elapsed', 'To execute a callback on every single character input', 'To encrypt text entries in real-time'], correctOption: 1 },
        { questionText: 'Which state management system is based on Actions, Reducers, and a Single Store?', options: ['React Context API', 'Redux', 'MobX', 'Recoil'], correctOption: 1 },
        { questionText: 'What is hydration in modern SSR frontend architectures?', options: ['The process of loading remote assets into cache memory', 'Attaching event listeners to server-rendered static HTML in the browser', 'Compressing JavaScript bundles for fast delivery', 'Fetching data from a REST endpoint'], correctOption: 1 },
        { questionText: 'What does the CSS property "box-sizing: border-box" do?', options: ['It forces elements to have a solid outline border', 'It includes padding and borders in the element\'s total width and height', 'It resets all margins to zero', 'It clips child elements that overflow the parent container'], correctOption: 1 },
        { questionText: 'How can you prevent a parent component from re-rendering in React if its props haven\'t changed?', options: ['Wrap it in React.memo()', 'Call shouldComponentUpdate(false)', 'Use the useState updater callback', 'Use the useContext hook'], correctOption: 0 }
      ];

      const backendQuestions = [
        { questionText: 'Which node block process handles asynchronous I/O operations without blocking execution?', options: ['Cluster module thread', 'The Event Loop', 'Nginx reverse proxy', 'The process.env module'], correctOption: 1 },
        { questionText: 'What are the three parts of a JSON Web Token (JWT)?', options: ['User, Role, Expiry', 'Header, Payload, Signature', 'Key, Encrypted String, Checksum', 'Origin, Auth Method, Token ID'], correctOption: 1 },
        { questionText: 'Which Node.js core stream method is used to connect a readable stream directly to a writeable stream?', options: ['connect()', 'pipe()', 'write()', 'read()'], correctOption: 1 },
        { questionText: 'What is the primary benefit of creating an index on a database table column?', options: ['It reduces the size of the database on disk', 'It increases write performance speed', 'It increases search query execution speed', 'It automatically validates foreign key constraints'], correctOption: 2 },
        { questionText: 'In database systems, what does the "A" in ACID transaction properties stand for?', options: ['Atomicity', 'Availability', 'Accuracy', 'Authentication'], correctOption: 0 },
        { questionText: 'Which HTTP method is designed to be idempotent according to REST specifications?', options: ['POST', 'GET', 'PATCH', 'DELETE'], correctOption: 1 },
        { questionText: 'What is a CORS preflight request?', options: ['A POST request to authenticate credentials before data loading', 'An OPTIONS request sent by browsers to verify backend CORS support', 'A configuration method to cache database responses', 'A routing middleware that handles JWT parsing'], correctOption: 1 },
        { questionText: 'What is Redis commonly used for in backend web architectures?', options: ['Persistent relational database storage', 'Static file hosting', 'In-memory caching and message brokerage', 'Compiling JavaScript bundles'], correctOption: 2 },
        { questionText: 'Which type of database scaling involves adding more servers to distribute queries (horizontal partitioning)?', options: ['Sharding', 'Replication', 'Normalization', 'Indexing'], correctOption: 0 },
        { questionText: 'What is the primary threat prevented by sanitizing SQL inputs (parameterized queries)?', options: ['Cross-Site Scripting (XSS)', 'Man-in-the-middle attacks', 'SQL Injection', 'CSRF token spoofing'], correctOption: 2 },
        { questionText: 'In hashing algorithms like bcrypt, what is the purpose of adding a "salt"?', options: ['To compress the password string length', 'To prevent dictionary attacks by appending random characters before hashing', 'To encrypt the password using a symmetric key', 'To speed up hash comparison times during login validation'], correctOption: 1 },
        { questionText: 'Which Node.js module is used to run multiple instances of a server that share the same port?', options: ['fs', 'http', 'cluster', 'path'], correctOption: 2 },
        { questionText: 'What does a Database Connection Pool do?', options: ['It hosts databases on multiple remote servers', 'It maintains a cache of active database connections to reuse instead of creating new ones constantly', 'It replicates data from master to slave nodes', 'It encrypts database network traffic'], correctOption: 1 },
        { questionText: 'Which protocol enables full-duplex persistent communication channels over a single TCP connection?', options: ['HTTP/1.1 polling', 'WebSockets', 'REST over HTTPS', 'gRPC unary calls'], correctOption: 1 },
        { questionText: 'What is the N+1 query problem in Object-Relational Mapping (ORM) frameworks?', options: ['When too many tables are joined concurrently', 'When a query fetches parent records, and then executes a separate query for each parent\'s children', 'When a transaction violates ACID constraints', 'When database connections exceed the pool limit'], correctOption: 1 },
        { questionText: 'Which Express.js method is called to pass control to the next middleware function?', options: ['send()', 'next()', 'end()', 'redirect()'], correctOption: 1 },
        { questionText: 'What is the purpose of a reverse proxy like Nginx in front of a Node.js server?', options: ['To run SQL database queries faster', 'To perform load balancing, handle SSL termination, and serve static assets efficiently', 'To compile TypeScript code in production', 'To generate JWT authentication keys'], correctOption: 1 },
        { questionText: 'What is rate limiting used for in web APIs?', options: ['To speed up slow database connections', 'To control the amount of incoming traffic and protect the server from abuse', 'To compress API response payloads', 'To index search fields dynamically'], correctOption: 1 },
        { questionText: 'In relational databases, what does a foreign key enforce?', options: ['Domain integrity', 'Referential integrity', 'User authorization', 'Encryption constraints'], correctOption: 1 },
        { questionText: 'What is the main function of Docker in backend deployment?', options: ['To host cloud databases', 'To package an application with its dependencies into an isolated container that runs consistently anywhere', 'To optimize Javascript runtime execution speeds', 'To implement OAuth 2.0 validation flow'], correctOption: 1 }
      ];

      const fullstackQuestions = [
        { questionText: 'What does Server-Side Rendering (SSR) do in web applications?', options: ['It loads database tables directly in browser local storage', 'It generates complete HTML pages on the server for each request, improving SEO and initial paint speeds', 'It runs JavaScript logic exclusively in web workers', 'It caches JSON payloads inside a CDN'], correctOption: 1 },
        { questionText: 'Which of the following is a key security attribute for session cookies to prevent XSS theft?', options: ['Secure', 'HttpOnly', 'SameSite', 'Max-Age'], correctOption: 1 },
        { questionText: 'What is the main advantage of GraphQL over REST APIs?', options: ['It connects directly to the database without a server', 'It allows clients to query exactly the data they need, avoiding over-fetching and under-fetching', 'It is faster because it uses XML formatting', 'It secures endpoints automatically using SSL'], correctOption: 1 },
        { questionText: 'What does Cross-Site Scripting (XSS) involve?', options: ['Injecting malicious SQL queries into database forms', 'Injecting malicious client-side scripts into web pages viewed by other users', 'Sending spoofed requests from an authenticated user\'s browser', 'Intercepting network traffic between server and client'], correctOption: 1 },
        { questionText: 'How does Cross-Site Request Forgery (CSRF) differ from XSS?', options: ['CSRF involves SQL injection, whereas XSS involves CSS styles', 'CSRF tricks an authenticated user into executing unwanted actions, while XSS injects scripts to steal data', 'CSRF only affects mobile applications, while XSS affects desktop browsers', 'CSRF is a backend database vulnerability, while XSS is a frontend CSS bug'], correctOption: 1 },
        { questionText: 'What is the purpose of Database Migrations in team software development?', options: ['To copy data from local database to cloud hosting', 'To version-control schema changes and keep database structures synchronized across developers', 'To convert relational database structures to NoSQL models', 'To automate database backups'], correctOption: 1 },
        { questionText: 'What is Static Site Generation (SSG) in Next.js?', options: ['Generating pages dynamically on every request', 'Pre-rendering pages at build time into static HTML files', 'Generating components in the browser cache using service workers', 'Connecting React state directly to MongoDB'], correctOption: 1 },
        { questionText: 'What is the standard OAuth 2.0 flow recommended for web applications using a backend API?', options: ['Implicit Grant Flow', 'Authorization Code Grant Flow with PKCE', 'Resource Owner Password Credentials Flow', 'Client Credentials Flow'], correctOption: 1 },
        { questionText: 'What is the purpose of a CDN (Content Delivery Network)?', options: ['To store user profile records in SQL', 'To cache and serve static assets (images, CSS, JS) from edge servers closer to users, reducing latency', 'To run Node.js backend processes', 'To execute AI models dynamically'], correctOption: 1 },
        { questionText: 'In fullstack deployment, what is a "cold start" in Serverless Functions?', options: ['When a function takes longer to execute because the server temperature is low', 'The delay when a function is invoked after being idle, because the cloud provider must spin up a new container instance', 'A server boot error caused by memory leaks', 'The initial compilation of Javascript bundles'], correctOption: 1 },
        { questionText: 'Which cookie attribute prevents the cookie from being sent in cross-site requests, protecting against CSRF?', options: ['HttpOnly', 'Secure', 'SameSite', 'Path'], correctOption: 2 },
        { questionText: 'What is optimistic UI updating?', options: ['Updating the database before verifying user input', 'Instantly updating the frontend UI assuming the backend request will succeed, reverting it only if it fails', 'Caching React components in LocalStorage', 'Rendering loader animations on every page navigation'], correctOption: 1 },
        { questionText: 'What does API Gateway pattern provide in a Microservices architecture?', options: ['Direct client-to-database querying channels', 'A single entry point for clients, routing requests to appropriate backend microservices', 'Automatic SQL query optimization', 'Encryption for server hard drives'], correctOption: 1 },
        { questionText: 'What is database replication Master-Slave pattern used for?', options: ['To speed up write operations by writing to all servers simultaneously', 'To improve read scalability and fault tolerance by writing to Master and reading from Slaves', 'To convert SQL databases into graph databases', 'To version-control database schemas'], correctOption: 1 },
        { questionText: 'What is the main role of Service Workers in Progressive Web Apps (PWAs)?', options: ['To execute complex SQL queries in the background', 'To intercept network requests, manage caching, and enable offline functionality', 'To render CSS animations', 'To execute security updates'], correctOption: 1 },
        { questionText: 'Which HTTP status code is returned when a requested resource is successfully created?', options: ['200 OK', '201 Created', '202 Accepted', '204 No Content'], correctOption: 1 },
        { questionText: 'Why would a developer denormalize a database schema?', options: ['To minimize data redundancy and keep tables small', 'To improve read performance by avoiding complex table joins at the cost of redundancy', 'To enforce referential integrity constraints', 'To encrypt data columns'], correctOption: 1 },
        { questionText: 'What is the purpose of a Webhook?', options: ['To connect browsers to databases via sockets', 'To send real-time data notifications from one server application to another via HTTP POST on event occurrence', 'To execute client-side Javascript scripts', 'To parse JWT structures'], correctOption: 1 },
        { questionText: 'What is CI/CD in modern software operations?', options: ['Customer Integration / Client Delivery', 'Continuous Integration and Continuous Deployment/Delivery', 'Coding Instructions / Compilation Details', 'Cloud Infrastructure / Database Connections'], correctOption: 1 },
        { questionText: 'What does HTTPS add to standard HTTP to secure communication?', options: ['JSON format compression', 'SSL/TLS encryption for data transmission', 'Strict CORS origin validations', 'Cookie tracking blocks'], correctOption: 1 }
      ];

      const softwareQuestions = [
        { questionText: 'What is the worst-case time complexity of Quick Sort algorithm?', options: ['O(N log N)', 'O(N)', 'O(N^2)', 'O(log N)'], correctOption: 2 },
        { questionText: 'What is the average search time complexity in a balanced Binary Search Tree (BST)?', options: ['O(N)', 'O(log N)', 'O(1)', 'O(N^2)'], correctOption: 1 },
        { questionText: 'Which OOP concept allows a subclass to provide a specific implementation of a method defined in its superclass?', options: ['Method Overloading', 'Method Overriding', 'Encapsulation', 'Abstraction'], correctOption: 1 },
        { questionText: 'What is encapsulation in Object-Oriented Programming?', options: ['Creating multiple instances of a class', 'Grouping data (fields) and the methods that operate on them into a single unit (class), restricting direct access', 'Inheriting fields from parent interface components', 'Converting code objects into JSON strings'], correctOption: 1 },
        { questionText: 'In SOLID design principles, what does the Single Responsibility Principle state?', options: ['A function should only take one parameter', 'A class should have only one reason to change, meaning it should perform only one cohesive job', 'An application should use only one central database', 'A developer should write code in a single file'], correctOption: 1 },
        { questionText: 'What does the Liskov Substitution Principle declare?', options: ['Variables should be substituted with constant values during execution', 'Subtypes must be substitutable for their base types without altering program correctness', 'Classes must be closed for modification but open for extension', 'Databases should support automatic failover substitution'], correctOption: 1 },
        { questionText: 'Which software design pattern restricts class instantiation to a single object instance globally?', options: ['Factory Pattern', 'Singleton Pattern', 'Observer Pattern', 'Strategy Pattern'], correctOption: 1 },
        { questionText: 'What is the core idea of the Observer Design Pattern?', options: ['To build secure monitoring logs for backend actions', 'To define a one-to-many dependency where state changes in one object notify and update all observers automatically', 'To run code tests in a sandbox environment', 'To restrict write access to class parameters'], correctOption: 1 },
        { questionText: 'How does git rebase differ from git merge?', options: ['Git merge creates a merge commit, whereas git merge changes history', 'Git rebase rewrites project history by applying commits on top of another branch, making a clean linear commit log', 'Git rebase only works on local files, whereas git merge works with cloud records', 'Git rebase deletes branches, whereas git merge keeps them'], correctOption: 1 },
        { questionText: 'What is the difference between Unit Testing and Integration Testing?', options: ['Unit testing tests separate functions in isolation, whereas Integration testing tests how multiple modules work together', 'Unit testing is done by developers, while Integration testing is done by clients', 'Unit testing requires database connections, while Integration testing does not', 'Unit testing only runs in production environments'], correctOption: 0 },
        { questionText: 'What is the time complexity to retrieve an element from a Hash Map average case?', options: ['O(N)', 'O(log N)', 'O(1)', 'O(N log N)'], correctOption: 2 },
        { questionText: 'What is a race condition in multi-threaded programming?', options: ['When one thread executes faster than another', 'When multiple threads access shared data concurrently and the final outcome depends on the timing of execution', 'When database connections exceed server limits', 'When a thread runs into an infinite loop'], correctOption: 1 },
        { questionText: 'What is a memory leak in programming?', options: ['When physical hard drive sectors fail', 'When allocated memory is no longer needed but is not released, reducing available system memory over time', 'When data is leaked to external database systems', 'When execution speed drops due to thermal throttling'], correctOption: 1 },
        { questionText: 'Which data structure follows the Last-In-First-Out (LIFO) access pattern?', options: ['Queue', 'Stack', 'Linked List', 'Binary Tree'], correctOption: 1 },
        { questionText: 'What is the prerequisite condition before executing Binary Search on an array?', options: ['The array must contain only integers', 'The array elements must be sorted', 'The array size must be a power of 2', 'The array must be empty'], correctOption: 1 },
        { questionText: 'What is the main difference between an Abstract Class and an Interface?', options: ['An abstract class can contain state (fields) and concrete method implementations, while an interface typically only defines method signatures', 'Abstract classes are used in Java, while Interfaces are used in JavaScript', 'Abstract classes run faster than interfaces', 'Classes can extend multiple abstract classes, but implement only one interface'], correctOption: 0 },
        { questionText: 'Which graph traversal algorithm uses a Queue to explore neighbor nodes level-by-level?', options: ['Depth-First Search (DFS)', 'Breadth-First Search (BFS)', 'Dijkstra\'s Algorithm', 'Binary Search'], correctOption: 1 },
        { questionText: 'What is the primary characteristic of an Agile Software Development Lifecycle?', options: ['Completing all coding stages in a single phase before delivery', 'Iterative development, quick adjustments, and continuous feedback loops', 'Hiring database administrators for every module', 'Restricting user interactions until final release'], correctOption: 1 },
        { questionText: 'What does the space complexity of an algorithm measure?', options: ['The physical space the compiled application occupies on the hard drive', 'The amount of memory an algorithm needs to run to completion as a function of the input size', 'The width of tables in SQL databases', 'The layout width of CSS grid components'], correctOption: 1 },
        { questionText: 'What is the time complexity of searching for an item in a sorted array using Binary Search?', options: ['O(N)', 'O(N^2)', 'O(log N)', 'O(1)'], correctOption: 2 }
      ];

      await Assessment.create([
        { title: 'Frontend Developer Skill Certification', category: 'Coding', description: 'Test your capabilities in React.js, modern ES6+ Javascript, CSS layout architectures, DOM profiling, and performance vitals.', duration: 20, questions: frontendQuestions },
        { title: 'Backend Systems Engineering', category: 'Coding', description: 'Evaluate your knowledge of Node.js asynchronous event loop, Express routing, SQL/NoSQL databases, security practices (JWT/CORS), and caching mechanisms.', duration: 20, questions: backendQuestions },
        { title: 'Full-Stack Development Challenge', category: 'Coding', description: 'Showcase your skills in end-to-end integration, SSR (Next.js), auth flows (OAuth 2.0), web sockets, deployment configurations, and general system design.', duration: 20, questions: fullstackQuestions },
        { title: 'Software Developer Core Certification', category: 'Coding', description: 'Demonstrate competency in core computer science subjects: Data Structures, Algorithms complexity (Big O), OOP, SOLID design patterns, Git workflow, and testing methods.', duration: 20, questions: softwareQuestions }
      ]);
    }

    // Return assessments listing without exposing correct answers
    const assessments = await Assessment.find({}, { 'questions.correctOption': 0 });
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get assessment details by ID (hiding correctOption)
// @route   GET /api/assessments/:id
// @access  Private (Student)
export const getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id, { 'questions.correctOption': 0 });
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    res.json(assessment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit answers & evaluate score
// @route   POST /api/assessments/:id/submit
// @access  Private (Student)
export const submitAssessment = async (req, res) => {
  const { answers } = req.body; // array of selected indexes, e.g. [3, 3, 0]

  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    if (!Array.isArray(answers) || answers.length !== assessment.questions.length) {
      return res.status(400).json({ message: 'Invalid response format or incomplete answers' });
    }

    // Evaluate answers
    let correctCount = 0;
    assessment.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctOption) {
        correctCount += 1;
      }
    });

    const scorePercentage = Math.round((correctCount / assessment.questions.length) * 100);

    // Save submission
    assessment.submissions.push({
      student: req.user._id,
      score: scorePercentage,
    });
    await assessment.save();

    // Trigger backend notification
    await Notification.create({
      recipient: req.user._id,
      title: 'Assessment Cleared! 🎓',
      message: `You completed "${assessment.title}" with a score of ${scorePercentage}%. Keep up the good work!`,
    });

    res.status(200).json({
      message: 'Assessment submitted successfully!',
      score: scorePercentage,
      correctCount,
      totalQuestions: assessment.questions.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get top student scores prep leaderboard
// @route   GET /api/assessments/leaderboard
// @access  Private (Student)
export const getLeaderboard = async (req, res) => {
  try {
    const assessments = await Assessment.find({});
    
    // Group scores by student ID
    const studentScoreMap = {};

    assessments.forEach((assessment) => {
      assessment.submissions.forEach((sub) => {
        const studentId = sub.student.toString();
        if (!studentScoreMap[studentId]) {
          studentScoreMap[studentId] = {
            scores: [],
            completedCount: 0,
          };
        }
        studentScoreMap[studentId].scores.push(sub.score);
        studentScoreMap[studentId].completedCount += 1;
      });
    });

    // Fetch user details for each student
    const studentIds = Object.keys(studentScoreMap);
    const users = await User.find({ _id: { $in: studentIds } }, 'name email');

    const leaderboard = users.map((user) => {
      const stats = studentScoreMap[user._id.toString()];
      const averageScore = Math.round(
        stats.scores.reduce((sum, val) => sum + val, 0) / stats.scores.length
      );
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        averageScore,
        testsCompleted: stats.completedCount,
      };
    });

    // Sort by average score descending
    leaderboard.sort((a, b) => b.averageScore - a.averageScore);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
