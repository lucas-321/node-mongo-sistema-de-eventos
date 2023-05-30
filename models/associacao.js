const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const Associacao = new Schema({
    nome: {
        type: String,
        required: true
    },
    sigla:{
        type: String,
        required: true
    },
    data: {
        type: Date,
        default: Date.now()
    },
    usuarioCadastro: {
        type: String
    },
    dataExclusao: {
        type: Date
    },
    usuarioExclusao: {
        type: String
    },
    ativo: {
        type: Number,
        default: 1
    }
})

mongoose.model("associacoes", Associacao)