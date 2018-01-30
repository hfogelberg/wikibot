const express = require("express"),
  port = process.env.PORT || 80,
  app = express(), 
  dotenv = require('dotenv'),
  axios = require("axios"),
  { DF_CHAT_ACCESS_TOKEN } = require("./settings")
  apiai = require('apiai')(DF_CHAT_ACCESS_TOKEN),
  DF_SESSION_ID = Math.random() * 10000;

app.use("/", express.static(__dirname + "/"));
app.get('/', (req, res) => {
  res.sendFile('index.html');
});

app.post("/api/wikiquery", (req, res) => {
  console.log("POST", req.body);
  let subject = req.body.wikiItem;

  var url = `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&limit=1&generator=search&origin=*&search=${subject}`;
  console.log(url);
  axios.get(url)
    .then((result) => {
      console.log(result.data);
      // Remove listen link
      let summary = result.data[2].toString().replace("( listen))", "");
      // Remove phonetics
      summary = summary.replace(/\[(.*?)\]/, "");

      const link = result.data[3].toString();
      return res.json({
        speech: summary,
        displayText: link,
        source: 'wikiquery'
      });

    })
    .catch((err) => {
      console.log(err);
    });
});

const server = app.listen(port, () => {
  console.log("Listening on port " + port);
});

const io = require('socket.io')(server);
io.on('connection', function (socket) {
  console.log("Socket io connected and listening");
  socket.on('chat message', (text) => {
    console.log("Chat message is", text)
    // Get a reply from API.AI

    let apiaiReq = apiai.textRequest(text, {
      sessionId: DF_SESSION_ID
    });

    apiaiReq.on('response', (response) => {
      console.log('Dialogflow replies responds', response);
      let aiText = response.result.fulfillment.speech;
      console.log(aiText)
      socket.emit('bot reply', aiText); // Send the result back to the browser!
    });

    apiaiReq.on('error', (error) => {
      console.log(error);
    });

    apiaiReq.end();
  });
});