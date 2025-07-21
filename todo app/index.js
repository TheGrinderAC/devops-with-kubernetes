const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT;

// Image caching configuration
const IMAGE_DIR = process.env.IMAGE_DIR;
const IMAGE_NAME = process.env.IMAGE_NAME;
const IMAGE_PATH = path.join(IMAGE_DIR, IMAGE_NAME);
const CACHE_TIMEOUT = process.env.CACHE_TIMEOUT;

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

const APP_TITLE = "The project App";
const APP_SUBTITLE = "DevOps with Kubernetes 2025";

// Updated main route with image display
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${APP_TITLE}</title>
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
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .todo-list li.done {
            text-decoration: line-through;
            color: #aaa;
          }
          .todo-list li:last-child {
            border-bottom: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${APP_TITLE}</h1>
          
          <div class="image-container">
            <img src="/image" alt="Random Project Image" class="main-image">
          </div>
          
          <p class="subtitle">${APP_SUBTITLE}</p>

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
            function markAsDone(id) {
              fetch(`/todos/${id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ done: true })
              })
              .then(response => {
                if (!response.ok) {
                  throw new Error('Failed to mark todo as done');
                }
                return response.json();
              })
              .then(updatedTodo => {
                const todoElement = document.querySelector(`li[data-id='${id}']`);
                if (todoElement) {
                  todoElement.classList.add('done');
                  const button = todoElement.querySelector('button');
                  if (button) {
                    button.remove();
                  }
                }
              })
              .catch(error => console.error('Error marking todo as done:', error));
            }

            fetch('/todos')
              .then(response => response.json())
              .then(todos => {
                const todoList = document.querySelector('.todo-list');
                todoList.innerHTML = todos.map(todo => `
                  <li class="${todo.done ? 'done' : ''}" data-id="${todo.id}">
                    <span>${todo.todo}</span>
                    ${!todo.done ? `<button onclick="markAsDone(${todo.id})">Done</button>` : ''}
                  </li>
                `).join('');
              })
              .catch(error => console.error('Error fetching todos:', error));
          </script>
        
        </div>
      </body>
    </html>
  `);
});

const IMAGE_API_URL = process.env.IMAGE_API_URL;

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
  if (stats && now - stats.mtimeMs < CACHE_TIMEOUT) {
    console.log("✅ Serving cached image (fresh)");
    return serveImage(res);
  }

  // Step 3: Rate Limiting Logic (prevent API spam)
  if (now - lastRequestTime < CACHE_TIMEOUT && stats) {
    console.log("⏰ Serving cached image (rate limited)");
    lastRequestTime = now;
    return serveImage(res);
  }

  // Step 4: Fetch new image from external API
  try {
    console.log(`🌐 Fetching new image from ${IMAGE_API_URL}...`);
    const response = await axios.get(IMAGE_API_URL, {
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

const TODO_BACKEND_URL = process.env.TODO_BACKEND_URL;

app.get("/todos", async (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Frontend: Fetching todos from backend`);

  try {
    // Use the backend service for todos, fallback to local if not available
    const response = await axios.get(TODO_BACKEND_URL);
    console.log(
      `[${timestamp}] Frontend: Successfully fetched ${response.data.length} todos from backend`
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      `[${timestamp}] Frontend: Error fetching todos:`,
      error.message
    );
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

app.post("/todos", async (req, res) => {
  const timestamp = new Date().toISOString();
  const todoContent = req.body.todo;

  console.log(
    `[${timestamp}] Frontend: Sending todo to backend (${todoContent.length} chars)`
  );

  try {
    const response = await axios.post(TODO_BACKEND_URL, {
      todo: todoContent,
    });
    console.log(`[${timestamp}] Frontend: Todo successfully sent to backend`);
    res.redirect("/");
  } catch (error) {
    console.error(
      `[${timestamp}] Frontend: Error creating todo:`,
      error.response?.data || error.message
    );

    // Handle backend validation errors
    if (error.response?.status === 400) {
      const errorData = error.response.data;
      console.log(
        `[${timestamp}] Frontend: Backend validation error - ${
          errorData.message || errorData.error
        }`
      );
      return res.status(400).json(errorData);
    }

    res.status(500).json({ error: "Failed to create todo" });
  }
});

app.put("/todos/:id", async (req, res) => {
    const { id } = req.params;
    const { done } = req.body;
    const timestamp = new Date().toISOString();

    try {
        const response = await axios.put(`${TODO_BACKEND_URL}/${id}`, { done });
        console.log(`[${timestamp}] Frontend: Todo update successfully sent to backend`);
        res.json(response.data);
    } catch (error) {
        console.error(
            `[${timestamp}] Frontend: Error updating todo:`,
            error.response?.data || error.message
        );
        res.status(500).json({ error: "Failed to update todo" });
    }
});

// Health check endpoint for database connection
app.get("/healthz", async (req, res) => {
  try {
    // Use the backend service for todos as a proxy for database connection
    await axios.get(TODO_BACKEND_URL);
    res.status(200).json({ status: "OK" });
  } catch (error) {
    console.error("Health check failed:", error.message);
    res.status(500).json({ status: "error", message: "Backend not reachable" });
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