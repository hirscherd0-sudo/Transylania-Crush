const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// WICHTIG: Server zeigt auf den 'public' Ordner
app.use(express.static(path.join(__dirname, 'public')));

// Speicher für Spieler
let players = {};

io.on('connection', (socket) => {
    console.log('Neuer Spieler:', socket.id);

    // Spieler meldet sich an
    socket.on('join_game', (playerName) => {
        // Begrenze Namenlänge und verhindere HTML-Injection (einfach)
        const safeName = playerName.substring(0, 12).replace(/</g, "&lt;");
        
        players[socket.id] = {
            name: safeName || "Spieler",
            level: 1,
            score: 0,
            status: 'playing'
        };
        io.emit('update_leaderboard', Object.values(players));
    });

    // Spieler macht Fortschritt
    socket.on('update_progress', (data) => {
        if (players[socket.id]) {
            players[socket.id].level = data.level;
            players[socket.id].score = data.score;
            io.emit('update_leaderboard', Object.values(players));
        }
    });

    // Spieler trennt Verbindung
    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('update_leaderboard', Object.values(players));
    });
});

// Port für Render.com (nutzt process.env.PORT) oder 3000 lokal
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});


