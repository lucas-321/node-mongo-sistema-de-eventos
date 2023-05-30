const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const Inscricao = new Schema({
    usuario: {
        type: Schema.Types.ObjectId,
        ref: "usuarios",
        required: true
    },
    evento: {
        type: Schema.Types.ObjectId,
        ref: "eventos",
        required: true
    },
    confirmacao:{
        type: Number,
        default: 0
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

mongoose.model("inscricoes", Inscricao)