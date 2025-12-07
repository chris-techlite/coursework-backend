const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;

app.use(express.json());

// CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Logger middleware
app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});

// Static files
app.use((req, res, next) => {
    const filepath = path.join(__dirname, 'static', req.url);
    fs.stat(filepath, (err, fileinfo) => {
        if (!err && fileinfo.isFile()) res.sendFile(filepath);
        else next();
    });
});

// Connect to MongoDB
let db;
MongoClient.connect('mongodb+srv://Christain_CO:monday@cluster0.jvuabsa.mongodb.net/', (err, client) => {
    if (err) throw err;
    db = client.db('coursework');
    console.log("MongoDB connected");
});

// GET all lessons
app.get('/lessons', (req, res) => {
    db.collection('lessons').find({}).toArray((err, results) => {
        if (err) res.status(500).send(err);
        else res.json(results);
    });
});

app.post('/orders', (req, res) => {
    const order = req.body;
    db.collection('orders').insertOne(order, (err, result) => {
        if (err) res.status(500).send(err);
        else res.json({ message: "Order saved" });
    });
});

app.put('/lessons/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const update = req.body;
    db.collection('lessons').updateOne({ id: id }, { $set: update }, (err, result) => {
        if (err) res.status(500).send(err);
        else res.json({ message: "Lesson updated" });
    });
});

app.get('/search', (req, res) => {
    const keyword = req.query.keyword || '';
    db.collection('lessons').find({
        $or: [
            { title: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } },
            { location: { $regex: keyword, $options: 'i' } },
            { price: { $regex: keyword, $options: 'i' } },
            { availableInventory: { $regex: keyword, $options: 'i' } }
        ]
    }).toArray((err, results) => {
        if (err) res.status(500).send(err);
        else res.json(results);
    });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});