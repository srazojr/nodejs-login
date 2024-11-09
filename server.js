if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
console.log("Starting server...")
console.log("Connect to http://localhost:3000/")
const express = require("express")
const app = express()
const bcrypt = require('bcrypt');
const initializePassport = require("./passport.js")
const passport = require("passport")
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
initializePassport(passport,
    email => {
        return userDatabase.find(user => user.email === email)
    },
    id => {
        return userDatabase.find(user => user.id === id)
    }
)

const userDatabase = [
    {
        id: "1",
        email: "email1@example.com",
        name: "User1",
        password: "$2b$10$3uM53NvKhrhY/thp7K79Z.T.Ouh8RFfrwsnavcFPe6K/Mvx1DU..i"//12345678
    },
    {
        id: "2",
        email: "email2@example.com",
        name: "User2",
        password: "$2b$10$hfn3KQJWKUFxRhhA8uevyuNbhsnJE0NKBuDznuRd6IGYkhVOjOkYS"//23456789
    },
]
async function hashPassword(password) {
    const hash = await bcrypt.hash(password, 10);
    return hash;
}

const confirmPassword = async (password, passwordHash) => {
    valid = await bcrypt.compare(password, passwordHash);
    return valid
}

// hashPassword("12345678").then((salt0) => { console.log(`salt0= ${salt0}`) })
// hashPassword("23456789").then((salt1) => { console.log(`salt1= ${salt1}`) })
// confirmPassword("12345678", userDatabase[0].passwordHash).then(r => console.log(`correct0 ${r}`))
// confirmPassword("2345678", userDatabase[0].passwordHash).then(r => console.log(`wrong0 ${r}`))
// confirmPassword("23456789", userDatabase[1].passwordHash).then(r => console.log(`correct1 ${r}`))
// confirmPassword("12345678", userDatabase[1].passwordHash).then(r => console.log(`wrong1 ${r}`))

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))/*(req, res) => {
    console.log(`Logging in ${req.body.email}`)
    res.redirect("/")
    })*/


app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await hashPassword(req.body.password)
        let exists = false;
        for (user of userDatabase) {
            //console.log(user.email + ":" + req.body.email)
            if (user.email == req.body.email.trim()) {
                exists = true;
                break
            }
        }
        if (!exists) {
            userDatabase.push({
                id: Date.now().toString(),
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword
            })
        }
        console.log(userDatabase)
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
})

app.post('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

app.listen(3000)