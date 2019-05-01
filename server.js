
const express = require('express');
const superagent = require('superagent');

const app = express();
const PORT = process.env.PORT || 3000;


app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));


/*render index page*/
app.get('/', (requeset, response) => {
  response.render('pages/index');
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
    console.error('Please select input type and provide a valid search');
  }
  fetchBooks(input, response);
});


function fetchBooks (input, response){
  let url = `https://www.googleapis.com/books/v1/volumes?q=${input}`;

  superagent.get(url)
    .then(data => {
      response.send(data.body.items.map(book => {
        return new Book(book);
      }));
    }).catch(error => console.log(error));
}

function Book(book){
  this.title = book.volumeInfo.title || 'Not Found';
  this.authors = book.volumeInfo.authors || 'Not Found';
  this.description = book.volumeInfo.description || 'Not Found';
  this.image = book.volumeInfo.imageLinks.thumbnail.replace('http', 'https') || 'Not Found';
}



//listening thing
app.listen(PORT, () => console.log(`Never fear... port ${PORT} is here!!`));