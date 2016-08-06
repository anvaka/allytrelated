/**
 * This file calls API gateway that invokes lambda function. Lambda function body
 * can be found in `lambda.js` file. The API gateway endpoint should be passed via
 * environment variable YCRAWL_EP, the key to the gateway should be passed as
 * YCRAWL_KEY.
 *
 * If key and gateway endpoint are missing, this module throws an error.
 */
var request = require('request');

module.exports = download;

var endpoint = process.env.YCRAWL_EP;
var auth = process.env.YCRAWL_KEY;
if (!auth || !endpoint) {
  throw new Error('Environmnet variables YCRAWL_EP and YCRAWL_KEY should point to lambda API endpoint');
}

function download(channels, done, id, retryAttempt) {
  var suffix = channels.join(',');
  var url = endpoint + suffix;
  console.log(id + ' -> Fetching ' + channels.length + ' channels');
  var start = new Date();

  request(url, {
    timeout: 25000,
    headers: {
      'Accept': 'application/json',
      'x-api-key': auth
    }
  }, function (error, response, body) {
    var timeMS = (new Date()) - start;
    if (!error && response && response.statusCode === 200) {
      var res = JSON.parse(body);
      // sometimes Lambda can fail, yet return 200 OK code. We check for
      // errorMessage before processing.
      if (res.errorMessage) {
        if (retryAttempt === undefined) {
          retryAttempt = 5; // try N times before failing
        }

        if (retryAttempt > 0) {
          console.log(id + '!> WARNING: got error message from lambda: ' + res.errorMessage + '; #' + retryAttempt);
          console.log(id + '!> Wait time was: ' + timeMS);
          download(channels, done, id, retryAttempt - 1);
        } else {
          throw new Error('Error for ' + url);
        }
      } else {
        done(res, id, timeMS);
      }
    } else if (response && response.statusCode !== 200 && !error) {
      throw new Error('Unexpected status' + response.statusCode)
    } if (error && error.code === 'ETIMEDOUT') {
      if (retryAttempt === undefined) {
        // first time timeout
        retryAttempt = 5; // try N times before failing
      }
      if (retryAttempt > 0) {
        console.log(id + '!> WARNING: timed out on ' + url + ' will attempt to retry now. Attept #' + retryAttempt);
        console.log(id + '!> Wait time was: ' + timeMS);
        download(channels, done, id, retryAttempt - 1);
      } else {
        throw new Error('timeout for ' + url);
      }
    } else if (error) {
      console.log('Error:', error);
      throw new Error(error);
    }
    if (response && response.resume) response.resume();
  });
}
