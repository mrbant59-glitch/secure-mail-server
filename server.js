const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const mailboxes = {};

io.on('connection', (socket) => {
    console.log('Un utilisateur s\'est connecté :', socket.id);

    socket.on('join-mailbox', (mailboxName) => {
        socket.join(mailboxName);
        if (mailboxes[mailboxName]) {
            socket.emit('load-history', mailboxes[mailboxName]);
        } else {
            socket.emit('load-history', []);
        }
    });

    socket.on('send-message', ({ mailboxName, encryptedPayload }) => {
        if (!mailboxes[mailboxName]) {
            mailboxes[mailboxName] = [];
        }
        mailboxes[mailboxName].push(encryptedPayload);
        io.to(mailboxName).emit('receive-message', encryptedPayload);
    });

    socket.on('disconnect', () => {
        console.log('Utilisateur déconnecté :', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
