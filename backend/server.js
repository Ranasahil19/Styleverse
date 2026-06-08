const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const routes = require("./routes/indexRoutes");
const { ApolloServer } = require("apollo-server-express");
const typeDefs = require("./graphql/schema");
const resolvers = require("./graphql/resolvers");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const http = require("http");
const axios = require("axios");
const { spawn } = require("child_process");
const socketIoClient = require("socket.io-client");
const fs = require("fs");

const {
  createNotification,
} = require("./controllers/notifications/notificationController");
const { cartRoom } = require("./controllers/cart/cartSocket");

require("dotenv").config();

const { handleAiTryOn } = require("./services/openRouterTryOnService");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

const PYTHON_PORT = process.env.PYTHON_PORT || 5001;

const PYTHON_URL =
  process.env.PYTHON_URL || `http://localhost:${PYTHON_PORT}`;

const parseCsvEnv = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const localPythonBin = path.join(__dirname, "venv", "bin", "python");
const PYTHON_BIN =
  process.env.PYTHON_BIN ||
  (fs.existsSync(localPythonBin) ? localPythonBin : "python3");

const allowedOrigins = parseCsvEnv(process.env.ALLOWED_ORIGINS);
const fallbackAllowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  process.env.ADMIN_CLIENT_URL || "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
];
const corsOrigins = allowedOrigins.length ? allowedOrigins : fallbackAllowedOrigins;

const io = new Server(server, {
  cors: {
    origin: corsOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(
  "/api/stripe-webhook",
  bodyParser.raw({ type: "application/json" })
);

app.use(bodyParser.json({ limit: "25mb" }));

app.use(express.json({ limit: "25mb" }));

app.use(cookieParser());

connectDB();

app.use("", routes);

app.use("/uploads", express.static("uploads"));

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req }),
});

async function startApolloServer() {
  await apolloServer.start();

  apolloServer.applyMiddleware({
    app,
    path: "/graphql",
  });

  console.log(
    `🚀 Apollo Server ready at http://localhost:${PORT}/graphql`
  );
}

startApolloServer();

let onlineUsers = new Map();

global.onlineUsers = onlineUsers;

/* ===========================
   START PYTHON SERVER
=========================== */

let pythonProcess = null;
let isShuttingDown = false;

if (process.env.NODE_ENV !== "production") {
  console.log("Starting Python Flask server...");

  pythonProcess = spawn(PYTHON_BIN, ["app.py"], {
    env: {
      ...process.env,
      PORT: PYTHON_PORT.toString(),
      MPLCONFIGDIR:
        process.env.MPLCONFIGDIR ||
        path.join(__dirname, "venv", ".matplotlib"),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  pythonProcess.stdout.on("data", (data) => {
    console.log(`[Python stdout] ${data.toString()}`);
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`[Python stderr] ${data.toString()}`);
  });

  pythonProcess.on("close", (code) => {
    console.log(`Python process exited with code ${code}`);
  });

  pythonProcess.on("error", (error) => {
    console.error("Python process error:", error.message);
  });
}

/* ===========================
   WAIT FOR PYTHON SERVER
=========================== */

const waitForPythonServer = () =>
  new Promise((resolve) => setTimeout(resolve, 4000));

/* ===========================
   TRYON API PROXY
=========================== */

app.post("/tryon", async (req, res) => {
  try {
    const response = await axios.post(
      `${PYTHON_URL}/tryon`,
      req.body
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error forwarding /tryon:", error.message);

    res.status(500).json({
      error: "Python server error",
    });
  }
});

app.post("/api/ai-tryon", handleAiTryOn);
app.post("//api/ai-tryon", handleAiTryOn);

/* ===========================
   SOCKET CONNECTION
=========================== */

(async () => {
  await waitForPythonServer();

  const flaskSocket = socketIoClient(PYTHON_URL, {
    transports: ["websocket"],
  });

  flaskSocket.on("connect", () => {
    console.log("Connected to Flask Socket.IO backend");
  });

  io.on("connection", (socket) => {
    console.log("New Client Connected", socket.id);

    socket.on("register", ({ sellerId, role }) => {
      if (!sellerId) {
        return console.error(
          "⚠️ Missing sellerId during registration"
        );
      }

      onlineUsers.set(sellerId, {
        socketId: socket.id,
        role,
      });

      console.log("✅ User registered:", onlineUsers);
    });

    socket.on("registerCart", (userId) => {
      if (!userId) {
        return;
      }

      socket.join(cartRoom(userId));
    });

    socket.on(
      "sendNotification",
      async ({ receiverId, message, type }) => {
        try {
          if (!receiverId || !message || !type) {
            console.error("Invalid notification data");

            return;
          }

          const receiver = onlineUsers.get(receiverId);

          if (receiver) {
            io.to(receiver.socketId).emit(
              "receiveNotification",
              {
                message,
                type,
              }
            );
          }

          await createNotification({
            receiverId,
            message,
            type,
          });
        } catch (error) {
          console.error(
            "Error saving notification:",
            error
          );
        }
      }
    );

    socket.on("disconnect", () => {
      console.log(`🔴 User disconnected ${socket.id}`);

      let removedUser = null;

      onlineUsers.forEach((value, key) => {
        if (value.socketId === socket.id) {
          removedUser = key;

          onlineUsers.delete(key);
        }
      });

      console.log(
        `❌ Removed user: ${removedUser || "None"}`
      );
    });

    socket.on("logout", (sellerId) => {
      console.log(`🔴 Logging out user: ${sellerId}`);

      if (sellerId && onlineUsers.has(sellerId)) {
        onlineUsers.delete(sellerId);
      }

      socket.disconnect();
    });

    /* ===========================
       TRYON SOCKET EVENT
    =========================== */

    socket.on(
      "tryon_request",
      async ({
        userImage,
        productImage,
        category,
        adjustments,
        productName,
      }) => {
        try {
          const result = await axios.post(
            `${PYTHON_URL}/tryon`,
            {
              userImage,
              productImage,
              category,
              adjustments,
              productName,
            }
          );

          socket.emit("tryon_result", {
            resultImage: result.data.resultImage,
          });
        } catch (error) {
          socket.emit("tryon_error", {
            error: error.message,
          });
        }
      }
    );

    flaskSocket.on("tryon_result", (data) => {
      io.emit("tryon_result", data);
    });

    flaskSocket.on("tryon_error", (data) => {
      io.emit("tryon_error", data);
    });
  });
})();

/* ===========================
   CLEANUP
=========================== */

const shutdown = () => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  if (pythonProcess) {
    pythonProcess.kill();
  }

  server.close(() => {
    process.exit(0);
  });

  setTimeout(() => {
    process.exit(0);
  }, 3000).unref();
};

process.on("SIGINT", () => {
  shutdown();
});

process.on("SIGTERM", () => {
  shutdown();
});

/* ===========================
   START NODE SERVER
=========================== */

global.io = io;

module.exports = {
  app,
  server,
};

app.use('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
