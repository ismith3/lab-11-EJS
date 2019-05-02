
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const { Client } = require('pg');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));
app.use(express.static('./script.js'));
app.use(cors());

const client = new Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.log(err));

//listening
app.listen(PORT, () => console.log(`Never fear... port ${PORT} is here!!`));

/*render search page*/
app.get('/', (request, response) => {
  response.render('pages/search-new');
});

app.get('/books/:id', (request, response) => {
  console.log(request.params.id);
  let SQL = 'SELECT title, authors, isbn, description, image_url, bookshelf FROM books WHERE id=$1';
  let values = [request.params.id];

  client.query(SQL, values)
    .then(res => {
      response.render('pages/books/show', {
        book: res.rows[0]
      });
    });

  // response.render('pages/books/detail', {
  //   book: result.rows[0]
  // });
});

/* Book fetching*/
app.post('/results', (request, response) => {

  console.log(request.body);
  let input;
  if(request.body.searchOption === 'title'){
    input = 'intitle:' + request.body.search;
  }
  else if (request.body.searchOption === 'author') {
    input = 'inauthor:' + request.body.search;
  }
  else {
    response.render('pages/error');
  }

  fetchBooks(input, response);
});

/*Book save */
app.post('/bookshelf', (request, response) => {
  console.log(request.body);
  request.body.book = JSON.parse(request.body.book);
  saveBooks(request.body);
});

/*show bookshelf */

app.get('/bookshelf/:id', (request, response) => {
  getBookshelf(request.params.id, response);
  //response.render('pages/bookshelf');
});

function getBookshelf (input, response) {
  const SQL = `SELECT * FROM books WHERE bookshelf = $1`;
  const values = [input];
  client.query(SQL, values).then(results => {
    response.render('pages/bookshelf', { data:  results.rows});
  });
}

function saveBooks (input, response) {
  const SQL = `INSERT INTO books (title, authors, isbn, description, image_url, bookshelf)
                  VALUES ($1, $2, $3, $4, $5, $6)`;
  client.query(SQL, [input.book.title, input.book.authors, input.book.isbn, input.book.description, input.book.thumbnail.thumbnail, input.bookshelf]);
}

function fetchBooks (input, response){
  let url = encodeURI(`https://www.googleapis.com/books/v1/volumes?q=${input}`);

  superagent.get(url)
    .then(data => {
      response.render('pages/results', {
        data: data.body.items.map(book => {
          return new Book(book);
        })});
    }).catch(error => {
      console.log(error);
      response.render('pages/error');
    });
}

/*Make me a book (book constructor) */
function Book(book){
  this.title = book.volumeInfo.title || 'Title not Found';
  this.authors = book.volumeInfo.authors || 'Authors not Found';
  this.description = book.volumeInfo.description || 'Description not Found';
  this.thumbnail = book.volumeInfo.imageLinks || 'Image not found';
  //this.image = book.volumeInfo.imageLinks.thumbnail.replace('http', 'https') || 'Not Found';
  this.isbn = book.volumeInfo.industryIdentifiers ? book.volumeInfo.industryIdentifiers[0].identifier : 'ISBN not found';
}
