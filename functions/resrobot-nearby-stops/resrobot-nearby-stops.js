const NearbyStops = require('./resrobot-api-nearby-stops');

exports.handler = async (event, context) => {
  try {
    const trip = new NearbyStops(process.env.resrobot_tripplanner_api_key);
    let lat = event.queryStringParameters.lat;
    let lon = event.queryStringParameters.lon;

    let nearbystops_result = await trip.nearbystops(lat, lon);

    return {
      statusCode: 200,
      body: JSON.stringify(nearbystops_result)
    }

  } catch (err) {
    return { statusCode: 500, body: err.toString() }
  }
}
