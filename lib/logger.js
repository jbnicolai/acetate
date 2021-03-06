var chalk = require('chalk');
var util = require('util');
var _ = require('lodash');
var events = require("events");

var levels = {
  'debug': 1,
  'verbose': 2,
  'info': 3,
  'success': 4,
  'warn': 4,
  'error': 5,
  'stack': 6,
  'silent': 7
};

var colors = {
  'debug': chalk.gray,
  'verbose': chalk.gray,
  'info': chalk.cyan,
  'success': chalk.green,
  'warn': chalk.white.bgYellow,
  'error': chalk.white.bgRed,
  'stack': chalk.red,
  'silent': chalk.gray
};

function pad(string, to){
  if(string.length < to){
    return new Array(to-string.length).join(' ');
  }
  return '';
}

function round(x, digits){
  return parseFloat(x.toFixed(digits))
}

function Logger (level, silent) {
  this.level = level;
  this.silent = silent;
  this._timers = {};
  events.EventEmitter.call(this);
}

util.inherits(Logger, events.EventEmitter);

Logger.prototype.time = function(label){
  this._timers[label] = process.hrtime();
  // this._timers[label] = new Date();
}

Logger.prototype.timeEnd = function(label){
  var diff = process.hrtime(this._timers[label]);
  var ms = (diff[1]/1000000) + (diff[0]*1000);
  // var ms = new Date - this._timers[label];
  return (ms > 1000) ? round(ms/1000, 2) + 's' : round(ms, 2) + 'ms';
}

Logger.prototype.stacktrace = function(stacktrace){
  var lines = stacktrace.split('\n');
  for (var i = 0; i < lines.length; i++) {
    this.stack('stacktrace', '  ' + lines[i]);
  }
}

Logger.prototype._log = function(level, category, message){
  var rest = Array.prototype.slice.call(arguments, 3);
  var prefix = pad(category, 12) + colors[level]('%s');
  var args = ([prefix + ' ' + message, category]).concat(rest);
  var text = util.format.apply(this, args);
  var print = levels[this.level] <= levels[level];

  var data = {
    level: level,
    category: category,
    message: message,
    text: text,
    show: print,
    color: colors[level],
    args: rest
  };

  this.emit('log', data);

  if(print && !this.silent){
    process.stdout.write(text + '\n');
  }

};

_.each(levels, function(level, name){
  Logger.prototype[name] = function(category, message){
    var rest = Array.prototype.slice.call(arguments, 2);
    var args = [name, category, message].concat(rest);
    this._log.apply(this, args);
  };
}, this);

module.exports = Logger;