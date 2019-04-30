
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

app.use(express.static('./public'));


app.listen(PORT, () => console.log(`Never fear... port ${PORT} is here!!`));

app.get('/hello', (requeset, response) => {
  response.render('pages/index');
});

