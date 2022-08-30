require('dotenv').config()

// imports
const fs = require('fs');
const express = require('express');
const axios = require('axios');

// globals
let nextRequestTime = 0;
let lastPrice = '0.00';

// server
const app = express();
app.use(express.static('public'))

// utils
const currentTime = () => Math.floor(new Date().getTime() / 1000);
const updateIn = () => (nextRequestTime - currentTime() + Math.random());
const formatPrice = price => (Math.round(price * 100) / 100).toFixed(2);

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
    updateIn: updateIn(),
  })
};

const getPrice = cb => {
  if (currentTime() < nextRequestTime) return cb();
  axios.get('https://api.coinranking.com/v2/coin/Qwsogvtv82FCd/price', {
    params: { 'x-access-token:': process.env.API_KEY }
  })
  .then(res => {
    updateRateLimit(res.headers['x-ratelimit-remaining-month']);
    lastPrice = formatPrice(res.data.data.price);
    cb()
  })
  // .catch(error => res.json({ success: false }))
};

// redirect to https
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect('https://www.btcpricenow.com')
    } else next();
  })
}

// routes
app.get('/price', (req, res) => {
  getPrice(() => sendPrice(res, lastPrice))
})

app.get('*', (req, res) => {
  fs.readFile(__dirname + '/index.html', 'utf-8', (err, html) => {
    if (err) return res.send(404);
    getPrice(() => {
      html = html.replace('{{ price }}', lastPrice);
      html = html.replace('{{ updateIn }}', updateIn());
      res.contentType('text/html')
      res.send(html)
    })
  })
})

// start
app.listen(process.env.PORT || 3000)
