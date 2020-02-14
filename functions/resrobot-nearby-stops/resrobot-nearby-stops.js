const TripPlanner = require('./resrobot-tripplanner');

exports.handler = async (event, context) => {
  try {
    const trip = new TripPlanner(process.env.tripplanner_api_key);
    let lat = event.queryStringParameters.lat || 59.32983;
    let lon = event.queryStringParameters.lat || 18.05766;

    let nearbystops_result = await trip.nearbystops(lat, lon);

    return {
      statusCode: 200,
      body: JSON.stringify(nearbystops_result)
    }

  } catch (err) {
    return { statusCode: 500, body: err.toString() }
  }
}
