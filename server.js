const express = require('express');
const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
    next();
    
});
const mongoclient = require('mongodb').MongoClient;

let db;
mongoclient.connect('mongodb+srv://Christain_CO:monday@cluster0.jvuabsa.mongodb.net/', (err, client) => {
    db = client.db('coursework')
});
app.get('/', (req, res)=>{



});