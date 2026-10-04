require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/stores', require('./routes/user'));
app.use('/api/owner', require('./routes/owner'));

app.use((err, req, res, next) => {
  if (err.code === 'ER_DUP_ENTRY')
    return res.status(409).json({ message: 'Email already exists' });
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

app.listen(process.env.PORT, () => console.info('Server running on', process.env.PORT));