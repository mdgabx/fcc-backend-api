var express = require('express');
var cors = require('cors');


// body parser
var bodyParser = require('body-parser');

// connect mongo
var mongoose = require('mongoose');

// multer 
var multer = require('multer');
var upload = multer({ dest: 'uploads/' })

require('dotenv').config()

var app = express();

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// main functionality here

app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file selected.' });
    return;
  }
  
  res.json({
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size
  });
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
