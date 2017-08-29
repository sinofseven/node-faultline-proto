'use strict';
const Airbrake = require('airbrake');
const merge = require('lodash.merge');
const stackTrace = require('stack-trace');
const request = require('request');
const fs = require('fs');

const HTTP_STATUS_CODES = require('http').STATUS_CODES;

function Faultline() {
  Airbrake.apply(this, arguments);

  delete this.key;
  delete this.projectId;
  delete this.protocol;
  delete this.serviceHost;

  this.project = null;
  this.apiKey = null;
  this.endpoint = null;
  this.notifications = null;

}

merge(Faultline.prototype, Airbrake.prototype);

Faultline.PACKAGE = (function() {
  const json = fs.readFileSync(__dirname + '/../package.json', 'utf8');
  return JSON.parse(json);
}());

Faultline.createClient = function(opt) {
  if (opt == null) {
    throw new Error("option is null.");
  }
  const project = opt.project;
  const apiKey = opt.apiKey;
  const endpoint = opt.endpoint;
  const notifications = opt.notifications || [];

  if (project == null || apiKey == null || endpoint == null) {
    throw new Error("project or apiKey or endpoint missing during Faultline.createClient()");
  }

  const instance = new this();
  instance.project = project;
  instance.apiKey = apiKey;
  instance.endpoint = endpoint;
  instance.notifications = notifications;
  return instance;

}


Faultline.prototype.url = function() {
  return this.endpoint + "/projects/" + this.project + "/errors" ;
};


Faultline.prototype.trackDeployment = function(params, cb) {
  var callback = cb;
  var deploymentParams = params || {};

  if (typeof deploymentParams === 'function') {
    callback = deploymentParams;
    deploymentParams = {};
  }

  deploymentParams = merge({
    env: this.env,
    user: process.env.USER,
    rev: execSync('git rev-parse HEAD').toString().trim(),
    repo: execSync('git config --get remote.origin.url').toString().trim()
  }, deploymentParams);

  var body = this.deploymentPostData(deploymentParams);

  var options = merge({
    method: 'POST',
    url: this.url(),
    body: body,
    timeout: this.timeout,
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': this.apiKey
    },
    proxy: this.proxy
  }, this.requestOptions);

  var requestCallback = this._callback(callback);

  request(options, function(err, res, responseBody) {
    if (err) {
      return requestCallback(err);
    }

    if (res.statusCode >= 300) {
      var status = HTTP_STATUS_CODES[res.statusCode];
      return requestCallback(new Error(
        'Deployment failed: ' + res.statusCode + ' ' + status + ': ' + responseBody
      ));
    }

    return requestCallback(null, deploymentParams);
  });
};

Faultline.prototype.notifyJSON = function(err) {
  var trace = stackTrace.parse(err);
  var self = this;

  return {
    errors: [
      {
        type: err.type || 'Error',
        message: err.message || 'error',
        backtrace: trace.map(function(callSite) {
          return {
            file: callSite.getFileName() || '',
            line: callSite.getLineNumber(),
            function: callSite.getFunctionName() || ''
          };
        })
      }],
    environment: self.environmentJSON(err),
    context: self.contextJSON(err),
    session: self.sessionVars(err),
    params: self.paramsVars(err),
    notifications: self.notifications
  };
};

Faultline.prototype._sendRequest = function (body, cb) {
  var callback = this._callback(cb);

  var options = merge({
    method: 'POST',
    url: this.url(),
    body: body,
    timeout: this.timeout,
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': this.apiKey
    }
  }, this.requestOptions);

  request(options, function(requestErr, res, responseBody) {
    if (requestErr) {
      return callback(requestErr);
    }

    if (typeof responseBody === 'undefined') {
      return callback(new Error('invalid body'));
    }

    if (res.statusCode >= 300) {
      var status = HTTP_STATUS_CODES[res.statusCode];

      var explanation = responseBody.match(/<error>([^<]+)/i);
      explanation = (explanation)
        ? ': ' + explanation[1]
        : ': ' + responseBody;

      return callback(new Error(
        'Notification failed: ' + res.statusCode + ' ' + status + explanation
      ));
    }

    return callback(null, JSON.parse(responseBody).url);
  });
};
module.exports = Faultline;
