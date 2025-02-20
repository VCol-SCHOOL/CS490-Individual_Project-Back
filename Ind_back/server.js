const express = require('express');
const mysql = require('mysql');
app=express();

const conn = require('./sakila_db/db');

app.use((req, res, next)=> {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origon, X-Requested-With, Content-Type, Accept");
    next();
});

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
    SELECT customer_id, store_id, first_name, last_name, 
    email, create_date, last_update
    FROM sakila.customer;
    `
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

/*
number 1.
SELECT sakila.film.film_id, sakila.film.title, sakila.category.name
    FROM sakila.film
    INNER JOIN sakila.film_category 
    ON sakila.film.film_id = sakila.film_category.film_id
    INNER JOIN sakila.category
    ON sakila.film_category.category_id = sakila.category.category_id;

number 3.
SELECT sakila.actor.actor_id, sakila.actor.first_name, 
sakila.actor.last_name, COUNT(*) movies
FROM sakila.actor 
JOIN sakila.film_actor
ON sakila.actor.actor_id = sakila.film_actor.actor_id
Group BY actor_id ORDER BY movies DESC LIMIT 5;

number 5.
SELECT * FROM sakila.rental WHERE return_date IS NULL;

number 6.
SELECT sakila.film.film_id, sakila.film.title, count(sakila.film.title) rented
FROM sakila.film
INNER JOIN sakila.inventory ON sakila.inventory.film_id = sakila.film.film_id
INNER JOIN sakila.rental ON sakila.inventory.inventory_id = sakila.rental.inventory_id
GROUP BY sakila.film.film_id
ORDER BY rented DESC LIMIT 5;
*/