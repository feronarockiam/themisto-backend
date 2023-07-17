const express = require('express');
const { MongoClient } = require('mongodb');
const {sendEmail} = require('./schedule-mail');
const { leadEmail } = require('./lead-mail');
const app = express();
const port = 3000;
const url = 'mongodb+srv://themisto:12345@cluster0.wcoy5xl.mongodb.net/Test?retryWrites=true&w=majority';

app.use(express.json());

let client;

async function connectToDatabase() {
  try {
    client = await MongoClient.connect(url);
    console.log('Connected to the database');
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    throw error;
  }
}

connectToDatabase();

async function authenticateUser(username, password) {
  const db = client.db();
  const collection = db.collection('user_cred');

  const user = await collection.findOne({ UserName: username, Password: password });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  return user;
}

async function fetchLeadsBySocialMediaEngagement(socialMediaEngagement) {
  const db = client.db();
  const collection = db.collection('lead');

  const query = { 'Social Media Engagement': { $eq: socialMediaEngagement } };

  const leads = await collection.find(query).toArray();

  return leads;
}

async function fetchLeadsByOrderFrequency(orderFreq) {
  const db = client.db();
  const collection = db.collection('lead');

  const query = { 'Order Frequency': { $eq: orderFreq } };

  const leads = await collection.find(query).toArray();

  return leads;
}

async function fetchSchedule() {
  const db = client.db();
  const collection = db.collection('schedule');

  const schedule = await collection.find().limit(10).toArray();

  return schedule;
}

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  authenticateUser(username, password)
    .then(user => {
      res.json({ message: 'Authentication successful' });
    })
    .catch(err => {
      console.error('Error occurred:', err);
      res.status(404).json({ error: 'Authentication failed' });
    });
});

app.post('/leadsSocial', (req, res) => {
  const socialMediaEngagementLevel = req.body.socialMediaEngagement;

  fetchLeadsBySocialMediaEngagement(socialMediaEngagementLevel)
    .then(leads => {
      res.json(leads);
    })
    .catch(err => {
      console.error('Error occurred:', err);
      res.status(500).json({ error: 'An error occurred' });
    });
});

app.post('/leadsOrder', (req, res) => {
  const orderFreq = req.body.orderFreq;

  fetchLeadsByOrderFrequency(orderFreq)
    .then(leads => {
      res.json(leads);
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

// ...

app.post('/api/fetch', async (req, res) => {
  console.log(req.body);
  const { condition, number, column } = req.body;

  let operator;
  switch (condition) {
    case 'more':
      operator = '$gt';
      break;
    case 'less':
      operator = '$lt';
      break;
    case 'equal':
      operator = '$eq';
      break;
    default:
      return res.status(400).json({ error: 'Invalid condition' });
  }

  const db = client.db();
  const collection = db.collection('lead');

  // Add symbols to the value if the column is 'Average Order Value' or 'Cart Abandonment Rate'
  let value;
  if (column === 'Average Order Value') {
    value = `$${number}`;
  } else if (column === 'Cart Abandonment Rate') {
    value = `${number}%`;
  } else {
    value = number;
  }

  const query = {
    [column]: {
      [operator]: value,
    },
  };

  try {
    const documents = await collection.find(query).toArray();
    res.send(documents);
  } catch (err) {
    console.error('Error occurred:', err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// ...

// ...

// ...

app.post('/fetch/age', async (req, res) => {
  console.log(req.body);
  const { condition, number } = req.body;
  const column = 'Age'; // Assuming the column is 'Age' by default

  const db = client.db();
  const collection = db.collection('lead');

  let query;

  if (condition === 'older') {
    query = {
      $or: [
        { [column]: { $gte: parseInt(number) } },
        { [column]: { $regex: `^[0-9]+-[0-9]*$` } }
      ]
    };
  } else if (condition === 'younger') {
    query = {
      $or: [
        { [column]: { $lte: parseInt(number) } },
        { [column]: { $regex: `^[0-9]*-[0-9]+\$` } }
      ]
    };
  } else if (condition === 'between') {
    const [min, max] = number.split('-').map(num => parseInt(num.trim()));
    query = {
      [column]: {
        $gte: min,
        $lte: max,
      },
    };
  } else {
    return res.status(400).json({ error: 'Invalid condition' });
  }

  try {
    const documents = await collection.find(query).toArray();
    res.send(documents);
  } catch (err) {
    console.error('Error occurred:', err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// ...

app.post('/send-email', (req, res) => {
  const { name, email } = req.body;

  sendEmail(name, email)
    .then(() => {
      res.status(200).send('Email sent successfully!');
    })
    .catch((error) => {
      console.log('Error occurred while sending email:', error.message);
      res.status(500).send('Error occurred while sending email');
    });
});
app.post('/leadsEmails', async (req, res) => {
  const { message, email } = req.body;

  try {
    await Promise.all(email.map((recipient) => leadEmail(recipient, message)));
    res.status(200).send('Emails sent successfully!');
  } catch (error) {
    console.log('Error occurred while sending emails:', error.message);
    res.status(500).send('Error occurred while sending emails');
  }
});

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
