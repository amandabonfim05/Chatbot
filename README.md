Chatbot Procont

This Node.js project is a WhatsApp chatbot for automating customer service in the accounting area. The bot interacts with clients via WhatsApp, providing quick access to services such as termination requests, vacation scheduling, tax recalculations, and billing requests. It reduces the need for manual attendance and ensures faster responses to common client demands.

📖 Overview

Main features of the chatbot:

✅ Automatic WhatsApp responses via whatsapp-web.js

✅ Integration with MongoDB Atlas for session storage (RemoteAuth)

✅ Keeps session active even after deployment (no need to scan QR code every time)

✅ Custom menu for client interactions:

Request termination (worked or indemnified notice)

Request vacation scheduling with holiday validation

Request tax recalculation

Request billing

Speak directly with an attendant

Cancel service

✅ Health check endpoint (/health) for Render deployment

🛠️ Technologies Used

Node.js

Express.js

whatsapp-web.js (with RemoteAuth)

MongoDB Atlas (with wwebjs-mongo for session persistence)

Render (cloud hosting)

🎯 Objectives

Automate customer service for accounting processes

Store WhatsApp sessions remotely to avoid repeated QR scans

Validate vacation dates against holidays

Provide a scalable and production-ready deployment on Render

🚀 Future Improvements

Add authentication for admin panel to monitor messages

Create a dashboard to view customer requests in real time

Integrate with Google Calendar or ERP systems for better automation

Implement natural language understanding (NLU) for more dynamic responses

📬 Contact

Developed by Amanda Bonfim

GitHub: @amandabonfim05

LinkedIn: www.linkedin.com/in/amanda-bonfim-9080b225b

Email: amandabonfim05@gmail.com
