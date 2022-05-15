const mongoose = require('mongoose');

let joueurSchema = new mongoose.Schema({
    pseudo: String
})

mongoose.model('joueur', joueurSchema);