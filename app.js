const express = require("express")
const handlebars = require("express-handlebars")
const bodyParser = require('body-parser')
const app = express()
const admin = require('./routes/admin')
const path = require("path")
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
// require("./models/postagem")
// const Postagem = mongoose.model('postagens')
// require("./models/categoria")
// const Categoria = mongoose.models('categorias')

//Meus models
require("./models/tipoEvento")
const TipoEvento = mongoose.model("tipoEventos")
require("./models/evento")
const Evento = mongoose.model('eventos')
require("./models/inscricao")
const Inscricao = mongoose.model("inscricoes")
//Fim dos meus models

const usuarios = require("./routes/usuario")
const passport = require('passport')
require("./config/auth")(passport)


//Importar e registrar o helper dateFormat
const Handlebars = require('handlebars');
const dateFormat = require('handlebars-dateformat');
Handlebars.registerHelper('dateFormat', dateFormat);

//eq
Handlebars.registerHelper('eq', function(value, options) {
if (value === options.hash.compare) {
    return options.fn(this);
}
return options.inverse(this);
});


//Configurações
    //Sessão
        app.use(session({
            secret: "jubalnode",
            reave: true,
            saveUninitialized: true
        }))
        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())
    //Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null;
            if (req.user) {
                res.locals.nomeDoUsuario = req.user.nome
                res.locals.idDoUsuario = req.user._id
                res.locals.eAdmin = req.user.eAdmin
            }
            next()
        })
    //BodyParser
        app.use(express.urlencoded({extended: true}))
        app.use(express.json())
    //Handlebars
        app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars')
    //Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect("mongodb://0.0.0.0/jubal").then(() => {
            console.log("Conectado ao mongo")
        }).catch((err) => {
                console.log("Erro ao se conectar: "+err)
        })
    //Public
        app.use(express.static(path.join(__dirname,"public")))
        app.use((req, res, next) => {
            console.log("Middleware works")
            next()
        })
//Rotas
        app.get('/', (req, res) => {
            if (req.user) {
                //Define a variável "nomeDoUsuario" com o nome do usuário logado
                const nomeDoUsuario = req.user.nome

                Evento.find({ ativo: 1 }).lean().populate({ path: 'tipo', strictPopulate: false }).populate({ path: 'local', select: 'nome' }).sort({ data: "desc" }).then((eventos) => {
                    const usuarioId = req.user._id;
                    const inscricoesPromises = eventos.map(evento => Inscricao.findOne({ usuario: usuarioId, evento: evento._id }));
                    const totalInscritosPromises = eventos.map(evento => Inscricao.countDocuments({ evento: evento._id, ativo: 1 }));
                    const dataAtual = new Date();

                    Promise.all(inscricoesPromises)
                    .then(inscricoes => {
                        Promise.all(totalInscritosPromises)
                        .then(totalInscritos => {
                            eventos.forEach((evento, index) => {
                            evento.usuarioInscrito = inscricoes[index] !== null;

                            if (inscricoes[index]) {
                                evento.ativo = inscricoes[index].ativo;
                                evento.confirmacao = inscricoes[index].confirmacao;
                                evento.inscricaoId = inscricoes[index]._id;
                            }

                            evento.totalInscritos = totalInscritos[index]; // Adiciona o total de inscritos ao evento
                            evento.vagasEsgotadas = evento.totalVagas && evento.totalInscritos >= evento.totalVagas; // Verifica se as vagas estão esgotadas
                            evento.dentroDoPeriodo = dataAtual >= evento.dataAbreInscricao && dataAtual < evento.dataFechaInscricao; // Verifica se está dentro do período de inscrições
                            });

                            res.render("index", { eventos: eventos });
                        })
                        .catch(err => {
                            req.flash("error_msg", "Houve um erro interno");
                            res.redirect("/404");
                        });
                    })
                    .catch(err => {
                        req.flash("error_msg", "Houve um erro interno");
                        res.redirect("/404");
                    });
                })
                .catch((err) => {
                    req.flash("error_msg", "Houve um erro interno");
                    res.redirect("/404");
                });

            } else {
            res.render('index', { user: req.user })
            }
        })
        // app.get('/', (req, res) => {
        //     res.send("Página Principal!")
        // })

        app.get("/404", (req, res) => {
            res.send("Erro 404!")
        })

        app.use('/admin', admin)
        app.use("/usuarios", usuarios)
//Outros
const PORT = process.env.PORT   || 8081
app.listen(PORT, () => {
    console.log("Servidor Rodando!")
})