const express = require('express');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const pgCamelcase = require('pg-camelcase');
pgCamelcase.inject(require('pg'));

const Client = require('pg').Client;

require('dotenv').config();


const app = express();

const mustache = mustacheExpress();
mustache.cache = null;
app.engine('mustache', mustache);
app.set('view engine', 'mustache');

app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/books', (req, res) => {
    const client = new Client();
    client.connect()
        .then(() => {
            console.log('connection complete');
            const sql = 'select * from books';
            return client.query(sql);
        })
        .then((results) => {
            console.log('results? ', results);
            res.render('book-list', { books: results.rows });
        })
        .catch((err) => {
            console.log('err', err);
            res.send('Error on search books');
        });
});

app.get('/book/add', (req, res) => {
    res.render('book-form');
});

app.post('/book/add', (req, res) => {
    console.log('post body', req.body);

    const client = new Client();
    client.connect()
        .then(() => {
            console.log('connection complete');
            //do query stuff
            const sql = 'insert into books (title,authors) values($1,$2)';
            const params = [req.body.title, req.body.authors];
            return client.query(sql, params);
        }).then((result) => {
            console.log('result?', result);
            res.redirect('/libooksst');
        }).catch((err) => {
            console.log('err', err);
            res.redirect('/books');
        });
});

app.post('/book/delete/:id', (req, res) => {
    console.log('delete id: ', req.params.id);
    const client = new Client();
    client.connect()
        .then(() => {
            console.log('connection complete');
            //do query stuff
            const sql = 'delete from books where book_id = $1';
            const params = [req.params.id];
            return client.query(sql, params);
        }).then((result) => {
            console.log('delete result?', result);
            res.redirect('/books');
        }).catch((err) => {
            console.log('err', err);
            res.redirect('/books');
        });
});

app.get('/book/edit/:id', (req, res) => {
    const client = new Client();
    client.connect()
        .then(() => {
            console.log('connection complete');
            const sql = 'select * from books where book_id = $1;';
            const params = [req.params.id];
            return client.query(sql, params);
        })
        .then((results) => {
            if(results.rowCount===0){
                res.redirect('/books');
                return
            }
            res.render('book-edit', { book: results.rows[0] });
        })
        .catch((err) => {
            console.log('err', err);
            res.redirect('/books');
        });
});
app.post('/book/edit/:id', (req, res) => {
    const client = new Client();
    client.connect()
        .then(() => {
            const sql = 'update books set title = $1, authors = $2 where book_id = $3;';
            const params = [req.body.title,req.body.authors,req.params.id];
            return client.query(sql, params);
        })
        .then((results) => {
            res.redirect('/books');
        })
        .catch((err) => {
            console.log('err', err);
            res.redirect('/books');
        });
});

app.listen(process.env.PORT, () => {
    console.log(`App start on port ${process.env.PORT}`);
});
