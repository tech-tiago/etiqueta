const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');

// Configuração da conexão com o banco de dados
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // seu usuário
  password: '', // sua senha
  database: 'etiqueta', // seu banco de dados
  timezone: '-03:00',
  charset: 'utf8mb4',
  connectTimeout: 10000,
});

module.exports = function(passport) {
    passport.use(new LocalStrategy((username, password, done) => {
        // Consulta o banco de dados pelo usuário
        const query = 'SELECT * FROM user WHERE username = ?';
        connection.query(query, [username], (error, results) => {
            if (error) {
                return done(error);
            }
            if (results.length === 0) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            const user = results[0];
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Incorrect password.' });
                }
            });
        });
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        const query = 'SELECT * FROM user WHERE id = ?';
        connection.query(query, [id], (error, results) => {
            if (error) {
                return done(error);
            }
            done(null, results[0]);
        });
    });
};
