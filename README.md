# Simple Chatbot App

A client-server chatbot application with AI integration using **Google Generative AI** and **SQLite** for conversation storage.

---

## Features

- User can select a **system role** (Doctor, Lawyer, Teacher, AI Assistant).
- Stores **conversation history** with timestamps.
- **Chat history sidebar** similar to ChatGPT.
- Each conversation has a unique **conversation ID**.
- Frontend auto-refreshes chat history.

---

## Tech Stack

- **Backend:** Node.js, Express.js, SQLite3, Google Generative AI API
- **Frontend:** HTML, CSS, JavaScript
- **Database:** SQLite

---

## Installation

```bash
# Clone the repo
git clone https://github.com/edgardimas/wawancara-2-neo-fusion
cd wawancara-2-neo-fusion

# Install dependencies
npm i -y
```

## Configuration

1. Create a .env file in the project root:

GOOGLE_API_KEY=your_google_api_key_here

2. Ensure chat.db is created in ./data/ (SQLite will auto-create tables).

## Runnning the App

node app.js
