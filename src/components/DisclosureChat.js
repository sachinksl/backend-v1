// src/components/DisclosureChat.js
import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, List, ListItem, ListItemText } from '@mui/material';
import { sendPromptToAI } from '../api';

function DisclosureChat() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Welcome! Please enter your property address:' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    const aiReply = await sendPromptToAI(input);
    const botMessage = { sender: 'bot', text: aiReply };
    setMessages(prev => [...prev, botMessage]);
  };

  return (
    <Box maxWidth={600} mx="auto" mt={4} p={3} boxShadow={3} borderRadius={2} display="flex" flexDirection="column" height="70vh">
      <Typography variant="h5">AI-Guided Disclosure</Typography>
      <Paper variant="outlined" sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        <List>
          {messages.map((msg, idx) => (
            <ListItem key={idx} sx={{ justifyContent: msg.sender === 'bot' ? 'flex-start' : 'flex-end' }}>
              <ListItemText primary={msg.text} sx={{
                bgcolor: msg.sender === 'bot' ? 'primary.light' : 'secondary.light',
                borderRadius: 2,
                p: 1
              }}/>
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Paper>

      <Box mt={1} display="flex" gap={1}>
        <TextField
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your answer..."
        />
        <Button variant="contained" onClick={handleSend}>Send</Button>
      </Box>
    </Box>
  );
}

export default DisclosureChat;
