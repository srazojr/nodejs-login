const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUser = async (email, password, done) => {
        const user = getUserByEmail(email)
        if (user == null) {
            return done(null, false, { message: "Incorrect password/username combination" })
        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                console.log(`Password confirmed for ${user.name}`)
                return done(null, user)
            } else {
                return done(null, false, { message: "Incorrect password/username combination" })
            }
        } catch (e) {
            return done(e)
        }
    }

    passport.use(new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: "password"
        },
        authenticateUser)
    )
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id))
    })
}

module.exports = initialize