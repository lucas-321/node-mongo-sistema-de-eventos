const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const Igreja = new Schema({
    nome: {
        type: String,
        required: true
    },
    sigla:{
        type: String,
        required: true
    },
    telefone:{
        type: String,
    },
    email:{
        type: String,
    },
    local: {
        type: Schema.Types.ObjectId,
        ref: "cidades",
        required: true
    },
    associacao: {
        type: Schema.Types.ObjectId,
        ref: "associacoes",
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

mongoose.model("igrejas", Igreja)