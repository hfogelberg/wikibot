const express = require("express"),
  port = process.env.PORT || 80,
  app = express(), 
  dotenv = require('dotenv'),
  axios = require("axios"),
  bodyParser = require("body-parser"),
  chatToken = process.env.CHAT_TOKEN,
  apiai = require('apiai')(chatToken),
  DF_SESSION_ID = Math.random() * 10000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/", express.static(__dirname + "/"));
app.get('/', (req, res) => {
  res.sendFile('index.html');
});

app.post("/api/wikiquery", (req, res) => {
  const params = req.body.result.parameters
  const subject = params["wikiItem"];
  const wikiItem = encodeURIComponent(subject);

  var url = `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&limit=1&generator=search&origin=*&search=${wikiItem}`;
  axios.get(url)
    .then((result) => {
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
      return res.json({
        speech: "Something went wrong when I tried to find the answer.",
        displayText: link,
        source: 'wikiquery'
      });
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