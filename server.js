import express from 'express';
// const urlExist = require('url-exist');
import urlExist from 'url-exist';
import { data } from './data.js';
import cors from 'cors';
import dotenv from 'dotenv';
import Scanner from 'url-safety-scanner';

// const express = require('express');
// const data = require('./data');
// const validUrl = require('valid-url');
// const urlExist = require('url-exist');
const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CONFIGURATION

const GOOGLE_API_KEY = process.env.CLIENT_SECRET;
const UNIQUE_IDENTIFIER = process.env.CLIENT_ID;
const config = {
  apiKey: GOOGLE_API_KEY,
  clientId: UNIQUE_IDENTIFIER,
  // clientVersion: #CLIENT_VERSION (optional)
};

const myScanner = Scanner(config);

// END

app.get('/url-checker/:url', async (req, res) => {
  try {
    let newUrl;
    let https = 'https://';
    let url = typeof req.params?.url === 'string' ? req.params?.url : null;

    if (!url) {
      return res.status.send('Url is not valid');
    }

    // BELOW CODE APPENDS HTTPS:// TO URL

    const newRegex = new RegExp('^(www|https)://', 'i');
    const match = newRegex.test(url);

    if (!match) {
      newUrl = https.concat(url);

      // const linkExist = await urlExist(newUrl);
      // if (!linkExist) {
      //   return res
      //     .status(400)
      //     .json({ message: 'Danger, Url is not secured. Retreat!' });
      // } else {
      //   return res
      //     .status(200)
      //     .json({ newUrl, message: 'Url is Secured. Goodluck' });
      // }
    }

    const containsTlds = data.find((x) => url.includes(x));

    const validTDLS = [];

    if (!containsTlds) {
      for (let index = 0; index < data.length; index++) {
        const x = data[index];
        const isValid = await urlExist(newUrl + x);
        if (isValid) {
          newUrl = newUrl + x;
          validTDLS.push(newUrl);
          break;
        } else {
          return res
            .status(400)
            .json({ message: 'Danger, Url is not secured. Retreat!' });
        }
      }
    } else {
      console.log('hello');
      newUrl = https.concat(url);
      const linkExist = await urlExist(newUrl);

      if (!linkExist) {
        return res
          .status(400)
          .json({ message: 'Danger, Url is not secured. Retreat!' });
      }
      if (await urlExist(url)) {
        newUrl = url;
      }
      // const isValid = await myScanner
      //   .isSafe(await urlExist(url))
      //   .then((safe) => {
      //     console.log({ safe });
      //     return safe;
      //   });
      // console.log({ isValid });
      // if (isValid) {
      //   newUrl = url;
      // }
    }

    // CHECKS IF THERE'S NO HTTPS:// at the beginning of link
    // console.log(newUrl);
    if (!newUrl) {
      return res.status(400).json({
        message: 'url is Empty',
      });
    }

    // Scanner.isSafe(newUrl).then((safe) => console.log(safe));

    return res
      .status(200)
      .json({ newUrl, validTDLS, message: 'Url is valid and secured' });
  } catch (error) {
    return error;
  }
});

const port = 4000;
app.listen(port, () => {
  console.log(`server at http://localhost:${port}`);
});
