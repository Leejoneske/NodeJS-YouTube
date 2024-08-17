const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const compression = require('compression');
const { PassThrough } = require('stream');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(compression());

app.listen(PORT, () => {
  console.log(`Server Works !!! At port ${PORT}`);
});

app.get('/ping', (req, res) => {
  console.log('Received ping request');
  res.status(200).send('pong');
});

app.get('/', (req, res) => {
  res.send('Welcome to the server!');
});

// Route to download MP3
app.get('/downloadmp3', async (req, res) => {
  try {
    const url = req.query.url;
    if (!ytdl.validateURL(url)) {
      return res.sendStatus(400);
    }
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\x00-\x7F]/g, "");
    res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
    res.header('Content-Type', 'audio/mpeg');

    const stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });
    const passThrough = new PassThrough();

    stream.pipe(passThrough);

    passThrough.on('data', chunk => {
      res.write(chunk);
    });

    passThrough.on('end', () => {
      res.end();
    });

    passThrough.on('error', err => {
      console.error(err);
      res.sendStatus(500);
    });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Route to download MP4
app.get('/downloadmp4', async (req, res) => {
  try {
    const url = req.query.url;
    if (!ytdl.validateURL(url)) {
      return res.sendStatus(400);
    }
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\x00-\x7F]/g, "");
    res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
    res.header('Content-Type', 'video/mp4');

    const stream = ytdl(url, {
      filter: format => format.container === 'mp4' && format.hasVideo === true,
      quality: 'highest'
    });
    const passThrough = new PassThrough();

    stream.pipe(passThrough);

    passThrough.on('data', chunk => {
      res.write(chunk);
    });

    passThrough.on('end', () => {
      res.end();
    });

    passThrough.on('error', err => {
      console.error(err);
      res.sendStatus(500);
    });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});
