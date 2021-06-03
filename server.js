var express = require('express');
var exphbs = require('express-handlebars');
var fs = require('fs')

var peopleData = require('./peopleData');

var app = express();
var port = process.env.PORT || 8000;

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(express.json())
app.use(express.static('public'));

app.get('/', function (req, res, next) {
  res.status(200).render('homePage');
});

app.get('/people', function (req, res, next) {
  res.status(200).render('peoplePage', {
    people: peopleData
  });
});

app.get('/people/:person', function (req, res, next) {
  var person = req.params.person.toLowerCase();
  if (peopleData[person]) {
    res.status(200).render('photoPage', peopleData[person]);
  } else {
    next();
  }
});

app.post('/people/:person/addPhoto', function (req, res, next) {
  console.log("== req.body:", req.body)
  if (req.body && req.body.url && req.body.caption) {
    var person = req.params.person.toLowerCase();
    if (peopleData[person]) {
      peopleData[person].photos.push({
        url: req.body.url,
        caption: req.body.caption
      })
      console.log("== peopleData[" + person + "]:", peopleData[person])
      fs.writeFile(
        __dirname + '/peopleData.json',
        JSON.stringify(peopleData, null, 2),
        function (err) {
          if (err) {
            res.status(500).send("Error writing new data.  Try again later.")
          } else {
            res.status(200).send()
          }
        }
      )
    } else {
      next()
    }
  } else {
    res.status(400).send("Request needs a JSON body with 'url' and 'caption'.")
  }
})

app.get('/people/:person/:photoIdx', function (req, res, next) {
  var person = req.params.person.toLowerCase();
  var photoIdx = parseInt(req.params.photoIdx);
  if (peopleData[person]) {
    res.status(200).render('photoPage', {
      name: peopleData[person].name,
      photos: [ peopleData[person].photos[photoIdx] ]
    });
  } else {
    next();
  }
});

app.get('*', function (req, res, next) {
  res.status(404).render('404', {
    page: req.url
  });
});

app.listen(port, function () {
  console.log("== Server listening on port", port);
})
