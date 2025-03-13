const mysql = require('mysql');

var conn = mysql.createConnection({
    host: 'localhost',
    database: 'sakila',
    user: 'root',
    password: 'P@s$Wrd_4_Mys@l',
    multipleStatements: true
});

module.exports = conn;