require('dotenv').config()

const express = require('express');
const axios = require('axios');

let nextRequestTime = 0;
let lastPrice = 0;

const app = express();
app.use(express.static('public'))

const currentTime = () => Math.floor(new Date().getTime() / 1000);

const nextMonthStartTime = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  date.setDate(1);
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  return Math.floor(date.getTime() / 1000);
};

const updateRateLimit = requestsLeft => {
  if (requestsLeft > 0) {
    const secondsLeft = nextMonthStartTime() - currentTime();
    const rate = Math.ceil(secondsLeft / requestsLeft);
    nextRequestTime = currentTime() + rate;
  } else {
    nextRequestTime = nextMonthStartTime();
  }
};

const sendError = (res, status) => {
  res.json({ success: false, status: status })
};

const sendPrice = (res, price) => {
  res.json({
    success: true,
    price: price,
    updateIn: nextRequestTime - currentTime() + math.random()
  })
};

app.get('/', (req, res) => res.sendFile('index.html'))

app.get('/price', (req, res) => {
  if (currentTime() >= nextRequestTime) {
    axios.get('https://api.coinranking.com/v2/coin/Qwsogvtv82FCd/price', {
      params: { 'x-access-token:': process.env.API_KEY }
    })
    .then(response => {
      updateRateLimit(response.headers['x-ratelimit-remaining-month']);
      const price = response.data.data.price;
      lastPrice = price;
      sendPrice(res, price)
    })
    .catch(error => {
      const status = error.response.status === 429 ? 429 : 500;
      sendError(res, status)
    })
  } else {
    sendPrice(res, price)
  }
})

app.listen(3000)
