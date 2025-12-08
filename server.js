const express = require('express');
const app = express();
const path = require('path');
const { MongoClient } = require('mongodb');

app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Logging with timestamp
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'static')));

// MongoDB connection
let db;
MongoClient.connect('mongodb+srv://Christain_CO:monday@cluster0.jvuabsa.mongodb.net/', { useUnifiedTopology: true })
  .then(client => {
    db = client.db('coursework');
    console.log("MongoDB connected");
  })
  .catch(err => console.error("MongoDB connection error:", err));

// GET all lessons
app.get('/lessons', async (req, res) => {
  try {
    const lessons = await db.collection('lessons').find({}).toArray();
    res.json(lessons);
  } catch (err) {
    res.status(500).send(err);
  }
});

// SEARCH lessons (query param ?keyword=...)
app.get('/search', async (req, res) => {
  const keyword = req.query.keyword || '';
  try {
    const results = await db.collection('lessons').find({
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { subject: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { location: { $regex: keyword, $options: 'i' } },
        { price: { $regex: keyword, $options: 'i' } },
        { space: { $regex: keyword, $options: 'i' } },
        { availableInventory: { $regex: keyword, $options: 'i' } }
      ]
    }).toArray();
    res.json(results);
  } catch (err) {
    res.status(500).send(err);
  }
});

// POST orders
app.post('/orders', async (req, res) => {
  const order = req.body;
  if (!order.customer || !order.items || !order.total) {
    return res.status(400).json({ error: "Invalid order format" });
  }

  try {
    const result = await db.collection('orders').insertOne(order);

    // Decrement inventory for each item
    for (const item of order.items) {
      await db.collection('lessons').updateOne(
        { id: item.id },
        { $inc: { space: -item.quantity } }
      );
    }

    res.json({ message: "Order saved and inventory updated", orderId: result.insertedId });
  } catch (err) {
    res.status(500).send(err);
  }
});

// PUT update lesson (optional)
app.put('/lessons/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const update = req.body;
  try {
    await db.collection('lessons').updateOne({ id }, { $set: update });
    res.json({ message: "Lesson updated" });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));