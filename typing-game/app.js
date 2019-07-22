const port = 3000;
const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/"
const plotlyAPIKey = "L0ua4oRJDtH5HSBGdh8C";
const plotlyUserName = "jaepark124";
var plotly = require('plotly')(plotlyUserName, plotlyAPIKey);

const app = express();
let easyWords = [];
let mediumWords = [];
let longWords = [];
let words = [];

app.use(bodyParser.urlencoded({
  extended: true
}));

function getRandomInts(lim) {
  let lo = Math.floor(Math.random() * lim + 1);
  let hi = lo + 2;

  return [lo, hi];
}

app.get('/', (req, res) => {

  MongoClient.connect(url, {
    useNewUrlParser: true
  }, (err, db) => {
    if (err) console.log(err);

    let dbo = db.db("words");
    let lowRandoms = getRandomInts(105732);

    var query = {
      _id: {
        "$gt": lowRandoms[0],
        "$lt": lowRandoms[1]
      }
    };

    dbo.collection("short_words").find(query).toArray((err, results) => {
      if (err) throw err;

      results.forEach((e, index) => {
        easyWords[index] = e.word;
      });
    });

    let medRandoms = getRandomInts(67519);

    query = {
      _id: {
        "$gt": medRandoms[0],
        "$lt": medRandoms[1]
      }
    };

    dbo.collection("medium_words").find(query).toArray((err, results)=> {
      if (err) throw err;

      results.forEach((e, index)=> {
        mediumWords[index] = e.word;
      });
    });

    let longRandoms = getRandomInts(277);

    query = {
      _id: {
        "$gt": longRandoms[0],
        "$lt": longRandoms[1]
      }
    };

    dbo.collection("long_words").find(query).toArray((err, results) => {
      if (err) throw err;

      results.forEach( (e, index) => {
        longWords[index] = e.word;
      });

      words = [easyWords, mediumWords, longWords];

    });

    let scores = [];
    dbo = db.db("typing-game");
    dbo.collection("scores").find().toArray((err, docs) => {
      scores = docs;

      console.log(words);

      res.render(__dirname + '/index.ejs', {
        words,
        scores
      });

      db.close();
    });
  })
});

app.post('/', (req, res) => {
  console.log(req.body.errors);

  const errorCount = req.body.errors;
  const seconds = req.body.seconds;

  const newScore = {
    errorCount,
    seconds
  }

  console.log(newScore);

  MongoClient.connect(url, {
    useNewUrlParser: true
  }, (err, db) => {
    if (err) throw err;
    let dbo = db.db("typing-game");
    dbo.collection("scores").insertOne(newScore);
    db.close();
    res.redirect("/")
  })

})


app.listen(port, (req, res)=> {
  console.log("connected to port " + port);
});
