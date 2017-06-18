const fs = require('fs');
const _ = require('lodash');

const http = require('http');

const hostname = '127.0.0.1';
const port = 3001;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  if (req.method == 'POST') {
    handlePost(req, res);
  } else {
    res.end(JSON.stringify({error: "Only post request supported"}));
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

function exec(cmd, cb) {
  var exec = require('child_process').exec;
  var child = exec(cmd, cb);
}

function handlePost(req, res) {
  var tempFilePath = "temp_boards/" + Date.now();
  getBody(req).then((data) => {
    fs.writeFileSync(tempFilePath, data);
    return calculateScore(tempFilePath);
  }).then((output) => {
    var finalResult = parseResult(output);
    res.end(JSON.stringify({data: finalResult}));
    fs.unlinkSync(tempFilePath);
  }).catch((error) => {
    res.end(JSON.stringify({error: error}));
    fs.unlinkSync(tempFilePath);
  });
}

function getBody(req) {
  return new Promise((resolve, reject) => {
    var body = '';
    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {
      resolve(body);
    });
  });
}

function calculateScore(filePath) {
  return new Promise((resolve, reject) => {
    var cmd = "./score-estimator/estimator " + filePath;
    exec(cmd, function (error, stdout, stderr) {
      if (error !== null) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  })
}

function parseResult(result) {
  var lines = result.split("\n");
  var size = parseInt(lines[1].substring(8));
  var deadStones = _.drop(_.dropRight(lines, 5), 6 + size);
  var score = parseFloat(_.nth(lines, -3).substring(7));
  var data = {
    score,
    deadStones,
    lines
  }
  return data;
}
