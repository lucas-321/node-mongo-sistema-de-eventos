const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/usuario')
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs")
const passport =  require("passport")

require("../models/igreja")
const Igreja = mongoose.model("igrejas")

require("../models/evento")
const Evento = mongoose.model("eventos")

require("../models/inscricao")
const Inscricao = mongoose.model("inscricoes")

router.get("/registro", (req, res) => {
    Igreja.find({ativo: 1}).lean().populate({path: 'igreja', strictPopulate: false}).sort({data: "desc"}).exec().then((igrejas) => {
        res.render("usuarios/registro", {igrejas: igrejas})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar as igrejas " + err)
        res.redirect("/usuarios")
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
        res.render("usuarios/registro", {erros: erros})
    }else{

        Usuario.findOne({ email: req.body.email}).then((usuario) => {
            if(usuario){
                req.flash("error_msg", "Esse email já está cadastrado no sistema!")
                res.redirect("/usuarios/registro")
            }else{

                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    sexo: req.body.sexo,
                    dataNascimento: req.body.dataNascimento,
                    telefone: req.body.telefone,
                    igreja: req.body.igreja,
                    email: req.body.email,
                    senha: req.body.senha,
                    // eAdmin: 1
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
                            res.redirect("/usuarios/registro")
                        })
                    })
                })
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    }
})

router.get("/usuarios/edit/:id", (req, res) => {
    Usuario.findOne({_id: req.params.id}).lean().then((usuario) => {
        Igreja.find({ativo: 1}).lean().then((igrejas) => {
                res.render("usuarios/editusuarios", {igrejas: igrejas, usuario: usuario})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao carregar o formulário " + err)
            res.redirect("/usuario")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário de edição")
        res.redirect("usuarios/")
    })
})

router.post("/usuarios/edit", (req, res) => {
    Usuario.findOne({_id: req.body.id}).then((usuario) => {

        if (!usuario) {
            req.flash("error_msg", "Usuário não encontrado")
            return res.redirect("/")
        }

        usuario.nome = req.body.nome
        usuario.sexo = req.body.sexo
        usuario.dataNascimento = req.body.dataNascimento
        usuario.igreja = req.body.igreja
        usuario.telefone = req.body.telefone
        usuario.email = req.body.email

        // Verifica se a senha atual está correta
        bcrypt.compare(req.body.senhaAtual, usuario.senha, (erro, batem) => {
            if (batem) {
                // Se a senha atual estiver correta, atualiza a senha
                if (req.body.senha && req.body.senha.trim() !== '') {
                    bcrypt.hash(req.body.senha, 10, (err, hash) => {
                        if (err) {
                            req.flash("error_msg", "Erro ao criar hash da senha")
                            return res.redirect("/")
                        }
                        usuario.senha = hash
                        usuario.save().then(() => {
                            req.flash("success_msg", "Senha alterada com sucesso!")
                            res.redirect("/")
                        }).catch((err) => {
                            req.flash("error_msg", "Erro ao salvar a edição "+err)
                            res.redirect("/" +err)
                        })
                    })
                } else {
                    // Se a nova senha não foi fornecida, apenas salva as outras informações do usuário
                    usuario.save().then(() => {
                        req.flash("success_msg", "Usuário editado com sucesso!")
                        res.redirect("/")
                    }).catch((err) => {
                        req.flash("error_msg", "Erro Interno")
                        res.redirect("/" + err)
                    })
                }
            } else {
                // Se a senha atual estiver incorreta, retorna uma mensagem de erro
                req.flash("error_msg", "Senha atual incorreta, tente novamente!")
                res.redirect("/")
            }
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao salvar a edição "+err)
        res.redirect("/" +err)
    })
})

//Inscricao
router.post("/inscricoes/nova", (req, res) => {

    console.log(req.body)
        
    const novaInscricao = {
        usuario: req.body.usuario,
        evento: req.body.evento,
        usuarioCadastro: req.body.usuarioCadastro
    }

    new Inscricao(novaInscricao).save().then(() => {
        req.flash("success_msg", "Inscrição realizada, realize o pagamento para confirmar sua inscrição!")
        res.redirect("/")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro durante o salvamento da inscrição "+err)
        res.redirect("/")
    })

})

router.post("/inscricoes/deletar", (req, res) => {
        
    Inscricao.findOne({_id: req.body.inscricao}).then((inscricao) => {

        inscricao.ativo = 0

        inscricao.save().then(() => {
            req.flash("success_msg", "Inscrição cancelada com sucesso!")
            res.redirect("/")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao deletar a Inscrição")
            res.redirect("/")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar a Inscrição")
        res.redirect("/")
    })
})

router.post("/inscricoes/reativar", (req, res) => {
        
    Inscricao.findOne({_id: req.body.inscricao}).then((inscricao) => {

        inscricao.ativo = 1

        inscricao.save().then(() => {
            req.flash("success_msg", "Inscrição reativada com sucesso!")
            res.redirect("/")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao reativar a Inscrição")
            res.redirect("/")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao reativar a Inscrição")
        res.redirect("/")
    })
})

//Fim Inscrição

router.get("/login", (req, res) => {
    res.render("usuarios/login")
})

router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true 
    })(req, res, next)
})

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        req.flash('success_msg', "Deslogado com sucesso!")
        res.redirect("/")
    })
})

module.exports = router