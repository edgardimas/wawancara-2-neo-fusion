const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const db = require("./src/database");

// function saveMessage(role, text) {
//   const stmt = db.prepare(`
//     INSERT INTO messages (role, text, time)
//     VALUES (?, ?, ?)
//   `);

//   stmt.run(role, text, new Date().toISOString());
// }

function saveMessage(role, text, conversationId) {
  const time = new Date().toISOString();

  db.run(
    "INSERT INTO messages (conversation_id, role, text, time) VALUES (?, ?, ?, ?)",
    [conversationId, role, text, time],
    (err) => {
      if (err) console.error("DB insert error:", err.message);
    }
  );
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Optional: explicit GET / that serves index.html (useful if you want root always to return the file)
app.get("/", (req, res) => {
  res.sendFile("public/index.html", { root: __dirname });
});

app.get("/conversations", (req, res) => {
  const sql = `
    SELECT conversation_id, MAX(time) as last_time, MAX(text) as last_message
    FROM messages
    GROUP BY conversation_id
    ORDER BY last_time DESC
  `;
  db.all(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/chat", async (req, res) => {
  try {
    const systemPrompt = req.body.system || "";
    const userMessage = req.body.message;
    let conversationId = req.body.conversation_id;

    console.log(conversationId, "<<< null?"); // this now holds the new conversation ID
    // could be null

    if (!conversationId) {
      const now = new Date().toISOString();
      conversationId = await new Promise((resolve, reject) => {
        db.run(
          "INSERT INTO conversations (created_at) VALUES (?)",
          [now],
          function (err) {
            if (err) return reject(err);
            resolve(this.lastID); // <-- this updates conversationId
          }
        );
      });
    }

    console.log(conversationId); // this now holds the new conversation ID

    // Time awareness
    const now = new Date().toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });

    const fullPrompt = `
SYSTEM:
${systemPrompt}

CURRENT TIME:
${now}

USER:
${userMessage}
`;
    // const userMessage = req.body.message;
    saveMessage("user", userMessage, conversationId);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContent(fullPrompt);
    const reply = result.response.text();
    res.json({ reply: result.response.text() });
    // Save bot reply
    saveMessage("assistant", reply, conversationId);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI error" });
  }
});

app.get("/history", (req, res) => {
  const conversation_id = req.query.conversation_id;
  let sql = "SELECT * FROM messages";
  const params = [];

  if (conversation_id) {
    sql += " WHERE conversation_id = ?";
    params.push(conversation_id);
  }

  sql += " ORDER BY id ASC";

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/new-conversation", (req, res) => {
  const now = new Date().toISOString();
  db.run(
    "INSERT INTO conversations (created_at) VALUES (?)",
    [now],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ conversation_id: this.lastID }); // auto-incremented ID
    }
  );
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
