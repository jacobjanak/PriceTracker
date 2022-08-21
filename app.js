require('dotenv').config()

const express = require('express');
const axios = require('axios');

const app = express();

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile('index.html')
})

app.get('/price', (req, res) => {
  axios.get('https://api.coinranking.com/v2/coin/Qwsogvtv82FCd/price', {
    params: {
      'x-access-token:': process.env.API_KEY
    }
  })
  .then(response => {
    const price = response.data.data.price;
    res.json(price)
  })
  .catch(error => {
    res.json(error);
  })
})

app.listen(3000)
