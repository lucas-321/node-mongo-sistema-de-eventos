const express = require('express')
const router = express.Router()
const mongoose = require("mongoose")

const moment = require('moment-timezone');
moment.tz.setDefault('America/Sao_Paulo');

require('../models/usuario')
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs")
const passport =  require("passport")

require("../models/tipoEvento")
const TipoEvento = mongoose.model("tipoEventos")
require("../models/evento")
const Evento = mongoose.model("eventos")

require("../models/cidade")
const Cidade = mongoose.model("cidades")
require("../models/associacao")
const Associacao = mongoose.model("associacoes")
require("../models/igreja")
const Igreja = mongoose.model("igrejas")
require("../models/preletor")
const Preletor = mongoose.model("preletores")
require("../models/oficina")
const Oficina = mongoose.model("oficinas")

require("../models/inscricao")
const Inscricao = mongoose.model("inscricoes")


const {eAdmin} = require("../helpers/eAdmin")

router.get('/', eAdmin, (req, res) => {
    res.render("admin/index")
})

//Cadastro de Admin
router.get("/registro", (req, res) => {
    Igreja.find({ativo: 1}).lean().populate({path: 'igreja', strictPopulate: false}).sort({data: "desc"}).exec().then((igrejas) => {
        res.render("admin/registro", {igrejas: igrejas})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar as igrejas " + err)
        res.redirect("/admin")
    })
})

router.post("/registro", (req, res) => {
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome Inválido!"})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "Email Inválido!"})
    }

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "Senha Inválida!"})
    }
    
    if(req.body.senha < 4){
        erros.push({texto: "Senha muito curto, digite pelo menos 4 caracteres."})
    }

    if(req.body.senha != req.body.senha2){
        erros.push({texto: "Senhas diferentes, digite novamente por favor."})
    }

    if(erros.length > 0){
        res.render("admin/registro", {erros: erros})
    }else{

        Usuario.findOne({ email: req.body.email}).then((usuario) => {
            if(usuario){
                req.flash("error_msg", "Esse email já está cadastrado no sistema!")
                res.redirect("/admin/registro")
            }else{

                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    sexo: req.body.sexo,
                    dataNascimento: req.body.dataNascimento,
                    telefone: req.body.telefone,
                    igreja: req.body.igreja,
                    email: req.body.email,
                    senha: req.body.senha,
                    eAdmin: 1
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if(erro){
                            req.flash("error_msg", "Houve um erro durante a criação do usuário!")
                            res.redirect("/")
                        }

                        novoUsuario.senha = hash

                        novoUsuario.save().then(() => {
                            req.flash("success_msg", "Usuário criado com sucesso!")
                            res.redirect("/admin/registro")
                        })
                    })
                })
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno"+err)
            res.redirect("/")
        })
    }
})
//Fim do cadastro

//Tipo de Evento

router.get("/tipoEventos", eAdmin, (req, res) => {
    TipoEvento.find({ativo: 1}).sort({date: 'desc'}).lean().then((tipoEventos) => {
        res.render("admin/tipoEventos", {tipoEventos: tipoEventos})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar os tipos de eventos")
        res.redirect("/admin")
    })
})

router.get('/tipoEventos/add', eAdmin, (req, res) => {
    res.render("admin/addtipoEventos")
})

router.post('/tipoEventos/novo', eAdmin, (req, res) => {
    var erros = []

    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({text: "Descrição Inválida"})
    }

    if(erros.length > 0){
        res.render("admin/addtipoEventos", {erros: erros})
    }else{
        const novoTipoEvento = {
            descricao : req.body.descricao
        }

        new TipoEvento(novoTipoEvento).save().then(() => {
            req.flash("success_msg", "Tipo de Evento criado com sucesso!")
            res.redirect("/admin/tipoEventos")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao criar o tipo do evento, tente novamente!")
            res.redirect("/admin")
        })
    }

})

router.get("/tipoEventos/edit/:id", eAdmin, (req, res) => {
    TipoEvento.findOne({_id:req.params.id}).lean().then((tipoEvento) => {
        res.render("admin/edittipoEventos", {tipoEvento: tipoEvento})
    }).catch((err) => {
        req.flash("error_msg", "Este tipo de Evento não existe")
        res.redirect("/admin/tipoEventos")
    })
})

router.post("/tipoEventos/edit", eAdmin, (req, res) => {
    TipoEvento.findOne({_id: req.body.id}).then((tipoEvento) => {

        tipoEvento.descricao = req.body.descricao

        var editErros = []

        if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
            editErros.push({texto: "Descrição Inválida!"})
        }
    
        if(req.body.descricao.length < 2){
            editErros.push({texto: "Descrição do Tipo de Evento é muito pequena"})
        }

        if(editErros.length > 0){
            res.render("admin/edittipoEventos", {editErros: editErros})
        }else{
            tipoEvento.save().then(() => {
                req.flash("success_msg", "Tipo de Evento editada com sucesso!")
                res.redirect("/admin/tipoEventos")
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro interno ao salvar a edição do tipo de evento"+err)
                res.redirect("/admin/tipoEventos")
            })
        }

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar o tipo do evento "+err)
        res.redirect("/admin/tipoEventos")
    })    
})

router.post("/tipoEventos/deletar", (req, res) => {
        
    TipoEvento.findOne({_id: req.body.id}).then((tipoEvento) => {

        tipoEvento.ativo = 0

        tipoEvento.save().then(() => {
            req.flash("success_msg", "Tipo de Evento deletado com sucesso!")
            res.redirect("/admin/tipoEventos")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao deletar o Tipo de Evento")
            res.redirect("/admin/tipoEventos")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar o Tipo de Evento")
        res.redirect("/admin/tipoEventos")
    })
})

//Fim do tipo de evento

//Evento

router.get("/eventos", eAdmin, (req, res) => {
    Evento.find({ativo: 1}).lean().populate({path: 'tipo', strictPopulate: false}).sort({data: "desc"}).exec().then((eventos) => {
        res.render("admin/eventos", {eventos: eventos})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar os eventos "+err)
        res.redirect("/admin")
    })
})

router.get("/eventos/add", eAdmin, (req, res) => {
    TipoEvento.find({ativo: 1}).lean().then((tipoEventos) => {
        Cidade.find({ativo: 1}).lean().then((cidades) => {
            res.render("admin/addevento", {tipoEventos: tipoEventos, cidades: cidades})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao carregar as cidades " + err)
            res.redirect("/admin")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário " + err)
        res.redirect("/admin")
    })
})

router.post("/eventos/nova", eAdmin, (req, res) => {
    var erros = []

    if(req.body.tipoEvento == "0"){
        erros.push({texto: "Tipo de Evento Inválido, registre um tipo de evento!"})
    }

    if(erros.length > 0){
        res.render("admin/addevento", {erros: erros})
    }else{
        const novoEvento = {
            nome: req.body.nome,
            data: req.body.data,
            local: req.body.local,
            tema: req.body.tema,
            divisa: req.body.divisa,
            tipo: req.body.tipo,
            dataAbreInscricao: req.body.dataAbreInscricao,
            dataFechaInscricao: req.body.dataFechaInscricao,
            valorInscricao: req.body.valorInscricao,
            totalVagas: req.body.totalVagas,
            custoTotalEstimado: req.body.custoTotalEstimado,
            usuarioCadastro: req.body.usuarioCadastro
        }

        new Evento(novoEvento).save().then(() => {
            req.flash("success_msg", "Evento criado com sucesso!")
            res.redirect("/admin/eventos")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro durante o salvamento do evento "+err)
            res.redirect("/admin/eventos")
        })
    }
})

router.get("/eventos/edit/:id", eAdmin, (req, res) => {
    Evento.findOne({_id: req.params.id}).lean().then((evento) => {
        TipoEvento.find({ativo: 1}).lean().then((tipoEventos) => {
            Cidade.find({ativo: 1}).lean().then((cidades) => {
                res.render("admin/editeventos", {tipoEventos: tipoEventos, cidades: cidades, evento: evento})
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao carregar as cidades " + err)
                res.redirect("admin/eventos")
            })
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao carregar o formulário " + err)
            res.redirect("/admin")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário de edição")
        res.redirect("admin/eventos")
    })
})

router.post("/evento/edit", eAdmin, (req, res) => {
    Evento.findOne({_id: req.body.id}).then((evento) => {

        if (!evento) {
            // Se o evento não foi encontrado, redirecionar para a página de eventos com uma mensagem de erro
            req.flash("error_msg", "Evento não encontrado")
            return res.redirect("/admin/eventos")
        }
        // Se o evento foi encontrado, atualizar as propriedades e salvar

            evento.nome = req.body.nome
            evento.data = moment(req.body.data)
            evento.tema = req.body.tema
            evento.local = req.body.local,
            evento.divisa = req.body.divisa
            evento.tipo = req.body.tipo
            evento.dataAbreInscricao = moment(req.body.dataAbreInscricao)
            evento.dataFechaInscricao = moment(req.body.dataFechaInscricao)
            evento.valorInscricao = req.body.valorInscricao
            evento.totalVagas = req.body.totalVagas
            evento.custoTotalEstimado = req.body.custoTotalEstimado
            evento.arrecadacaoTotal = req.body.arrecadacaoTotal
            evento.custoTotal = req.body.custoTotal

            evento.save().then(() => {
                req.flash("success_msg", "Eventos editado com sucesso!")
                res.redirect("/admin/eventos")
            }).catch((err) => {
                req.flash("error_msg", "Erro Interno")
                res.redirect("/admin/eventos")
            })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao salvar a edição "+err)
        res.redirect("/admin/eventos")
    })
})

router.post("/eventos/deletar", (req, res) => {
        
    Evento.findOne({_id: req.body.id}).then((evento) => {

        evento.ativo = 0

        evento.save().then(() => {
            req.flash("success_msg", "Evento deletado com sucesso!")
            res.redirect("/admin/eventos")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao deletar o Evento")
            res.redirect("/admin/eventos")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar o Evento")
        res.redirect("/admin/eventos")
    })
})
//Fim do evento

//Cidade
router.get("/cidades", eAdmin, (req, res) => {
    Cidade.find({ativo: 1}).sort({nome: 'asc'}).lean().then((cidades) => {
        res.render("admin/cidades", {cidades: cidades})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as cidades")
        res.redirect("/admin")
    })
})

router.get('/cidades/add', eAdmin, (req, res) => {
    res.render("admin/addcidade")
})

router.post('/cidades/novo', eAdmin, (req, res) => {
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({text: "Descrição Inválida"})
    }

    if(erros.length > 0){
        res.render("admin/addcidades", {erros: erros})
    }else{
        const novoCidade = {
            nome : req.body.nome
        }

        new Cidade(novoCidade).save().then(() => {
            req.flash("success_msg", "Cidade adicionada com sucesso!")
            res.redirect("/admin/cidades")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao criar a cidade, tente novamente!")
            res.redirect("/admin")
        })
    }

})

router.get("/cidades/edit/:id", eAdmin, (req, res) => {
    Cidade.findOne({_id:req.params.id}).lean().then((cidade) => {
        res.render("admin/editcidades", {cidade: cidade})
    }).catch((err) => {
        req.flash("error_msg", "Esta cidade não existe")
        res.redirect("/admin/cidades")
    })
})

router.post("/cidades/edit", eAdmin, (req, res) => {
    Cidade.findOne({_id: req.body.id}).then((cidade) => {

        cidade.nome = req.body.nome

        var editErros = []

        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
            editErros.push({texto: "Descrição Inválida!"})
        }
    
        if(req.body.nome.length < 2){
            editErros.push({texto: "Descrição da cidade é muito pequena"})
        }

        if(editErros.length > 0){
            res.render("admin/editcidades", {editErros: editErros})
        }else{
            cidade.save().then(() => {
                req.flash("success_msg", "Cidade editada com sucesso!")
                res.redirect("/admin/cidades")
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro interno ao salvar a edição do cidade"+err)
                res.redirect("/admin/cidades")
            })
        }

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar a cidade "+err)
        res.redirect("/admin/cidades")
    })    
})

router.post("/cidades/deletar", (req, res) => {
        
    Cidade.findOne({_id: req.body.id}).then((cidade) => {

        cidade.ativo = 0

        cidade.save().then(() => {
            req.flash("success_msg", "Cidade deletada com sucesso!")
            res.redirect("/admin/cidades")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao deletar a Cidade")
            res.redirect("/admin/cidades")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar a Cidade")
        res.redirect("/admin/cidades")
    })
})
//Fim cidade

//Associação
router.get("/associacoes", eAdmin, (req, res) => {
    Associacao.find({ativo: 1}).sort({nome: 'asc'}).lean().then((associacoes) => {
        res.render("admin/associacoes", {associacoes: associacoes})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as associações")
        res.redirect("/admin")
    })
})

router.get('/associacoes/add', eAdmin, (req, res) => {
    res.render("admin/addassociacao")
})

router.post('/associacoes/novo', eAdmin, (req, res) => {
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({text: "Descrição Inválida"})
    }

    if(erros.length > 0){
        res.render("admin/addassociacoes", {erros: erros})
    }else{
        const novoAssociacao = {
            nome : req.body.nome,
            sigla: req.body.sigla,
            usuarioCadastro : req.body.usuarioCadastro
        }

        new Associacao(novoAssociacao).save().then(() => {
            req.flash("success_msg", "Associação adicionada com sucesso!")
            res.redirect("/admin/associacoes")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao criar a associação, tente novamente!")
            res.redirect("/admin")
        })
    }

})

router.get("/associacoes/edit/:id", eAdmin, (req, res) => {
    Associacao.findOne({_id:req.params.id}).lean().then((associacao) => {
        res.render("admin/editassociacoes", {associacao: associacao})
    }).catch((err) => {
        req.flash("error_msg", "Esta associação não existe")
        res.redirect("/admin/associacoes")
    })
})

router.post("/associacoes/edit", eAdmin, (req, res) => {
    Associacao.findOne({_id: req.body.id}).then((associacao) => {

        associacao.nome = req.body.nome
        associacao.sigla = req.body.sigla

        var editErros = []

        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
            editErros.push({texto: "Descrição Inválida!"})
        }
    
        if(req.body.nome.length < 2){
            editErros.push({texto: "Descrição da associação é muito pequena"})
        }

        if(editErros.length > 0){
            res.render("admin/editassociacoes", {editErros: editErros})
        }else{
            associacao.save().then(() => {
                req.flash("success_msg", "Associação editada com sucesso!")
                res.redirect("/admin/associacoes")
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro interno ao salvar a edição do associação"+err)
                res.redirect("/admin/associacoes")
            })
        }

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar a associação "+err)
        res.redirect("/admin/associacoes")
    })    
})

router.post("/associacoes/deletar", (req, res) => {
        
    Associacao.findOne({_id: req.body.id}).then((associacao) => {
        associacao.ativo = 0
        associacao.usuarioExclusao = req.body.usuarioExclusao

        associacao.save().then(() => {
            req.flash("success_msg", "Associação deletada com sucesso!")
            res.redirect("/admin/associacoes")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao deletar a Associação")
            res.redirect("/admin/associacoes")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar a Igreja")
        res.redirect("/admin/associacoes")
    })
})
//Fim Associação

//Igreja
router.get("/igrejas", eAdmin, (req, res) => {
    Igreja.find({ativo: 1}).lean().populate({path: 'associacao', strictPopulate: false}).populate({path: 'local', select: 'nome'}).sort({data: "desc"}).exec().then((igrejas) => {
        res.render("admin/igrejas", {igrejas: igrejas})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar os igrejas "+err)
        res.redirect("/admin")
    })
})

router.get("/igrejas/add", eAdmin, (req, res) => {
    Associacao.find({ativo: 1}).lean().then((associacoes) => {
        Cidade.find({ativo: 1}).lean().then((cidades) => {
            res.render("admin/addigreja", {associacoes: associacoes, cidades: cidades})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao carregar as cidades " + err)
            res.redirect("/admin")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário " + err)
        res.redirect("/admin")
    })
})

router.post("/igrejas/nova", eAdmin, (req, res) => {
    var erros = []

    if(req.body.associacao == "0"){
        erros.push({texto: "Associação Inválida, registre uma associação!"})
    }

    if(erros.length > 0){
        res.render("admin/addigreja", {erros: erros})
    }else{
        const novaIgreja = {
            nome: req.body.nome,
            sigla: req.body.sigla,
            local: req.body.local,
            telefone: req.body.telefone,
            email: req.body.email,
            associacao: req.body.associacao,
            usuarioCadastro: req.body.usuarioCadastro
        }

        new Igreja(novaIgreja).save().then(() => {
            req.flash("success_msg", "Igreja criada com sucesso!")
            res.redirect("/admin/igrejas")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro durante o salvamento da igreja "+err)
            res.redirect("/admin/igrejas")
        })
    }
})

router.get("/igrejas/edit/:id", eAdmin, (req, res) => {
    Igreja.findOne({_id: req.params.id}).lean().then((igreja) => {
        Associacao.find({ativo: 1}).lean().then((associacoes) => {
            Cidade.find({ativo: 1}).lean().then((cidades) => {
                res.render("admin/editigrejas", {associacoes: associacoes, cidades: cidades, igreja: igreja})
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao carregar as cidades " + err)
                res.redirect("admin/igrejas")
            })
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao carregar o formulário " + err)
            res.redirect("/admin")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário de edição")
        res.redirect("admin/igrejas")
    })
})

router.post("/igreja/edit", eAdmin, (req, res) => {
    Igreja.findOne({_id: req.body.id}).then((igreja) => {

        if (!igreja) {
            req.flash("error_msg", "Igreja não encontrada")
            return res.redirect("/admin/igrejas")
        }

            igreja.nome = req.body.nome
            igreja.sigla = req.body.sigla
            igreja.local = req.body.local
            igreja.telefone = req.body.telefone
            igreja.email = req.body.email
            igreja.associacao = req.body.associacao

            igreja.save().then(() => {
                req.flash("success_msg", "Igreja editada com sucesso!")
                res.redirect("/admin/igrejas")
            }).catch((err) => {
                req.flash("error_msg", "Erro Interno")
                res.redirect("/admin/igrejas")
            })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao salvar a edição "+err)
        res.redirect("/admin/igrejas")
    })
})

router.post("/igrejas/deletar", (req, res) => {
        
    Igreja.findOne({_id: req.body.id}).then((igreja) => {

        igreja.ativo = 0

        igreja.save().then(() => {
            req.flash("success_msg", "Igreja deletada com sucesso!")
            res.redirect("/admin/igrejas")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao deletar o Igreja")
            res.redirect("/admin/igrejas")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar a Igreja")
        res.redirect("/admin/igrejas")
    })
})
//Fim Igreja

//Preletor
router.get("/preletores", eAdmin, (req, res) => {
    Preletor.find({ativo: 1}).sort({nome: 'asc'}).lean().then((preletores) => {
        res.render("admin/preletores", {preletores: preletores})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar os preletores")
        res.redirect("/admin")
    })
})

router.get('/preletores/add', eAdmin, (req, res) => {
    res.render("admin/addpreletor")
})

router.post('/preletores/novo', eAdmin, (req, res) => {
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({text: "Descrição Inválida"})
    }

    if(erros.length > 0){
        res.render("admin/addpreletores", {erros: erros})
    }else{
        const novoPreletor = {
            nome : req.body.nome,
            email: req.body.email,
            telefone: req.body.telefone,
            usuarioCadastro : req.body.usuarioCadastro
        }

        new Preletor(novoPreletor).save().then(() => {
            req.flash("success_msg", "Preletor adicionado com sucesso!")
            res.redirect("/admin/preletores")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao criar a preletor, tente novamente!" +err)
            res.redirect("/admin")
        })
    }

})

router.get("/preletores/edit/:id", eAdmin, (req, res) => {
    Preletor.findOne({_id:req.params.id}).lean().then((preletor) => {
        res.render("admin/editpreletores", {preletor: preletor})
    }).catch((err) => {
        req.flash("error_msg", "Este preletor não existe")
        res.redirect("/admin/preletores")
    })
})

router.post("/preletores/edit", eAdmin, (req, res) => {
    Preletor.findOne({_id: req.body.id}).then((preletor) => {

        preletor.nome = req.body.nome
        preletor.email = req.body.email
        preletor.telefone = req.body.telefone

        var editErros = []

        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
            editErros.push({texto: "Descrição Inválida!"})
        }
    
        if(req.body.nome.length < 2){
            editErros.push({texto: "Descrição do preletor é muito pequena"})
        }

        if(editErros.length > 0){
            res.render("admin/editpreletores", {editErros: editErros})
        }else{
            preletor.save().then(() => {
                req.flash("success_msg", "Preletor editado com sucesso!")
                res.redirect("/admin/preletores")
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro interno ao salvar a edição do preletor"+err)
                res.redirect("/admin/preletores")
            })
        }

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar o preletor "+err)
        res.redirect("/admin/preletores")
    })    
})

router.post("/preletores/deletar", (req, res) => {
        
    Preletor.findOne({_id: req.body.id}).then((preletor) => {
        preletor.ativo = 0
        preletor.usuarioExclusao = req.body.usuarioExclusao

        preletor.save().then(() => {
            req.flash("success_msg", "Associação deletada com sucesso!")
            res.redirect("/admin/preletores")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao deletar a Associação")
            res.redirect("/admin/preletores")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar a Igreja")
        res.redirect("/admin/preletores")
    })
})
//Fim Preletor

//Oficina
router.get("/oficinas", eAdmin, (req, res) => {
    Oficina.find({ativo: 1}).lean().populate({path: 'evento', strictPopulate: false}).populate({path: 'preletor', select: 'nome'}).sort({data: "desc"}).exec().then((oficinas) => {
        res.render("admin/oficinas", {oficinas: oficinas})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar os oficinas "+err)
        res.redirect("/admin")
    })
})

router.get("/oficinas/add", eAdmin, (req, res) => {
    Evento.find({ativo: 1}).lean().then((eventos) => {
        Preletor.find({ativo: 1}).lean().then((preletores) => {
            res.render("admin/addoficina", {eventos: eventos, preletores: preletores})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao carregar as preletores " + err)
            res.redirect("/admin")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário " + err)
        res.redirect("/admin")
    })
})

router.post("/oficinas/nova", eAdmin, (req, res) => {
    var erros = []

    if(req.body.evento == "0"){
        erros.push({texto: "Evento Inválido, registre um evento!"})
    }

    if(erros.length > 0){
        res.render("admin/addoficina", {erros: erros})
    }else{
        const novaOficina = {
            titulo: req.body.titulo,
            quantidadeInscritos: req.body.quantidadeInscritos,
            evento: req.body.evento,
            preletor: req.body.preletor,
            usuarioCadastro: req.body.usuarioCadastro
        }

        new Oficina(novaOficina).save().then(() => {
            req.flash("success_msg", "Oficina criada com sucesso!")
            res.redirect("/admin/oficinas")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro durante o salvamento da oficina "+err)
            res.redirect("/admin/oficinas")
        })
    }
})

router.get("/oficinas/edit/:id", eAdmin, (req, res) => {
    Oficina.findOne({_id: req.params.id}).lean().then((oficina) => {
        Evento.find({ativo: 1}).lean().then((eventos) => {
            Preletor.find({ativo: 1}).lean().then((preletores) => {
                res.render("admin/editoficinas", {eventos: eventos, preletores: preletores, oficina: oficina})
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao carregar as preletores " + err)
                res.redirect("admin/oficinas")
            })
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao carregar o formulário " + err)
            res.redirect("/admin")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário de edição")
        res.redirect("admin/oficinas")
    })
})

router.post("/oficina/edit", eAdmin, (req, res) => {
    Oficina.findOne({_id: req.body.id}).then((oficina) => {

        if (!oficina) {
            req.flash("error_msg", "Oficina não encontrada")
            return res.redirect("/admin/oficinas")
        }

            oficina.titulo = req.body.titulo
            oficina.quantidadeInscritos = req.body.quantidadeInscritos
            oficina.evento = req.body.evento
            oficina.preletor = req.body.preletor

            oficina.save().then(() => {
                req.flash("success_msg", "Oficina editada com sucesso!")
                res.redirect("/admin/oficinas")
            }).catch((err) => {
                req.flash("error_msg", "Erro Interno")
                res.redirect("/admin/oficinas")
            })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao salvar a edição "+err)
        res.redirect("/admin/oficinas")
    })
})

router.post("/oficinas/deletar", (req, res) => {
        
    Oficina.findOne({_id: req.body.id}).then((oficina) => {

        oficina.ativo = 0

        oficina.save().then(() => {
            req.flash("success_msg", "Oficina deletada com sucesso!")
            res.redirect("/admin/oficinas")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao deletar o Oficina")
            res.redirect("/admin/oficinas")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar a Oficina")
        res.redirect("/admin/oficinas")
    })
})
//Fim oficina

//Inscrição
router.get("/inscricoes", eAdmin, (req, res) => {
    Evento.find({ ativo: 1 }).lean()
        .populate({ path: 'tipo', strictPopulate: false })
        .sort({ data: "desc" })
        .exec()
        .then(async (eventos) => {
            for (const evento of eventos) {
                const inscritos = await Inscricao.countDocuments({ evento: evento._id, confirmacao: 1 });
                const vagasRestantes = evento.totalVagas - inscritos;
                evento.vagasRestantes = vagasRestantes;
                evento.inscritos = inscritos;
            }
            res.render("admin/inscricoes", { eventos: eventos });
        })
        .catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar os eventos " + err);
            res.redirect("/admin");
        });
});

//Fim do teste

router.get("/inscricoes/gerenciar/:id", eAdmin, (req, res) => {
    Inscricao.find({ evento: req.params.id, ativo: 1 }).lean()
        .populate({ path: 'evento', model: 'eventos', select: 'nome' })
        .populate({ path: 'usuario', model: 'admin', select: 'nome' })
        .sort({ data: "desc" })
        .exec()
        .then((inscricoes) => {
            res.render("admin/manageinscricoes", { inscricoes: inscricoes });
        })
        .catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as inscrições " + err);
            res.redirect("/admin");
        });
});

//Teste

//Fim teste

router.post("/inscricoes/confirmar", (req, res) => {
        
    Inscricao.findOne({_id: req.body.inscricao}).then((inscricao) => {

        inscricao.confirmacao = 1

        inscricao.save().then(() => {
            req.flash("success_msg", "Inscrição confirmada com sucesso!")
            res.redirect("/admin/inscricoes")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao confirmar a inscrição")
            res.redirect("/admin/inscricoes")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao confirmar a inscrição"+err)
        res.redirect("/admin/inscricoes")
    })
})

router.post("/inscricoes/cancelar_confirmacao", (req, res) => {
        
    Inscricao.findOne({_id: req.body.inscricao}).then((inscricao) => {

        inscricao.confirmacao = 0

        inscricao.save().then(() => {
            req.flash("success_msg", "Inscrição desconfirmada!")
            res.redirect("/admin/inscricoes")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao desconfirmar a inscrição")
            res.redirect("/admin/inscricoes")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao desconfirmar a inscrição"+err)
        res.redirect("/admin/inscricoes")
    })
})
//Fim inscrição

module.exports = router
