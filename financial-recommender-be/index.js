const express = require('express');
const cors = require('cors');
const connectDatabase = require('./config/database');
const dataRoutes = require('./routes/dataRoutes');
const financialRoutes = require('./routes/financialRoutes');
const productRoutes = require('./routes/productRoutes');
const advisorRoutes = require('./routes/advisorRoutes');
const getCallRoutes = require('./routes/getCallRoutes');
const prodSuitabilityRoutes = require('./routes/prodSuitabilityRoutes');


const bodyParser = require('body-parser');

const app = express();

app.use(express.json());
app.use(cors({ origin: '*' }));
app.use('/user', dataRoutes);
app.use(bodyParser.json());

app.use('/api', financialRoutes);
app.use('/products', productRoutes);
app.use('/advisor', advisorRoutes);
app.use('/calls', getCallRoutes);
app.use('/suitability', prodSuitabilityRoutes);



app.all('/', (req, res) => {
    console.log('Just got a request!');
    console.log('MONGO_URI:', process.env.MONGO_URI);
    res.send('Yo yo');
});

connectDatabase();

app.listen(process.env.PORT || 3000, () => {
    console.log('Your Server is running');
});
