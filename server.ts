import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const LOG_FILE = path.join(process.cwd(), "debug.log");
const logDebug = (msg: string) => {
  fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ${msg}\n`);
  console.log(msg);
};

const decodeTokenOffline = (token: string) => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
    return payload;
  } catch (e) {
    return null;
  }
};

initializeApp({
  projectId: "gen-lang-client-0989083154",
});

const LOG_PATH = path.join(process.cwd(), "secure_audit.log");
const ALLOWED_USERS_PATH = path.join(process.cwd(), "allowed_users.json");
const DNE_LIST_PATH = path.join(process.cwd(), "dne_list.json");

// Ensure allowed users file exists
if (!fs.existsSync(ALLOWED_USERS_PATH)) {
  fs.writeFileSync(ALLOWED_USERS_PATH, JSON.stringify(["isaiah9238@gmail.com"]), "utf8");
}

// Ensure DNE (Do Not Enter) list exists
if (!fs.existsSync(DNE_LIST_PATH)) {
  fs.writeFileSync(DNE_LIST_PATH, JSON.stringify(["Tabula", "tabula"]), "utf8");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Gatekeeper Middlewares
  const verifyAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Missing authorization" });
      const token = authHeader.split("Bearer ")[1];
      let decoded: any;
      try {
        decoded = await getAuth().verifyIdToken(token);
      } catch (err) {
        decoded = decodeTokenOffline(token);
      }
      if (!decoded || decoded.email !== "isaiah9238@gmail.com") return res.status(403).json({ error: "Not admin" });
      next();
    } catch (e) { res.status(401).json({ error: "Invalid token" }); }
  };

  const verifyUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Missing authorization" });
      const token = authHeader.split("Bearer ")[1];
      let decoded: any;
      try {
        decoded = await getAuth().verifyIdToken(token);
      } catch (err) {
        decoded = decodeTokenOffline(token);
      }
      if (!decoded) return res.status(401).json({ error: "Invalid token" });
      next();
    } catch (e) { res.status(401).json({ error: "Invalid token" }); }
  };

  // Librarian API
  app.post("/api/librarian/log", verifyUser, (req, res) => {
    try {
      const { email, status } = req.body;
      const entry = {
        timestamp: new Date().toISOString(),
        email,
        status,
        ip: req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress
      };
      const logLine = `${JSON.stringify(entry)}\n`;
      fs.appendFileSync(LOG_PATH, logLine, "utf8");
      res.json({ success: true });
    } catch (error: any) {
      console.error("Librarian Log Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/librarian/logs", verifyAdmin, (req, res) => {
    try {
      if (!fs.existsSync(LOG_PATH)) {
        return res.json([]);
      }
      const fileContent = fs.readFileSync(LOG_PATH, "utf8");
      const logs = fileContent
        .trim()
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line));
      res.json(logs);
    } catch (error: any) {
      console.error("Librarian Read Logs Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/librarian/allowed-users", verifyUser, (req, res) => {
    try {
      if (!fs.existsSync(ALLOWED_USERS_PATH)) {
        return res.json([]);
      }
      const allowedUsers = JSON.parse(fs.readFileSync(ALLOWED_USERS_PATH, "utf8"));
      res.json(allowedUsers);
    } catch (error: any) {
      console.error("Librarian Read Allowed Users Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/librarian/dne-list", verifyUser, (req, res) => {
    try {
      if (!fs.existsSync(DNE_LIST_PATH)) {
        return res.json([]);
      }
      const dneList = JSON.parse(fs.readFileSync(DNE_LIST_PATH, "utf8"));
      res.json(dneList);
    } catch (error: any) {
      console.error("Librarian Read DNE List Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Clean and format Gemini error messages into clear, readable user notifications
  function cleanGeminiErrorMessage(rawErr: any): string {
    let text = typeof rawErr === "string" ? rawErr : (rawErr?.message || String(rawErr));
    
    try {
      if (text.trim().startsWith("{") && text.trim().endsWith("}")) {
        const parsed = JSON.parse(text);
        if (parsed.error?.message) {
          text = parsed.error.message;
          if (typeof text === "string" && text.trim().startsWith("{") && text.trim().endsWith("}")) {
            const inner = JSON.parse(text);
            if (inner.error?.message) text = inner.error.message;
          }
        }
      }
    } catch (e) {}

    if (
      text.includes("503") ||
      text.includes("UNAVAILABLE") ||
      text.includes("high demand") ||
      text.includes("temporarily overloaded")
    ) {
      return "Gemini is currently experiencing a temporary surge in traffic (503 Service Unavailable). Please try sending your message again in a few moments.";
    }
    if (
      text.includes("API_KEY_INVALID") ||
      text.includes("API key not valid") ||
      text.includes("Unauthenticated") ||
      text.includes("401") ||
      text.includes("403")
    ) {
      return "Unauthenticated request: Invalid or missing Gemini API key. Please verify your API key in Settings.";
    }
    if (
      text.includes("prepayment credits") ||
      text.includes("RESOURCE_EXHAUSTED") ||
      text.includes("429") ||
      text.includes("depleted")
    ) {
      return "The Gemini AI service is temporarily busy or rate-limited. Please try again shortly or configure a custom API key in Settings.";
    }

    return text;
  }

  // API Routes
  app.post("/api/gemini/test-key", async (req, res) => {
    try {
      const customKey = ((req.headers["x-gemini-api-key"] as string) || req.body?.apiKey || "").trim();
      if (!customKey) {
        return res.status(400).json({ valid: false, error: "No API key provided." });
      }
      const testAi = new GoogleGenAI({
        apiKey: customKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      
      const testModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite"];
      let testSuccess = false;
      let lastTestErr: any = null;

      for (const model of testModels) {
        try {
          const response = await testAi.models.generateContent({
            model,
            contents: [{ role: "user", parts: [{ text: "ping" }] }]
          });
          if (response && response.text) {
            testSuccess = true;
            return res.json({ valid: true, message: `Gemini API key is valid and connected (${model})!` });
          }
        } catch (err: any) {
          lastTestErr = err;
        }
      }

      const cleanMsg = cleanGeminiErrorMessage(lastTestErr);
      return res.status(400).json({ valid: false, error: cleanMsg });
    } catch (err: any) {
      console.error("Test API Key Error:", err);
      const cleanMsg = cleanGeminiErrorMessage(err);
      return res.status(401).json({ valid: false, error: cleanMsg });
    }
  });

  app.post("/api/gemini/chat", async (req, res) => {
    logDebug("=== CHAT REQUEST RECEIVED ===");
    try {
      const headerKey = (req.headers["x-gemini-api-key"] as string || "").trim();
      const authHeader = req.headers.authorization;
      const idToken = (authHeader && authHeader.startsWith("Bearer ")) ? authHeader.split("Bearer ")[1] : "";

      let email = "";
      if (idToken) {
        let decodedToken: any;
        try {
          decodedToken = await getAuth().verifyIdToken(idToken);
          email = decodedToken?.email || "";
          logDebug(`Token decoded for ${email}`);
        } catch (err: any) {
          logDebug(`Token verification failed, trying offline decode: ${err.message}`);
          decodedToken = decodeTokenOffline(idToken);
          email = decodedToken?.email || "";
        }
      }

      // Gatekeeper check: allowed if custom key present, or if email is authorized
      if (!headerKey) {
        if (!idToken) {
          logDebug("Missing auth header and no custom API key provided");
          return res.status(401).json({ error: "Missing authorization or API key. Please sign in or set a custom Gemini API key in Settings." });
        }
        
        const allowedUsers = JSON.parse(fs.readFileSync(ALLOWED_USERS_PATH, "utf8"));
        const dneList = JSON.parse(fs.readFileSync(DNE_LIST_PATH, "utf8"));
        
        const inDneList = email && dneList.some((dne: string) => 
          email.toLowerCase().includes(dne.toLowerCase())
        );

        if (email !== "isaiah9238@gmail.com" && (inDneList || !allowedUsers.includes(email))) {
          logDebug(`Gatekeeper blocked user: ${email}`);
          return res.status(403).json({ error: "Your account is not whitelisted to use the default AI. Please provide a custom Gemini API key in Settings." });
        }
      }

      const activeAi = headerKey
        ? new GoogleGenAI({
            apiKey: headerKey,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              }
            }
          })
        : ai;

      const { message, history, context, drawingsCount } = req.body;
      logDebug(`Request body sizes - message: ${message?.length}, history: ${history?.length}, context: ${context?.length}, customKeyPresent: ${Boolean(headerKey)}`);

      const systemInstruction = `You are an advanced AI companion for a digital notebook.
You have access to the user's current notebook contents to provide highly contextual assistance.

CURRENT NOTEBOOK CONTEXT:
---
${context ? context : "(The notebook is currently empty)"}
---
The notebook currently contains ${drawingsCount || 0} embedded drawings/sketches.

Your personas (user may ask to switch):
1. The Professional
2. Work Forward
3. Calm and Collected
4. Children
5. The Architect
6. The Crew Chief
7. The Student
8. The Professor

Answer the user directly and concisely. Keep the tone minimal unless instructed otherwise.

IMPORTANT CO-CREATION CAPABILITY:
You can help the user build their vision by suggesting clean text, markdown widgets, HTML elements, or custom execution paths.
When proposing code modifications, full templates, or structured notes that the user might want to apply directly to their parent notebook, ALWAYS wrap them inside standard markdown code blocks (such as \`\`\`html ... \`\`\` or \`\`\`markdown ... \`\`\`).
The user has direct, 1-click interface buttons ("Replace Notebook", "Append", "Insert") beneath all your code blocks to instantly integrate your suggestions into their notebook canvas. Encourage them to start fresh on a blank canvas, brainstorm their vision, and output beautiful interactive templates they can test in real-time by switching to the "View" tab!`;

      const contents = history ? [...history, { role: 'user', parts: [{ text: message }] }] : [{ role: 'user', parts: [{ text: message }] }];

      // Fallback model cascade for resilience against 503 high-demand surges and rate limits
      const CANDIDATE_MODELS = ["gemini-3.8-flash", "gemini-3.1-flash-lite"];
      let response: any = null;
      let lastError: any = null;

      for (const model of CANDIDATE_MODELS) {
        try {
          logDebug(`Calling Gemini generateContentStream with model: ${model}...`);
          response = await activeAi.models.generateContentStream({
            model,
            contents,
            config: {
              systemInstruction: systemInstruction,
            }
          });
          if (response) {
            logDebug(`Stream started successfully with model: ${model}`);
            break;
          }
        } catch (genError: any) {
          lastError = genError;
          const errMsg = genError?.message || String(genError);
          logDebug(`Gemini model ${model} failed: ${errMsg}`);
          
          const isTransient = errMsg.includes("503") ||
            errMsg.includes("UNAVAILABLE") ||
            errMsg.includes("high demand") ||
            errMsg.includes("429") ||
            errMsg.includes("RESOURCE_EXHAUSTED") ||
            errMsg.includes("overloaded");

          if (!isTransient) {
            // Non-transient error (e.g. invalid auth, invalid parameter)
            break;
          }
          // Short pause before cascade attempt
          await new Promise(resTimeout => setTimeout(resTimeout, 400));
        }
      }

      if (!response) {
        console.error("All Gemini candidate models failed. Last error:", lastError);
        const cleanMsg = cleanGeminiErrorMessage(lastError);
        return res.status(503).json({ error: cleanMsg });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      let chunksSent = 0;
      try {
        for await (const chunk of response) {
          if (chunk.text) {
            res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
            chunksSent++;
          }
        }
        res.write("data: [DONE]\n\n");
        res.end();
        logDebug(`Stream complete. Chunks sent: ${chunksSent}`);
      } catch (streamError: any) {
        logDebug(`Gemini API Stream Iteration Error: ${streamError.message}`);
        console.error("Gemini API Stream Iteration Error:", streamError);
        
        const cleanMsg = cleanGeminiErrorMessage(streamError);
        const streamErrMsg = `\n\n⚠️ **Notice:** ${cleanMsg}`;
        res.write(`data: ${JSON.stringify({ text: streamErrMsg })}\n\n`);
        res.write("data: [DONE]\n\n");
        res.end();
      }
    } catch (error: any) {
      logDebug(`Gemini API Error: ${error.message}`);
      console.error("Gemini API Error:", error);
      const cleanMsg = cleanGeminiErrorMessage(error);
      res.status(500).json({ error: cleanMsg });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
