const express = require('express');
const MongoClient = require('mongodb').MongoClient;

const app = express();
const port = 3000;
const url = 'mongodb+srv://themisto:12345@cluster0.wcoy5xl.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'Test';

app.use(express.json());

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  authenticateUser(username, password)
    .then(user => {
      res.json({ message: 200 })
    })
    .catch(err => {
      console.error('Error occurred:', err);
      res.status(404).json({ error: 'Authentication failed' });
    });
});


app.post('/leadsSocial', (req, res) => {
  const socialMediaEngagementLevel = req.body.socialMediaEngagement;

  Social(socialMediaEngagementLevel)
    .then(rows => {
      res.json(rows);
    })
    .catch(err => {
      console.error('Error occurred:', err);
      res.status(500).json({ error: 'An error occurred' });
    });
});


app.post('/leadsOrder', (req, res) => {
  const orderFreq = req.body.orderFreq;

  Order(orderFreq)
    .then(rows => {
      res.send(rows);
    })
    .catch(err => {
      console.error('Error occurred:', err);
      res.status(500).json({ error: 'An error occurred' });
    });
});

app.get('/schedule', (req, res) => {
  fetchSchedule()
    .then(schedule => {
      res.json(schedule);
    })
    .catch(err => {
      console.error('Error occurred:', err);
      res.status(500).json({ error: 'An error occurred' });
    });
});

async function fetchSchedule() {
  const client = new MongoClient(url);

  try {
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection('schedule');

    const schedule = await collection.find().limit(10).toArray();

    return schedule;
  } finally {
    await client.close();
  }
}

async function authenticateUser(username, password) {
  const client = new MongoClient(url);

  try {
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection('user_cred');

    // Find the user by the provided username and password
    const user = await collection.findOne({ UserName: username, Password: password });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    return user;
  } finally {
    await client.close();
  }
}


async function Social(socialMediaEngagement) {
  const client = new MongoClient(url);

  try {
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection('lead');

    // Modify the query to include the social media engagement level
    const query = { 'Social Media Engagement': { $eq: socialMediaEngagement } };

    const rows = await collection.find(query).toArray();

    return rows;
  } finally {
    await client.close();
  }
}

async function Order(orderFreq) {
  const client = new MongoClient(url);

  try {
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection('lead');

    // Modify the query to include the social media engagement level
    const query = { 'Order Frequency': { $eq: orderFreq } };

    const rows = await collection.find(query).toArray();

    return rows;
  } finally {
    await client.close();
  }
}

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
