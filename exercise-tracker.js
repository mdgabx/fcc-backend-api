const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser')

// fetch mongo
const mongoose = require('mongoose')


//connecting to the mongo
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true,  useUnifiedTopology: true })

//create the schemas
let exerciseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: String
})

let userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  log: [exerciseSchema]
})


let User = mongoose.model('User', userSchema);
let Exercise = mongoose.model('Exercise', exerciseSchema);

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false })) // use bodyParser
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// save and create user in the database
app.post('/api/users', (req, res) => {
  const newUser = new User({
    username: req.body.username
  })
  
  newUser.save()
      .then((data) => {
        res.json(newUser)
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ error: 'Server error' });
      })
});

// get all user list

app.get('/api/users', (req, res) => {
  User.find()
      .then(users => {
        res.json(users)
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({error: 'Server error'})      
  })
})

// post '/api/users/:id/exercises'
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;
  
  const exercise = {
    description,
    duration: parseInt(duration),
    date: date ? new Date(date) : new Date()
  };
  
  User.findByIdAndUpdate(_id, {
    $push: { log: exercise }
  }, { new: true })
    .then(user => {
      res.json({
        _id: user._id,
        username: user.username,
        date: exercise.date.toDateString(),
        duration: exercise.duration,
        description: exercise.description
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: 'Server error' });
    });
});


// You can make a GET request to /api/users/:_id/logs to retrieve a full exercise log of any user.

app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params

  User.findById(_id)
      .then(user => {
          const log = user.log.map(exercise => ({
            description: exercise.description,
            duration: exercise.duration,
            date: new Date(exercise.date).toDateString()
          }))
    
          res.json({
          _id: user._id,
          username: user.username,
          count: log.length,
          log: log
        });
      })
      .catch(err => {
        console.log(err)
        res.status(500).json({ error: 'Invalid' })
      })
});






const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
