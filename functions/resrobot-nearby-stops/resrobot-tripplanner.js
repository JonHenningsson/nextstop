const https = require('https');

class TripPlanner {
  constructor(apikey) {
    this.apikey = apikey;
    this.nearbystops_base_url = `https://api.resrobot.se/location.nearbystops?key=${apikey}&format=json`;
  }

  nearbystops = (lat, lon) => {
      return new Promise(
        (resolve, reject) => {

          let radius = 10000
          let maxNo = 10
          this.lat = lat;
          this.lon = lon;
          this.nearbystops_url = this.nearbystops_base_url + `&originCoordLat=${this.lat}&originCoordLong=${this.lon}&r=${radius}&maxNo=${maxNo}`;

          https.get(this.nearbystops_url, (resp) => {
            let data = '';

            resp.on('data', (chunk) => {
              data += chunk;
            });

            resp.on('end', () => {
              resolve(JSON.parse(data));
            });

          }).on("error", (err) => {
            reject("Error: " + err.message);
          });

       }
     );
    };

}

module.exports = TripPlanner;
