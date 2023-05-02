require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose')

const bodyParser = require('body-parser')

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

let urlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true
  },
  short_url: Number
});

let Url = mongoose.model('URL', urlSchema)

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', function(req, res) {
  let originalUrl = req.body.url
  
  let checkUrl = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/
.test(originalUrl);


  if(!checkUrl) {
    res.json({error: 'invalid url'})
    return;
  } else {
    // Check if there is an existing url

    let responseObject = {}
    
    Url.countDocuments({}).then( data => {
      if(data === 0) {
        responseObject['original_url'] = originalUrl
        responseObject['short_url'] = 1

        const sendUrl = new Url({
        original_url: responseObject['original_url'],
        short_url: responseObject['short_url']
      });
        
      sendUrl.save()
          .then(() => {
          res.json(responseObject)
      })
      .catch(err => {
        console.log('send: ', err);
      })
        
      } else {
        //find the url record if there is one
        
        Url.findOne({})
            .sort({ short_url: 'desc' })
            .then(data => {
                let shortUrl = data.short_url

              Url.findOne({original_url: originalUrl})
                  .then(data => {
                    if (data === null) {
                      responseObject['original_url'] = originalUrl;
                      responseObject['short_url'] = shortUrl + 1;

                      const sendUrl = new Url({
                        original_url: responseObject.original_url,
                        short_url: responseObject.short_url
                      })

                      sendUrl.save()
                        .then(() => {
                          res.json(responseObject)
                        })
                      .catch(err => {
                        console.log('record', err)
                      })
                    } else {
                      responseObject['original_url'] = data.original_url;
                      responseObject['short_url'] = data.short_url;

                      res.json(responseObject);
                    }
                  })
                  .catch(err => {
                    console.log('find record', err)
                  })
              
            })
            .catch(err => {
              console.log('record: ', err)
            }) 
      }
    })
    .catch(err => {
      console.log('count: ', err)
    })
  }
});


app.get('/api/shorturl/:short_url', function(req, res) {
  let shortUrl = req.params.short_url;
  Url.findOne({short_url: shortUrl})
    .then(result => {
      if(result === null) {
        res.json({error: "invalid short url"})
      } else {
        res.redirect(result.original_url);
      }
    })
    .catch(err => {
      console.log(err);
      res.json({error: "invalid short url"})
    })
})


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

