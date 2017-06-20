'use strict';
const Airbrake = require('airbrake');
const merge = require('lodash.merge');

function Faultline() {
  Airbrake.apply(this, arguments);
}
