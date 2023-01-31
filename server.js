import express from 'express';
// const urlExist = require('url-exist');
import urlExist from 'url-exist';
import { data } from './data.js';

// const express = require('express');
// const data = require('./data');
// const validUrl = require('valid-url');
// const urlExist = require('url-exist');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/url-checker', async (req, res) => {
  let newUrl;
  let https = 'https://';
  let url = typeof req.body?.url === 'string' ? req.body?.url : null;

  if (!url) {
    return res.status.send('Url is not valid');
  }

  // BELOW CODE APPENDS HTTPS:// TO URL

  const newRegex = new RegExp('^(www|https)://', 'i');
  const match = newRegex.test(url);

  if (!match) {
    newUrl = https + url;
  }

  const containsTlds = data.find((x) => url.includes(x));

  const validTDLS = [];

  if (!containsTlds) {
    for (let index = 0; index < data.length; index++) {
      const x = data[index];
      const isValid = await urlExist(newUrl + x);
      console.log(isValid);
      if (isValid) {
        newUrl = newUrl + x;
        validTDLS.push(newUrl);
        break;
      }
    }
  } else {
    if (await urlExist(url)) {
      newUrl = url;
    }
  }

  // CHECKS IF THERE'S NO HTTPS:// at the beginning of link

  if (!newUrl) {
    return res.status(400).json({
      message: 'invalid url',
    });
  }

  return res
    .status(200)
    .json({ newUrl, validTDLS, message: 'Url is valid and secured' });
});

const port = 4000;
app.listen(port, () => {
  console.log(`server at http://localhost:${port}`);
});
