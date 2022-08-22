require('dotenv').config()

// imports
const express = require('express');
const axios = require('axios');

// globals
let nextRequestTime = 0;
let lastPrice = 0;

// server
const app = express();
app.use(express.static('public'))

// utils
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

const sendPrice = (res, price) => {
  res.json({
    success: true,
    price: price,
    updateIn: nextRequestTime - currentTime() + Math.random()
  })
};

// redirect to https
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`)
    } else next();
  })
}

// routes
app.get('/', (req, res) => res.sendFile('index.html'))

app.get('/price', (req, res) => {
  if (currentTime() < nextRequestTime) {
    sendPrice(res, lastPrice)
  } else {
    axios.get('https://api.coinranking.com/v2/coin/Qwsogvtv82FCd/price', {
      params: { 'x-access-token:': process.env.API_KEY }
    })
    .then(response => {
      updateRateLimit(response.headers['x-ratelimit-remaining-month']);
      const price = response.data.data.price;
      lastPrice = price;
      sendPrice(res, price)
    })
    .catch(error => res.json({ success: false }))
  }
})

// start
app.listen(process.env.PORT || 3000)
