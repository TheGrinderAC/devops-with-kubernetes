const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Image caching configuration
const IMAGE_DIR = path.join(__dirname, "storage");
const IMAGE_PATH = path.join(IMAGE_DIR, "image.jpg");
const TEN_MINUTES_IN_MS = 10 * 60 * 1000;

// Create storage directory if it doesn't exist
if (!fs.existsSync(IMAGE_DIR)) {
  fs.mkdirSync(IMAGE_DIR);
}

let lastRequestTime = 0;

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Helper function to serve cached image
function serveImage(res) {
  try {
    const imageBuffer = fs.readFileSync(IMAGE_PATH);
    res.set("Content-Type", "image/jpeg");
    res.send(imageBuffer);
  } catch (error) {
    console.error("Error serving image from cache:", error);
    res.status(500).send("Error serving image");
  }
}

// Updated main route with image display
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>The project App</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
          }
          .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .image-container {
            text-align: center;
            margin: 20px 0;
          }
          .main-image {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
          .subtitle {
            color: #666;
            font-size: 18px;
            margin-top: 20px;
            text-align: center;
          }
          .refresh-btn {
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 20px;
          }
          .refresh-btn:hover {
            background-color: #0056b3;
          }
          .todo-container {
            margin-top: 30px;
          }
          .todo-container h2 {
            color: #333;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .todo-container form {
            display: flex;
            margin-bottom: 20px;
          }
          .todo-container input[type="text"] {
            flex-grow: 1;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 16px;
          }
          .todo-container button {
            background-color: #28a745;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin-left: 10px;
          }
          .todo-container button:hover {
            background-color: #218838;
          }
          .todo-list {
            list-style-type: none;
            padding: 0;
          }
          .todo-list li {
            background-color: #fff;
            padding: 15px;
            border-bottom: 1px solid #eee;
            font-size: 18px;
          }
          .todo-list li:last-child {
            border-bottom: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>The project App</h1>
          
          <div class="image-container">
            <img src="/image" alt="Random Project Image" class="main-image">
          </div>
          
          <p class="subtitle">DevOps with Kubernetes 2025</p>

          <div class="todo-container">
            <h2>My Todos</h2>
            <form action="/todos" method="post">
              <input type="text" name="todo" placeholder="Add a new todo..." maxlength="140">
              <button type="submit">Send</button>
            </form>
            <ul class="todo-list">
              <!-- Todos will be rendered here -->
            </ul>
          </div>

          <script>
            fetch('/todos')
              .then(response => response.json())
              .then(todos => {
                const todoList = document.querySelector('.todo-list');
                todoList.innerHTML = todos.map(todo => \`<li>\${todo}</li>\`).join('');
              })
              .catch(error => console.error('Error fetching todos:', error));
          </script>
        
        </div>
      </body>
    </html>
  `);
});

// Image endpoint with intelligent caching
app.get("/image", async (req, res) => {
  const now = Date.now();
  let stats;

  // Step 1: Check if cached image file exists
  try {
    stats = fs.statSync(IMAGE_PATH);
  } catch (e) {
    // File doesn't exist, stats will be undefined
  }

  // Step 2: Check Cache Validity (serve if image is fresh)
  if (stats && now - stats.mtimeMs < TEN_MINUTES_IN_MS) {
    console.log("✅ Serving cached image (fresh)");
    return serveImage(res);
  }

  // Step 3: Rate Limiting Logic (prevent API spam)
  if (now - lastRequestTime < TEN_MINUTES_IN_MS && stats) {
    console.log("⏰ Serving cached image (rate limited)");
    lastRequestTime = now;
    return serveImage(res);
  }

  // Step 4: Fetch new image from external API
  try {
    console.log("🌐 Fetching new image from Picsum...");
    const response = await axios.get("https://picsum.photos/1200", {
      responseType: "arraybuffer",
    });

    // Save new image to cache
    fs.writeFileSync(IMAGE_PATH, response.data);
    lastRequestTime = now;
    console.log("💾 New image cached successfully");

    // Serve the new image
    serveImage(res);
  } catch (error) {
    console.error("❌ Error fetching new image:", error);

    // Step 5: Fallback - serve stale image if available
    if (stats) {
      console.log("🔄 Serving stale image due to fetch error");
      return serveImage(res);
    }

    // No cache available, return error
    res.status(500).send("Error fetching image and no cache available");
  }
});

app.get("/todos", async (req, res) => {
  try {
    // Use the backend service for todos, fallback to local if not available
    const backendUrl =
      process.env.TODO_BACKEND_URL || "http://todo-backend-svc:3001/todos";
    const response = await axios.get(backendUrl);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

app.post("/todos", async (req, res) => {
  try {
    const backendUrl =
      process.env.TODO_BACKEND_URL || "http://todo-backend-svc:3001/todos";
    await axios.post(backendUrl, {
      todo: req.body.todo,
    });
    res.redirect("/");
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({ error: "Failed to create todo" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    port: port,
  });
});

// 404 handler - must be last
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>404 - Not Found</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          h1 { color: #e74c3c; }
        </style>
      </head>
      <body>
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <a href="/">Go back to home</a>
      </body>
    </html>
  `);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start server
app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server started successfully!`);
  console.log(`📍 Local: http://localhost:${port}`);
  console.log(`🌐 Network: http://0.0.0.0:${port}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

// Graceful shutdown handlers
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});
