// Data: JOUEUR //
const player = {
    host: false,
    playedCell: "",
    roomId: null,
    username: "",
    socketId: "",
    symbol: "X",
    turn: false,
    win: false
};

const socket = io();

// Variables gestion de l'URL + lien d'invitation //
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const roomId = urlParams.get('room');
const lien = document.getElementById('link-to-share');

// Le bouton 'Créer un salon' se transforme en 'Rejoindre' //
if (roomId) {
    document.getElementById('start').innerText = "Rejoindre";
}

// Variables pointant sur les données HTML //
// Gestion utilisateur //
const usernameInput = document.getElementById('username');
const userCard = document.getElementById('user-card');

// Gestion grille X/O + Bouton Rejouer //
const gameCard = document.getElementById('game-card');
const restartArea = document.getElementById('restart-area');

// Liste d'attente + Listes salon disponiile //
const waitingArea = document.getElementById('waiting-area');
const roomsCard = document.getElementById('rooms-card');
const roomsList = document.getElementById('rooms-list');

// Tour Joueur + BoxChat + Notification + Bouton Chat //
const annonce = document.getElementById('annonce');
const boxChat = document.getElementById('box');
const notif = document.getElementById('notification');
const buttonChat = document.getElementById('button-chat');
let ennemyUsername = "";

// Liste Joueur //
const tabJoueur = document.getElementById('table-player');

// Box-Chat //
const boutonChat = document.getElementById('button-box');
const closechat = document.getElementById('box-close');

// Pop-up //
/* Pseudo identique */
const myModal = new bootstrap.Modal(document.getElementById('modal1'));

/* Informations + Tips */
const myModal2 = new bootstrap.Modal(document.getElementById('modal2'));

/* Adversaire qui quitte une partie */
const myModal3 = new bootstrap.Modal(document.getElementById('modal3'));

/* Choix du symbole */
const myModal4 = new bootstrap.Modal(document.getElementById('modal4'));

// Affichage Pop-up 'informations' //
myModal2.show();
socket.emit('get rooms');

// Etablissement de la liste des Salons disponible //
socket.on('list rooms', (rooms) => {
    let salon = "";

    // Check si un Joueur à créer un salon //
    if(rooms.length > 0) {
        rooms.forEach(room => {
            if (room.players.length !== 2) {
                salon = salon +  
                `<li class="list-group-item d-flex justify-content-between">
                <p class="p-0 m-0 flex-grow-1 fw-bold"> Salon de ${room.players[0].username} - ${room.id}</p>
                <button class="btn btn-sm btn-primary join-room" data-room="${room.id}">Rejoindre le salon</button>
                </li>`;
            }
        });
    }

    // Affichage listes des Salons //
    if (salon !== "") {
        roomsCard.classList.remove('d-none');
        roomsList.innerHTML = salon;

        // ClassName issue de la variable `join-room` //
        for(const element of document.getElementsByClassName('join-room')) {
            element.addEventListener('click', joinRoom, false)
        }
    }
});

// Affichage salle d'attente //
function afficheSalleAttente() {
    userCard.hidden = true;
    waitingArea.classList.remove('d-none');
    roomsCard.classList.add('d-none');
}

// Partie: JQUERY //
/* Data: Pseudo */
$("#Pseudoform").on('submit', function (e) {
    // Empêche le rechargement de la page //
    e.preventDefault();

    player.username = usernameInput.value;

    if (roomId) {
        player.roomId = roomId;
    }

    else {
        player.host = true;
        player.turn = true;
    }

    player.socketId = socket.id;

    afficheSalleAttente();

    // Envoie des informations du Joueurs au serveur //
    socket.emit(`playerData`, player);

});

/* Data: Case X/O */
$(".case").on('click', function() {
    // Récupération de la case cliqué //
    const playedCell = this.getAttribute('id');

    if(this.innerText === "" && player.turn) {
        player.playedCell = playedCell;

        // Remplissage de la case avec le symbole //
        this.classList.add('symbolj1');
        this.innerText = player.symbol;

        // Check si le Joueur à gagné puis envoie la réponse au serveur //
        player.win = checkVictoire(playedCell);
        player.turn = false;
        socket.emit('play', player);
    }
});

/* Data: Bouton 'Rejouer' */
$("#restart").on('click', function() {
    restartGame();
});

/* Data: Bouton 'Pique' */
$("#piquebtn").on('click', function () {
    player.symbol = '♠';
});

/* Data: Bouton 'Trèfle' */
$("#treflebtn").on('click', function () {
    player.symbol = '♣';
});

/* Data: Bouton 'Coeur' */
$("#coeurbtn").on('click', function () {
    player.symbol = '♥';
});

/* Data: Bouton 'Carreau' */
$("#carreaubtn").on('click', function () {
    player.symbol = '♦';
});

// Partie: PSEUDO MODIFIE //
/* Socket */
socket.on('newPseudo', (player) => {
    const newElement = document.createElement('p');
    newElement.innerHTML = ' Voici votre nouveau Pseudo : ' + `<strong> ${player.username} </strong>`;
    document.getElementById('message-modal').appendChild(newElement);
    myModal.show();
});

// Partie: REJOINDRE UN SALON //
/* Socket */
socket.on('join room', (roomId) => {
    player.roomId = roomId;
    lien.innerHTML = `<a href="${window.location.href}?room=${player.roomId}" target="_blank">${window.location.href}?room=${player.roomId}</a>`;
});

/* Fonction */
function joinRoom() {
    if(usernameInput.value !== ""){
        player.username = usernameInput.value;
        player.socketId = socket.id;
        // Permet d'accéder au attributs qui commence par 'data' //
        player.roomId = this.dataset.room;

        // Envoie des données de l'utilisateur au Serveur //
        socket.emit('playerData', player);
        userCard.hidden = true;
        waitingArea.classList.remove('d-none');
        roomsCard.classList.add('d-none');
    }

}

// Partie: LANCEMENT D'UNE PARTIE //
/* Socket */
socket.on('start game', (players) => {
    // Affichage Pop-up 'Choix symbole' //
    myModal4.show();
    startGame(players);
});

/* Fonction */
function startGame(players){
    affichageInGame();
    // Recherche de l'adversaire socket hôte != socket adversaire //
    const ennemyPlayer = players.find(p => p.socketId !== player.socketId);
    ennemyUsername = ennemyPlayer.username;

    if(player.host && player.turn){
        setTurnMessage('alert-info', 'alert-info', "C'est <strong>ton tour</strong> de jouer");
    }

    else{
        setTurnMessage('alert-info', 'alert-info', `C'est au tour de <b>${ennemyPlayer.username}</b> de jouer`);
    }
}

// Partie: JOUER //
/* Socket */
socket.on('play', (ennemyPlayer) => {
    if(ennemyPlayer.socketId !== player.socketId && !ennemyPlayer.turn) {
        // Récupération case joué par l'adversaire //
        const playedCell = document.getElementById(`${ennemyPlayer.playedCell}`);

        // Ajout de son symbole + couleur //
        playedCell.classList.add('symbolj2');
        playedCell.innerHTML = 'O';

        if (ennemyPlayer.win) {
            setTurnMessage('alert-info', 'alert-primary', `C'est <strong>perdu</strong> ! <b>${ennemyPlayer.username}</b> à gagné !`);
            checkVictoire(ennemyPlayer.playedCell, 'O');
            afficheRejouer();
            return;
        }

        if (checkEgalite()) {
            setTurnMessage('alert-info', 'alert-primary', "<strong>Egalité</strong>");
            return;
        }

        setTurnMessage('alert-primary', 'alert-info', "C'est <strong>ton tour</strong> de jouer");
        player.turn = true;
    }

    else {
        if (player.win) {
            $("#annonce").addClass('alert-success').html("Tu as <strong>gagné</strong> la partie");
            afficheRejouer();
            return;
        }

        if (checkEgalite()) {
            setTurnMessage('alert-info', 'alert-primary', "<strong>Egalité</strong>");
            afficheRejouer();
            return;
        }

        setTurnMessage('alert-info', 'alert-primary', `C'est au tour de <b>${ennemyUsername}</b> de jouer`);
        player.turn = false;
    }
});

// Partie : REJOUER //
/* Socket */
socket.on('rejouer', (players) => {
    restartGame(players);
});

/* Fonction */
function videCase() {
    // Suppresion des symboles dans chaque case de la grille //
    const cases = document.getElementsByClassName('case');

    for(const tab_case of cases) {
        tab_case.innerHTML = '';
        tab_case.classList.remove('win-cell'); 
        tab_case.classList.remove('symbolj1'); 
        tab_case.classList.remove('symbolj2');
    }
}

function restartGame(players = null) {
    if(player.host && !players) {
        player.turn = true;
        socket.emit('rejouer', player.roomId);
    }

    videCase();

    // Suppression des classes intégrés à la box `annonce` //
    annonce.classList.remove('alert-info'); 
    annonce.classList.remove('alert-primary');
    annonce.classList.remove('alert-success');

    // Joueur 1 = Joueur hôte //
    if(!player.host) {
        player.turn = false;
    }

    player.win = false;

    if(players) {
        startGame(players);
    }
}

/* Bouton */
function afficheRejouer() {
    // Seule l'hôte de la partie peut proposer le rematch //
    if(player.host) {
        restartArea.classList.remove('d-none');
    }
}

// Partie: AFFICHAGE //
/* Affichage en pleine partie */
function affichageInGame() {
    // Suppression salle d'attente //
    restartArea.classList.add('d-none');
    waitingArea.classList.add('d-none');

    // Affichage Grille + Tour Joueur + BoxChat + Tableau Joueurs //
    gameCard.classList.remove('d-none');
    annonce.classList.remove('d-none');
    boxChat.classList.remove('d-none');
    tabJoueur.classList.remove('d-none');
    
    // On cache le bouton Chat car on affiche la BoxChat  //
    boutonChat.classList.add('d-none');
}

/* Fonction affichage tour du Joueur */
function setTurnMessage(classToRemove, classToAdd, html){
    annonce.classList.remove(classToRemove);
    annonce.classList.add(classToAdd);
    annonce.innerHTML = html;
}

// Partie: RESULTAT //
/* Egalité */
function checkEgalite() {
    let equality = true;
    const cases = document.getElementsByClassName('case');

    for(const tab_case of cases) {
        if(tab_case.textContent === '') {
            equality = false;
        }
    }

    return equality;
}

/* Victoire */
function checkVictoire(playedCell, symbol = player.symbol) {
    let row = playedCell[5];
    let column = playedCell[7];

    // Check Colonne //
    let win = true;

    for (let i = 1; i < 4; i++) {
        // Vérification de l'alignement de symbole //
        if ($(`#case-${i}-${column}`).text() !== symbol) {
            win = false;
        }
    }

    if (win) {
        for (let i = 1; i < 4; i++) {
            // Colorisation des cases gagnantes //
            $(`#case-${i}-${column}`).addClass("win-cell");
        }

        return win;
    }

    // Check Ligne //
    win = true;
    for (let i = 1; i < 4; i++) {
        // Vérification de l'alignement de symbole //
        if ($(`#case-${row}-${i}`).text() !== symbol) {
            win = false;
        }
    }

    if (win) {
        for (let i = 1; i < 4; i++) {
            // Colorisation des cases gagnantes //
            $(`#case-${row}-${i}`).addClass("win-cell");
        }

        return win;
    }

    // Check Diagonale //
    win = true;

    for (let i = 1; i < 4; i++) {
        // Vérification de l'alignement de symbole //
        if ($(`#case-${i}-${i}`).text() !== symbol) {
            win = false;
        }
    }

    if (win) {
        for (let i = 1; i < 4; i++) {
            $(`#case-${i}-${i}`).addClass("win-cell");
        }

        return win;
    }

    win = false;
    // Vérification de l'alignement de symbole //
    if ($("#case-1-3").text() === symbol) {
        if ($("#case-2-2").text() === symbol) {
            if ($("#case-3-1").text() === symbol) {
                win = true;

                // Colorisation des cases gagnantes //
                $("#case-1-3").addClass("win-cell");
                $("#case-2-2").addClass("win-cell");
                $("#case-3-1").addClass("win-cell");

                return win;
            }
        }
    }
}

// Message //
const messageSend = document.getElementById('Msgform').addEventListener('submit', (e) => {
    e.preventDefault();

    const textInput = document.getElementById('message').value;
    // Efface la saisie //
    refreshSaisie();

    // Destinataire d'un message //
    const receiver = document.getElementById('receiverInput').value;

    // Vérification message non vide //
    if(textInput.length > 0) {
        // Transmission du message //
        socket.emit('newMessage', textInput, receiver);

        // Message envoyer à tous les Joueurs //
        if(receiver === "all") {
            ajoutMessage('newMessageMe', textInput);
        }

        // Message envoyer à un Joueur en privée //
        else {
            ajoutMessage('priveeMe', textInput);
        }

    }

    else {
        return false;
    }
});

// PARTIE : FONCTION //
/* Effacer le message saisie */
function refreshSaisie() {
    document.getElementById('message').value = '';
}

/* Notifier qu'un Joueur se connecte */
socket.on('newUser', (player) => {
    ajoutMessage('newUser', player.username);
});

/* Notifier qu'un Joueur se déconnecte */
socket.on('quitUser', (content) => {
    ajoutMessage('quitUser', content);
});

/* Pop-up affiché au Joueur seul dans un salon */
socket.on('quit game', () => {
    myModal3.show();
});

/* Enregistrer un nouveau Joueur */
socket.on('newUserInDb', (player) => {
    // Ajout du Joueur dans la balise 'Option' //
    newOptions = document.createElement('option');
    newOptions.textContent = player.username;
    newOptions.value = player.username;
    document.getElementById('receiverInput').appendChild(newOptions);

    // Ajout du Joueur dans le tableau //
    newTh = document.createElement('th');
    newTd = document.createElement('td');
    newTh.textContent = 'NewPlayer';
    newTh.value = 'NewPlayer';
    newTd.textContent = player.username;
    newTd.value = player.username;
    document.getElementById('table-player').appendChild(newTh);
    document.getElementById('table-player').appendChild(newTd);
});

/* Envoyer un message à tous le monde */
socket.on('newMessageAll', (content) => {
    ajoutMessage('newMessageAll', content);
});

/* Envoyer un message privée */
socket.on('privee', (content) => {
    ajoutMessage('privee', content);
});

// Fonction //
function afficheNotif() {
    // On veut que le container du bouton Chat soit visible //
    if(buttonChat.classList.contains('d-none') === false) {
        notif.classList.remove('d-none');
    }
}

function ajoutMessage(element, content) {
    const newElement = document.createElement('div');

    switch(element) {
        // Message BoxChat quand un Joueur rejoins une partie(ou crée un salon) //
        case 'newUser':
            if(boxChat.classList.contains('d-none') === true) {
                afficheNotif();
            }
            newElement.classList.add(element, 'message');
            newElement.textContent = content + ' a rejoint le chat';
            document.getElementById('messages').appendChild(newElement);
            break;
        
        // Message BoxChat quand un Joueur quitte une partie //
        case 'quitUser':
            // Notification //
            if(boxChat.classList.contains('d-none') === true) {
                afficheNotif();
            }
            newElement.classList.add(element, 'message');

            // Vérification de la validité du message //
            if(content !== null) {
                newElement.textContent = content + ' a quitté le chat';
                document.getElementById('messages').appendChild(newElement);
                break;
            }

        // Affichage pour ma BoxChat //
        case 'newMessageMe':
            newElement.classList.add(element, 'message');
                       
            // Vérification de la validité du message //
            if(content !== null) {
                newElement.textContent = '[A TOUS] Moi : ' + content;
                document.getElementById('messages').appendChild(newElement);
                break;
            }

        // Affichage pour ma BoxChat //
        case 'priveeMe':
            newElement.classList.add(element, 'message');

            // Vérification de la validité du message //
            if(content !== null) {
                newElement.innerHTML = '[PRIVE] Moi : ' + content;
                document.getElementById('messages').appendChild(newElement);
                break; 
            }
        
        // Affichgae de la BoxChat pour tous les joueurs //
        case 'newMessageAll':
            // Notification //
            if(boxChat.classList.contains('d-none') === true) {
                afficheNotif();
            }
            newElement.classList.add(element, 'message');
            newElement.innerHTML = '[A TOUS] ' + content.pseudo + ' : ' + content.message;
            document.getElementById('messages').appendChild(newElement);
            break;

        // Affichage BoxChat privée //
        case 'privee':
            // Notification //
            if(boxChat.classList.contains('d-none') === true) {
                afficheNotif();
            }
            newElement.classList.add(element, 'message');
            newElement.innerHTML = '[PRIVE] ' + content.sender + ' : ' + content.message;
            document.getElementById('messages').appendChild(newElement);
            break;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    // Popup Règle //
    const boutonRegle = document.getElementById('regle');
    const overlayPopup = document.getElementById('overlay');
    const close = document.getElementById('close');

    // Fonction lié au bouton Chat //
    function fermerChat() {
        boxChat.classList.add('d-none');
        buttonChat.classList.remove('d-none');
        boutonChat.classList.remove('d-none');
    }

    function ouvrirChat() {
        boxChat.classList.remove('d-none');
        buttonChat.classList.add('d-none');
        boutonChat.classList.add('d-none');
        notif.classList.add('d-none');
    }

    // Fonction lié au bouton Regle //
    function afficheRegle() {
        overlayPopup.style.display = 'block';

        // On veut que la Popup passe en 1er plan //
        if(boxChat.classList.contains('d-none') === false) {
            boxChat.classList.add('d-none');
        }
        
        if(buttonChat.classList.contains('d-none') === false) {
            buttonChat.classList.add('d-none');
        }

        if(boutonChat.classList.contains('d-none') === false) {
            boutonChat.classList.add('d-none');
        }
        if(notif.classList.contains('d-none') === false) {
            notif.classList.add('d-none');
        }

        // On cache le tableau des Joueurs //
        tabJoueur.classList.add('d-none');
    }
    
    function fermerRegle() {
        overlayPopup.style.display = 'none';

        // On remet en place l'affichage //
        buttonChat.classList.remove('d-none');
        boutonChat.classList.remove('d-none');
        tabJoueur.classList.remove('d-none');
    }
    
    // Lien click Bouton --> fonction //
    /* Partie : REGLE */
    boutonRegle.addEventListener('click', afficheRegle);
    close.addEventListener('click', fermerRegle)

    /* Partie : CHAT */
    boutonChat.addEventListener('click', ouvrirChat);
    closechat.addEventListener('click', fermerChat);
});