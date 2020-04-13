const https = require('https');

class TimeTable2Departing {
  constructor(apikey) {
    this.apikey = apikey;
    this.products = 2 + 4 + 8 + 16 + 128;
    this.timetable_base_url = `https://api.resrobot.se/v2/departureBoard?key=${apikey}&format=json&products=${this.products}`;
  }

  timetable = (stopid) => {
      return new Promise(
        (resolve, reject) => {

          let maxJourneys = 5;
          this.stopid = stopid;
          this.timetable_url = this.timetable_base_url + `&id=${this.stopid}&maxJourneys=${maxJourneys}`;

          https.get(this.timetable_url, (resp) => {
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

module.exports = TimeTable2Departing;
