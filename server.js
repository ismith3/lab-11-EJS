
const express = require('express');
const superagent = require('superagent');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));

//listening
app.listen(PORT, () => console.log(`Never fear... port ${PORT} is here!!`));

/*render index page*/
app.get('/', (request, response) => {
  response.render('pages/search-new');
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


function fetchBooks (input, response){
  let url = encodeURI(`https://www.googleapis.com/books/v1/volumes?q=${input}`);
  console.log(url);

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

function Book(book){
  //console.log(book.volumeInfo);
  this.title = book.volumeInfo.title || 'Title not Found';
  this.authors = book.volumeInfo.authors || 'Authors not Found';
  this.description = book.volumeInfo.description || 'Description not Found';
  this.thumbnail = book.volumeInfo.imageLinks || 'Image not found';
  //this.image = book.volumeInfo.imageLinks.thumbnail.replace('http', 'https') || 'Not Found';
  console.log(this.thumbnail);
}
