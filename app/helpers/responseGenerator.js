/**
 * Created by aldo on 11/23/13.
 */
var responseGenerator = function (success, message, data) {

  return {'success':success, 'data': data, 'message':message }

}

module.exports = responseGenerator;