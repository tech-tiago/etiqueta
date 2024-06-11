const LocalStrategy = require('passport-local').Strategy;
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

// Criando conexão com o banco
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'etiqueta',
    timezone: '-03:00',
    charset: 'utf8mb4',
    connectTimeout: 10000,
});

connection.connect((error) => {
    if (error) throw error;
    console.log('Conectado ao banco de dados MySQL.');
});

module.exports = function(passport) {
    passport.use(new LocalStrategy(
        function(username, password, done) {
            const query = 'SELECT * FROM user WHERE username = ?';
            connection.query(query, [username], (error, results) => {
                if (error) return done(error);

                if (results.length === 0) {
                    return done(null, false, { message: 'Usuário não encontrado' });
                }

                const user = results[0];

                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) return done(err);
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Senha incorreta' });
                    }
                });
            });
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        const query = 'SELECT * FROM user WHERE id = ?';
        connection.query(query, [id], (error, results) => {
            if (error) return done(error);
            done(null, results[0]);
        });
    });
};
