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

async function fetchLeadsByField(column, condition) {
  const db = client.db();
  const collection = db.collection('lead');

  const query = { [column]: condition };

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

app.post('/leads', async (req, res) => {
  const { column, condition } = req.body;

  try {
    const leads = await fetchLeadsByField(column, condition);
    res.json(leads);
  } catch (err) {
    console.error('Error occurred:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
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

  const db = client.db();
  const collection = db.collection('lead');

  let query = {};

  if (column) {
    if (condition === 'more' || condition === 'less') {
      let operator;
      let sortOrder;
      switch (condition) {
        case 'more':
          operator = '$gt'; // Greater than
          sortOrder = -1; // Ascending order
          break;
        case 'less':
          operator = '$lt'; // Less than
          sortOrder = 1; // Descending order
          break;
        default:
          // Invalid condition
          res.status(400).json({ error: 'Invalid condition' });
          return;
      }

      if (number !== '') {
        let value;
        if (column === 'Purchase History' || column === 'Click-through Rate' || column === 'Email Open Rate') {
          value = parseFloat(number);
        } else {
          value = number;
        }

        query = {
          [column]: {
            [operator]: value,
          },
        };
      }

      try {
        const documents = await collection.find(query).sort({ [column]: sortOrder }).toArray();
        res.send(documents);
      } catch (err) {
        console.error('Error occurred:', err);
        res.status(500).json({ error: 'Failed to fetch data' });
      }
    } else {
      // Invalid condition
      res.status(400).json({ error: 'Invalid condition' });
    }
  } else {
    // Column name is required
    res.status(400).json({ error: 'Column name is required' });
  }
});




app.listen(4000, () => {
  console.log('Server is listening on port 4000');
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
  const { name, email, date } = req.body;

  sendEmail(name, email, date)
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
