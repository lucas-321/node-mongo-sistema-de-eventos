const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const Cidade = new Schema({
    nome: {
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

mongoose.model("cidades", Cidade)