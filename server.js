
const express = require('express');
const superagent = require('superagent');

const app = express();
const PORT = process.env.PORT || 3000;


app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

app.use(express.static('./public'));


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
  response.send(fetchBooks(input));
});


function fetchBooks (input){
  let bookArray = [];
  let url = `https://www.googleapis.com/books/v1/volumes?q=${input}&key=${process.env.GOOGLE_BOOKS_API}`;
  superagent.get(url)
    .then(data => {
      for(let i = 0; i < 10; i++){
        let book = new Book(data, i);
        bookArray.push(book);
      }
    }).catch(error => console.log(error));
  return bookArray;
}

function Book (data, i){
  this.title = data.items[i].volumeInfo.title || 'Not Found';
  this.authors = data.items[i].volumeInfo.authors || 'Not Found';
  this.description = data.items[i].volumeInfo.description || 'Not Found';
  this.image = data.items[i].volumeInfo.imageLinks.thumbnail.replace('http', 'https') || 'Not Found';
}



//listening thing
app.listen(PORT, () => console.log(`Never fear... port ${PORT} is here!!`));
