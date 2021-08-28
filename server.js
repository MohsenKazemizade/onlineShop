const express = require('express');
const connectDB = require('./config/db');

const app = express();

//connect to database
connectDB();

//init middleware
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('API Running'));

//Define routes
app.use('/api/customer', require('./routes/api/customer'));
app.use('/api/admin', require('./routes/api/admin'));
app.use('/api/employee', require('./routes/api/employee'));
app.use('/api/role', require('./routes/api/roles'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
