"use client";
import { useState } from "react";

export default function ChatBox() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const sendMessage = async () => {
    if (!message) return;

    const updatedChat = [...chat, { role: "user", text: message }];
    setChat(updatedChat);

    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    });

    const data = await res.json();

    setChat([
      ...updatedChat,
      { role: "ai", text: data.reply },
    ]);

    setMessage("");
  };

  return (
    <div className="fixed bottom-5 right-5 w-80 bg-white shadow-lg p-3 rounded-lg">
      <div className="h-60 overflow-y-auto">
        {chat.map((msg, i) => (
          <p key={i}>
            <b>{msg.role}:</b> {msg.text}
          </p>
        ))}
      </div>

      <input
        className="border w-full mt-2"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button onClick={sendMessage}>Send</button>
    </div>
  );
}