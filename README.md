# ThinkBox 🧠

An AI-powered terminal assistant that remembers your conversations 
and generates intelligent thinking summaries of your sessions.

## Features
- Persistent conversation memory across messages
- /summary — AI analyzes your session and extracts key insights
- /save — exports full conversation to a timestamped file
- /clear — fresh start without restarting the app
- Colorful, clean terminal interface

## Tech Stack
- Node.js
- Groq API (Llama 3.1 70B)
- chalk for terminal styling

## Setup

1. Clone this repo
2. Run `npm install`
3. Create `.env` file with your Groq API key:
   GROQ_API_KEY=your_key_here
4. Run `node index.js`

## Get a Free API Key
Sign up at console.groq.com — completely free, no credit card required.