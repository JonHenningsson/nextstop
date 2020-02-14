const https = require('https');

class TimeTable2Departing {
  constructor(apikey) {
    this.apikey = apikey;
    this.timetable_base_url = `https://api.resrobot.se/v2/departureBoard?key=${apikey}&format=json`;
  }

  timetable = (stopid) => {
      return new Promise(
        (resolve, reject) => {

          this.stopid = stopid;
          this.timetable_url = this.timetable_base_url + `&id=${this.stopid}`;

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
