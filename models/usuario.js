const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Usuario = new Schema({
    nome:{
        type: String,
        required: true
    },
    sexo:{
        type: String
    },
    dataNascimento:{
        type: Date
    },
    email:{
        type: String,
        required: true
    },
    telefone:{
        type: String
    },
    igreja: {
        type: Schema.Types.ObjectId,
        ref: "igrejas",
        required: true
    },
    senha:{
        type: String,
        required: true
    },
    eAdmin:{
        type: Number,
        default: 0
    },
    dataCadastro:{
        type: Date,
        default: Date.now()
    },
    dataExclusao:{
        type: Date
    },
    usuarioExclusao:{
        type: String
    },
    ativo:{
        type: Number,
        default: 1
    }
})

mongoose.model("usuarios", Usuario)