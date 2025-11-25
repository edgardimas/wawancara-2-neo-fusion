let currentConversationId = null;

async function send() {
  const input = document.getElementById("msg");
  const systemSelect = document.getElementById("systemPrompt");
  const messagesDiv = document.getElementById("messages");

  const text = input.value.trim();
  if (!text) return;

  // Show user message
  messagesDiv.innerHTML += `<p class="user"><b>You:</b> ${text}</p>`;
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  const systemChoice = systemSelect.value;

  input.value = "";

  // Send to Node.js backend

  if (currentConversationId === null) {
    // First message, create new conversation
    const newConvoRes = await fetch("/new-conversation", { method: "POST" });
    const newConvoData = await newConvoRes.json();
    currentConversationId = newConvoData.conversation_id;
    loadConversations();
  }

  const res = await fetch("http://localhost:3000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system: systemChoice,
      message: text,
      conversation_id: currentConversationId,
    }),
  });

  loadConversations();

  const data = await res.json();

  // Show bot reply
  messagesDiv.innerHTML += `<p class="bot"><b>Bot:</b> ${data.reply}</p>`;
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function loadConversations() {
  const res = await fetch("/conversations");
  const convos = await res.json();

  const chatList = document.getElementById("chatList");
  chatList.innerHTML = "";

  convos.forEach((c) => {
    const div = document.createElement("div");
    div.className = "chat-item";
    div.textContent = `Conversation ${c.conversation_id}: ${c.last_message}`;
    div.onclick = () => loadConversation(c.conversation_id);
    chatList.appendChild(div);
  });
}

async function loadConversation(id) {
  currentConversationId = id;
  const res = await fetch(`/history?conversation_id=${id}`);
  const rows = await res.json();

  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML = "";

  rows.forEach((r) => {
    const roleClass = r.role === "user" ? "user" : "bot";
    messagesDiv.innerHTML += `<p class="${roleClass}"><b>${r.role}:</b> ${r.text}</p>`;
  });
}

// Create new conversation
async function newChat() {
  console.log("Creating new chat...");
  const res = await fetch("/new-conversation", { method: "POST" });
  const data = await res.json();
  console.log("New conversation ID:", data.conversation_id);
  currentConversationId = data.conversation_id;
  document.getElementById("messages").innerHTML = "";
  loadConversations();
}

// Initial load
loadConversations();
