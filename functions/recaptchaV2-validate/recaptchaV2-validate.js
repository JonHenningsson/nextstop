const recaptchaV2validate = require('./recaptchaV2-api-validate');

exports.handler = async (event, context) => {
  try {
    const recaptcha_validate = new recaptchaV2validate(process.env.SITE_RECAPTCHA_SECRET);
    let response = event.queryStringParameters.response;

    let validate_result = await recaptcha_validate.validate(response);

    return {
      statusCode: 200,
      body: JSON.stringify(validate_result)
    }

  } catch (err) {
    return { statusCode: 500, body: err.toString() }
  }
}
