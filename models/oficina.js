const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const Oficina = new Schema({
    titulo: {
        type: String,
        required: true
    },
    quantidadeInscritos:{
        type: Number,
        required: true
    },
    evento: {
        type: Schema.Types.ObjectId,
        ref: "eventos",
        required: true
    },
    preletor: {
        type: Schema.Types.ObjectId,
        ref: "preletores",
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

mongoose.model("oficinas", Oficina)