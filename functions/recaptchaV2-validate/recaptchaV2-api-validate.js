const querystring = require('querystring');
const https = require('https');

class recaptchaV2validate {
  constructor(secret) {
    this.secret = secret;
    this.recaptchav2_validate_hostname = "www.google.com";
    this.recaptchav2_validate_path = "/recaptcha/api/siteverify";
  }

  validate = (response) => {
      return new Promise(
        (resolve, reject) => {

          this.response = response;

          const post_data = querystring.stringify({
            "secret": this.secret,
            "response": this.response
          });

          var options = {
            hostname: this.recaptchav2_validate_hostname,
            port: 443,
            path: this.recaptchav2_validate_path,
            method: "POST",
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Content-Length': post_data.length
            }
          };

          var req = https.request(options, (resp) => {
            let data = '';

            resp.on('data', (chunk) => {
              data += chunk;
            });

            resp.on('end', () => {
              resolve(JSON.parse(data));
            });

          });

          req.on("error", (err) => {
            reject("Error: " + err.message);
          });

          req.write(post_data);
          req.end();

       }
     );
    };


}

module.exports = recaptchaV2validate;
