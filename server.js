var { readFileSync } = require('fs')
var signerPrivKeyString = readFileSync('signer_priv_key', 'utf-8')

var Web3 = require('web3');
var web3 = new Web3("https://rinkeby.infura.io");

var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(express.static('public'));

app.use(function (req, res, next) {
  if (!req.xhr) {
    res.status(500).send('Not AJAX');
  }
  else {
    next();
  }
});

app.post('/add', function (req, res) {

  var identity = req.body.identity;
  var claimType = req.body.claimType;
  var id = req.body.id;
  var pass = req.body.pass;

  //add varify logic 

  //change below condition to check returned value
  if (1==1) {
    var rawData = req.body.id;
    var hexData = web3.utils.asciiToHex(rawData)
    var hash = web3.utils.soliditySha3(identity, claimType, hexData)
    var sig = web3.eth.accounts.sign(hash, signerPrivKeyString).signature;

    res.json(
      {
        sig: sig,
        data: hexData,
        status: true,
      });

  } else {
    res.json(
      {
        status: false,
      });
  }
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});