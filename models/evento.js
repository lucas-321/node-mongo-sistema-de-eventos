const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const Evento = new Schema({
    nome: {
        type: String,
        required: true
    },
    data: {
        type: Date,
        required: true
    },
    local: {
        type: Schema.Types.ObjectId,
        ref: "cidades",
        required: true
    },
    tema: {
        type: String
    },
    divisa: {
        type: String
    },
    tipo: {
        type: Schema.Types.ObjectId,
        ref: "tipoEventos",
        required: true
    },
    dataAbreInscricao: {
        type: Date,
        required: true
    },
    dataFechaInscricao: {
        type: Date,
        required: true
    },
    valorInscricao: {
        type: Number
    },
    totalVagas: {
        type: Number
    },
    quantidadeInscritos: {
        type: Number
    },
    custoTotalEstimado: {
        type: Number
    },
    arrecadacaoTotal: {
        type: Number,
        default: 0
    },
    custoTotal: {
        type: Number,
        default: 0
    },
    usuarioCadastro: {
        type: String
    },
    dataCadastro: {
        type: Date,
        default: Date.now()
    },
    ativo: {
        type: Number,
        default: 1
    }
})

mongoose.model("eventos", Evento)