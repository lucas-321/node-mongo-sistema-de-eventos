const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const TipoEvento = new Schema({
    descricao: {
        type: String,
        required: true
    },
    ativo: {
        type: Number,
        default: 1
    }
})

mongoose.model("tipoEventos", TipoEvento)