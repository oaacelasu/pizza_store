const {mongo_string_connection, session_secret} = require('./config/default');
// Express
const express = require('express');
const app = express();
const port = 4300;

// Ejs
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Session
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);
const store = new MongoDBStore({
    uri: mongo_string_connection,
    collection: "sessions_data"
})
app.use(session({
    secret: session_secret,
    resave: false,
    saveUninitialized: false,
    store: store
}))

// Body Parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// File Upload
const fileUpload = require('express-fileupload')
app.use(fileUpload())

// Routes
const router = require('./routes/routes.js');
app.use('/', router);

// Mongoose
const init = require('./config/db_manager');
init().then(r => {
        app.listen(port, () => {
            console.log(`Example app listening at http://localhost:${port}`)
        });
    }
).catch(e => {
    console.log(e);
});