const express = require('express');
const app = express();
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

app.use(express.json());
app.use(cors());

// Connect to MongoDB
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

// SEARCH lessons
app.get('/search', async (req, res) => {
  const keyword = req.query.keyword || '';
  try {
    const lessons = await db.collection('lessons').find({
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { location: { $regex: keyword, $options: 'i' } },
        { price: { $regex: keyword, $options: 'i' } },
      ]
    }).toArray();
    res.json(lessons);
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

    // Update inventory for each ordered item
    for (const item of order.items) {
      await db.collection('lessons').updateOne(
        { _id: new ObjectId(item._id) },
        { $inc: { availableInventory: -1 } }
      );
    }

    res.json({ message: "Order saved and inventory updated", orderId: result.insertedId });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));