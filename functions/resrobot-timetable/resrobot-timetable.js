const TimeTable2Departing = require('./resrobot-timetable2-departing');

exports.handler = async (event, context) => {
  try {
    const timetable = new TimeTable2Departing(process.env.resrobot_timetable_api_key);
    let stopid = event.queryStringParameters.stopid || 740023844

    let timetable_result = await timetable.timetable(stopid);

    return {
      statusCode: 200,
      body: JSON.stringify(timetable_result)
    }

  } catch (err) {
    return { statusCode: 500, body: err.toString() }
  }
}
