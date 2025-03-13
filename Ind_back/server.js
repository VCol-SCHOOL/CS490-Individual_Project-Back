const express = require('express');
const mysql = require('mysql');
app=express();
var bodyParser = require('body-parser');

const conn = require('./sakila_db/db');

//app.use(express.json)
app.use((req, res, next)=> {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origon, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    next();
});

app.use(bodyParser.urlencoded({extended: true})) 
app.use(bodyParser.json()) 

app.get('/t1', (req, res)=>{
    //res.set('Content-Type', 'application/json');
    var query = `
    SELECT sakila.film.film_id, sakila.film.title, count(sakila.film.title) rented, 
    sakila.film.description, sakila.film.release_year
    FROM sakila.film
    INNER JOIN sakila.inventory ON sakila.inventory.film_id = sakila.film.film_id
    INNER JOIN sakila.rental ON sakila.inventory.inventory_id = sakila.rental.inventory_id
    GROUP BY sakila.film.film_id
    ORDER BY rented DESC LIMIT 5;
    `
    conn.query(query, (err, result)=>{
        if(err) throw err;
        res.send(result);
        res.end();
    })
});

app.get('/t2', (req, res)=>{
    //res.set('Content-Type', 'application/json');
    var query = `
    SELECT sakila.actor.actor_id, sakila.actor.first_name, 
    sakila.actor.last_name, COUNT(*) movies
    FROM sakila.actor 
    JOIN sakila.film_actor
    ON sakila.actor.actor_id = sakila.film_actor.actor_id
    Group BY actor_id ORDER BY movies DESC LIMIT 5;
    `
    conn.query(query, (err, result)=>{
        if(err) throw err;
        res.send(result);
        res.end();
    })
});

app.get('/t3', (req, res)=>{
    //res.set('Content-Type', 'application/json');
    var query = `
    SELECT sakila.film.film_id, sakila.film.title, sakila.category.name, 
    sakila.actor.first_name, sakila.actor.last_name,
    sakila.film.description, sakila.film.release_year
    FROM sakila.film
    INNER JOIN sakila.film_category 
    ON sakila.film.film_id = sakila.film_category.film_id
    INNER JOIN sakila.category
    ON sakila.film_category.category_id = sakila.category.category_id
    INNER JOIN sakila.film_actor
    ON sakila.film.film_id = sakila.film_actor.film_id
    INNER JOIN sakila.actor
    ON sakila.film_actor.actor_id = sakila.actor.actor_id;
    `
    conn.query(query, (err, result)=>{
        if(err) throw err;
        res.send(result);
        res.end();
    })
});

app.get('/t4', (req, res)=>{
    //res.set('Content-Type', 'application/json');
    var query = `
    SELECT customer.customer_id, customer.store_id, customer.first_name, customer.last_name, 
    customer.email, address.address, address.phone, customer.create_date, customer.last_update
    FROM sakila.customer LEFT JOIN sakila.address ON customer.address_id = address.address_id;
    `
    conn.query(query, (err, result)=>{
        if(err) throw err;
        res.send(result);
        res.end();
    })
});

app.post('/t4', (req, res)=>{
    let timeStamp = new Date();
    let entry = {
    customer_id: req.body.customer_id,
    store_id: 1,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    address_id: Number(req.body.customer_id)+6,
    active: 1,
    create_date: timeStamp,
    last_update: timeStamp
    };
    let query = `INSERT INTO sakila.address VALUES(?,?,?,?,?,?,?, POINT(-112.8185647, 49.6999986),?);
    INSERT INTO sakila.customer SET ?;`;
    conn.query(query, [Number(req.body.customer_id)+6, req.body.address, null, 
        "QLD", 576, '', req.body.phone, timeStamp, entry], (err, result)=>{
        if(err) throw err;
        res.send(result);
        res.end();
    })
});

app.put('/t4/:id', (req, res)=>{
    let timeStamp = new Date();
    let entry = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    active: 1,
    last_update: timeStamp
    };
    let entry_a = {
        address: req.body.address,
        address: req.body.phone
    };
    let query = `UPDATE sakila.customer SET ? Where customer_id = ?;
    UPDATE sakila.address SET ? Where address_id = ?`;
    conn.query(query, [entry, req.params.id, entry_a, Number(req.params.id)+6], 
    (err, result)=>{
        if(err) throw err;
        res.send(result);
        res.end();
    })
});

app.delete('/t4/:id', (req, res)=>{
    //req.body.customer_id = parseInt(req.body.customer_id);
    let query = `DELETE FROM sakila.customer WHERE customer_id = ?;
    DELETE FROM sakila.address WHERE address_id = ?`;
    conn.query(query, [req.params.id, Number(req.params.id)+6], (err, result)=>{
        if(err)
            throw err;
        res.send(result);
        res.end();
    })
});

app.get('/t2/:place', (req, res)=>{
    let spec = '';
    if(req.params.place == '1') spec = '1';
    else if(req.params.place == '2') spec = '1,1';
    else if(req.params.place == '2') spec = '2,1';
    else if(req.params.place == '4') spec = '3,1';
    else if(req.params.place == '5') spec = '4,1';
    var query = `SELECT sakila.film.film_id, sakila.film.title, count(sakila.film.title) rented
FROM sakila.film
INNER JOIN sakila.inventory ON sakila.inventory.film_id = sakila.film.film_id
INNER JOIN sakila.rental ON sakila.inventory.inventory_id = sakila.rental.inventory_id
INNER JOIN
(
SELECT p.actor_id, s.film_id FROM
(SELECT actor_id, count(actor_id) m FROM sakila.film_actor
GROUP BY actor_id
ORDER BY m DESC
LIMIT `+spec+`) p
INNER JOIN sakila.film_actor s
ON s.actor_id = p.actor_id
) e 
ON sakila.film.film_id = e.film_id 
GROUP BY sakila.film.film_id
ORDER BY rented DESC LIMIT 5;`;
    conn.query(query, (err, result)=>{
        if(err) throw err;
        res.send(result);
        res.end();
    })
});

app.get('/t4/:id', (req, res)=>{
    var query = `
    SELECT film.title, rental.rental_date, rental.return_date 
    FROM sakila.customer 
    JOIN sakila.rental ON customer.customer_id = rental.customer_id
    JOIN sakila.inventory ON rental.inventory_id = inventory.inventory_id
    JOIN sakila.film ON inventory.film_id = film.film_id
    WHERE customer.customer_id = `+req.params.id;
    conn.query(query, (err, result)=>{
        if(err) throw err;
        res.send(result);
        res.end();
    })
});

app.listen(3000, ()=>{
    console.log("on port 3000");
    conn.connect((err)=>{
        if(err) throw err;
        console.log('connection successful');

    })
});

app.post('/t3', (req, res)=>{
    let timeStamp = new Date();
    let query = `SET @valI = (SELECT COUNT(*) FROM sakila.inventory);
    SET @valR = (SELECT MAX(rental_id) FROM sakila.rental);
    INSERT INTO sakila.inventory VALUES(@valI+1, ?, ?, ?);
    INSERT INTO sakila.rental VALUES(@valR+1, ?, @valI+1, ?, ?, ?, ?);`;
    conn.query(query, [ req.body.film_id, 1, timeStamp, 
        timeStamp, req.body.c_id, null, 1, timeStamp], (err, result)=>{
        if(err) throw err;
        res.send(result);
        res.end();
    })
});


app.post('/t3/len', (req, res)=>{
    let timeStamp = new Date();
    let query = `Set @val = (SELECT COUNT(*) FROM sakila.inventory);
    INSERT INTO sakila.inventory VALUES(@val+1, ?, ?, ?)`;
    conn.query(query, [ req.body.film_id, 1, timeStamp], (err, result)=>{
        if(err) throw err;
        res.send(result);
        res.end();
    })
});