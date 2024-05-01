const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const port = 3000;

const notifier = require('node-notifier');

const app = express();
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true })); 

mongoose.connect('mongodb://localhost:27017');
const db = mongoose.connection;
db.once('open', () => {
    console.log('Mongoose connection successfully established');
});

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    pass: String,
    confirmPassword: String
});

const User = mongoose.model('User', userSchema); 
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/signup', async (req, res) => {
    const { username, email, pass, confirmPassword } = req.body;
    const user = new User({ // Corrected syntax for creating a new user instance
        username,
        email,
        pass,
        confirmPassword
    });
    await user.save();
    console.log(user);
    //res.send("Form submitted");
    notifier.notify({
        title: 'Submit',
        message: 'Account Created Successfully!',
        sound: true,
        wait: true
      });
    res.redirect('index.html'); 
});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});

// Handle user login
app.post('/login', async (req, res) => {
    const { username, confirmPassword } = req.body;
    try {
      
        const user = await User.findOne({ username, confirmPassword });
        if (user) {
            // Redirect to another page upon successful lgin
            res.status(401).send('Invalid username or password');
        } else {
           
            res.redirect('Front/index.html'); 
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

