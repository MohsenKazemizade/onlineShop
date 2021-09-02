const express = require('express');
const connectDB = require('./config/db');

const app = express();

//connect to database
connectDB();

//init middleware
app.use(express.json({ extended: false }));

//Define routes
app.use('/customer', require('./routes/customer'));
app.use('/admin', require('./routes/admin'));
app.use('/mainadmin', require('./routes/mainAdmin'));
app.use('/employee', require('./routes/employee'));
app.use('/', require('./routes/shop'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
