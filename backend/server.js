const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// CORS middleware - allow requests from GitHub Pages and other origins
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve static files from the parent directory (root of the project)
app.use(express.static(path.join(__dirname, '..')));

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI environment variable is not set');
  process.exit(1);
}
const DB_NAME = process.env.MONGODB_DBNM;
const COLLECTION_NAME = process.env.MONGODB_COLLECTION;

const client = new MongoClient(MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    db = client.db(DB_NAME);
    console.log('Connected to MongoDB');
    
    // Initialize scores if collection is empty
    const count = await db.collection(COLLECTION_NAME).countDocuments();
    if (count === 0) {
      await db.collection(COLLECTION_NAME).insertOne({
        _id: 'main',
        anicka: 0,
        vojtech: 0
      });
      console.log('Initialized scores');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// API Routes
// Get current scores
app.get('/api/scores', async (req, res) => {
  try {
    let scores = await db.collection(COLLECTION_NAME).findOne({ _id: 'main' });
    res.json({ anicka: scores.anicka, vojtech: scores.vojtech });
  } catch (error) {
    console.error('Error fetching scores:', error);
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
});

// Update scores
app.post('/api/scores', async (req, res) => {
  try {
    const { anicka, vojtech } = req.body;
    
    // Validate input
    if (typeof anicka !== 'number' || typeof vojtech !== 'number') {
      return res.status(400).json({ error: 'Invalid scores. Must be numbers.' });
    }

    // Now update with increment
    await db.collection(COLLECTION_NAME).findOneAndUpdate(
      { _id: 'main' },
      { 
        $inc: { 
          anicka: anicka || 0,
          vojtech: vojtech || 0
        }
      },
      { returnDocument: 'after' }
    );

    res.status(200).send();
    
  } catch (error) { 
    res.status(500).json({ error: 'Failed to update scores' });
  }
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing MongoDB connection');
  await client.close();
  process.exit(0);
});

