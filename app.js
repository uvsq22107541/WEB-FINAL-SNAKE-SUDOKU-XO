const { Socket } = require('socket.io');

// Mise en place d'Express //
const express = require('express');
const app = express();
const http =require('http').createServer(app);
const path = require('path');
const port =  process.env.PORT || 8080 ;

// MongoDB //
const moogoose = require('mongoose');
const { default: mongoose } = require('mongoose');
const ObjectId = moogoose.Types.ObjectId;

// Connexion à la BD en ligne via le cluster //
mongoose.connect('mongodb+srv://Johann:zeyphax00@ter-minijeux.ky6dc.mongodb.net/XOChat', { useNewUrlParser: true, useUnifiedTopology: true }, function
(err) {
    if(err) {
        console.log(err);
    }

    else {
        console.log('Connected to mongodb');
    }
})

// Recherche du model joueur //
require('./models/joueur.model');

// Appel au schéma 'joueur' //
var User = mongoose.model('joueur');

/**
 * @type { Socket }
 */
// Mise en place de Socket.io //
const io = require('socket.io')(http);

// Listes Framework utilisés //
app.use('/bootstrap/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/bootstrap/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/jquery', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Listes des chemins renvoyant sur chaques Mini-jeux //
/* Accueil */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'templates/accueil.html'));
});

/* X/O */
app.get('/games/XO', (req, res) => {
    User.find((err, users) => {
        //res.sendFile(path.join(__dirname,'templates/games/XO.html'), {users: users});
        res.render('XO.ejs', {users: users});
    })
});

/* Snake */
app.get('/games/Snake', (req, res) => {
    res.sendFile(path.join(__dirname,'templates/games/Snake.html'));
});

/* Sudoku */
app.get('/games/Sudoku', (req, res) => {
    res.sendFile(path.join(__dirname,'templates/games/Sudoku.html'));
});

// Ecoute du port //
http.listen(port, () => {
    console.log(`Listening on http://localhost:${port}/`);
});

// Tableaux contenant les différents salons //
let rooms = [];

// Tableaux contenant les sockets des joueurs connectés //
let connectedUsers = [];

// Côté Serveur de l'application //
// Partie X/O //
io.on('connection', (socket) => {
    console.log(`[connection] ${socket.id}`);

    // Evenement qui donne les données du joueur //
    socket.on('playerData', (player) => {
        console.log(`[playerData] ${player.username}`);

        let checkPseudo = verifPseudo(player);

        if (checkPseudo === true) {
            let joined;
            let randomPseudo = randomValPseudo();
            console.log("Pseudo déjà utilisé. Voici votre nouveau pseudo.");
            joined = player.username + randomPseudo;
            player.username = joined;
            console.log(`nouveau pseudo  ${player.username}`);
            socket.emit('newPseudo', player);
        }

        User.findOne({pseudo: player.username}, (err, user) => {

            // Joueur déjà présent dans la BD //
            if(user) {
                socket.pseudo = player.username;
                socket.broadcast.emit('newUser',player);
            }

            // Nouveau Joueur dans la BD //
            else {
                let user = new User();
                user.pseudo = player.username;
                user.save();

                socket.pseudo = player.username;
                socket.broadcast.emit('newUser',player);

                // Mise à jour d'un joueur dans la BD //
                socket.broadcast.emit('newUserInDb', player);
            }

            // Ajout au tableau des joueurs connectés //
            connectedUsers.push(socket);
        })

        let room = null;

        if (!player.roomId) {
            room = createRoom(player);
            socket.idRoom = room.id;
            console.log(`[create room] ${room.id} - ${player.username}`);
        }

        else {
            room = rooms.find(r => r.id === player.roomId);

            if (room === undefined) {
                return;
            }

            player.roomId = room.id;
            room.players.push(player);
        }

        // Evènement qui permet de rejoindre un salon //
        socket.join(room.id);

        io.to(socket.id).emit('join room', room.id);

        if(room.players.length === 2) {
            io.to(room.id).emit('start game', room.players);
            socket.idRoom = room.id;
        }
    });

    // Evènement pour avoir la liste des salons //
    socket.on('get rooms', () => {
        io.to(socket.id).emit('list rooms', rooms);
    });

    // Evènement pour chaque action d'un joueur //
    socket.on('play', (player) => {
        io.to(player.roomId).emit('play', player);
    });

    // Evènement pour relancer une partie //
    socket.on('rejouer', (roomId) => {
        const room = rooms.find(r => r.id === roomId);

        if(room && room.players.length === 2) {
            io.to(room.id).emit('rejouer', room.players);
        }
    });

    // Chat Textuel //
    socket.on('newMessage', (message, receiver) => {
        if (receiver === "all") {

            // Retransmission du message aux joueurs //
            socket.broadcast.emit('newMessageAll', {message: message, pseudo: socket.pseudo});
        }

        else {

            // Vérification que le destinataire existe //
            User.findOne({pseudo: receiver}, (err, user) => {

                if(!user) {
                    return false;
                }

                else {
                    socketReceiver = connectedUsers.find(socket => socket.pseudo === user.pseudo);

                    if(socketReceiver){
                        // Envoi du message à un joueur en particulier //
                        socketReceiver.emit('privee', {sender: socket.pseudo, message: message});
                    }
                }
            });
        }
    });

    // Evènement de déconnexion //
    socket.on('disconnect', () => {
        let room = null;
        // Récupération de l'index du socket du Joueur qui se déconnecte //
        let index = connectedUsers.indexOf(socket);

        // Recherche de l'adversaire du Joueur qui a quitté la partie //
        for (let i = 0; i < connectedUsers.length; i++) {
            if(connectedUsers[i].idRoom === connectedUsers[index].idRoom &&
                connectedUsers[i].pseudo !== connectedUsers[index].pseudo &&
                connectedUsers[index].idRoom !== undefined &&
                connectedUsers[index].pseudo !== undefined) {
                console.log(`[adversaire de celui qui quitte] ${connectedUsers[i].pseudo}`);
                console.log(`[adversaire.idRoom] ${connectedUsers[i].idRoom}`);

                // Indication Pop-up à l'adversaire du Joueur qui se déconnecte //
                socket.broadcast.to(connectedUsers[i].idRoom).emit('quit game');
            }
        }

        // Vérification que le socket existe //
        if(index > -1) {
            // Suppression du joueur qui se déconnecte //
            connectedUsers.splice(index, 1);
        }

        rooms.forEach(r => {
            r.players.forEach(p => {
                if (p.socketId === socket.id && p.host) {
                    room = r;
                    // Suppression du salon r //
                    rooms = rooms.filter(r => r !== room);
                }
            })
        })

        // Evènement qui indique qu'un joueur quitte le jeux //
        console.log(`[socket.pseudo(quit)] ${socket.pseudo}`);
        socket.broadcast.emit('quitUser', socket.pseudo);
    });

});

// Fonction: CREATION D'UN SALON //
function createRoom(player) {
    const room = {id: roomId(), players: [] };

    player.roomId = room.id;
    room.players.push(player);
    rooms.push(room);

    return room;
}

// Génère une room avec 7 caractères //
function roomId(){
    return Math.random().toString(36).substring(2,9);
}

// Vérifie que les pseudos sont tous unique //
function verifPseudo(player) {
    for (let i = 0; i < connectedUsers.length; i++) {
        if(connectedUsers[i].pseudo === player.username) {
            return true;
        }

        else {
            return false;
        }
    }
}

// Génère 3 caractères aléatoire à concaténer à un Pseudo //
function randomValPseudo(){
    return Math.random().toString(36).substring(2,5);
}