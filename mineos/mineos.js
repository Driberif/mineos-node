var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var mineos = exports;

mineos.DIRS = {
  'servers': 'servers',
  'backup': 'backup',
  'archive': 'archive',
  'profiles': 'profiles',
  'import': 'import'
}

mineos.server_list = function(base_dir) {
  return fs.readdirSync(path.join(base_dir, mineos.DIRS['servers']));
}

mineos.valid_server_name = function(server_name) {
  var regex_valid_server_name = /^(?!\.)[a-zA-Z0-9_\.]+$/;
  return regex_valid_server_name.test(server_name);
}

mineos.mc = function(server_name, base_dir) {
  var self = this;
  self.server_name = server_name;

  self.env = {
    base_dir: base_dir,
    cwd: path.join(base_dir, mineos.DIRS['servers'], server_name),
    bwd: path.join(base_dir, mineos.DIRS['backup'], server_name),
    awd: path.join(base_dir, mineos.DIRS['archive'], server_name),
    sp: path.join(base_dir, mineos.DIRS['servers'], server_name, 'server.properties'),
    sc: path.join(base_dir, mineos.DIRS['servers'], server_name, 'server.config'),
  }

  self.create = function() {
    var touch = require("touch");

    fs.mkdirSync(self.env.cwd);
    touch.sync(self.env.sp);
    touch.sync(self.env.sc);
  }

  self.is_server = function() {
    return fs.existsSync(self.env.sp);
  }

  self.sp = function() {
    var DEFAULTS = {
      'server-port': 25565,
      'max-players': 20,
      'level-seed': '',
      'gamemode': 0,
      'difficulty': 1,
      'level-type': 'DEFAULT',
      'level-name': 'world',
      'max-build-height': 256,
      'generate-structures': 'false',
      'generator-settings': '',
      'server-ip': '0.0.0.0',
    }

    if (typeof(self._sp) == 'undefined') {
      self._sp = {};
      for (var k in DEFAULTS) {
        self._sp[k] = DEFAULTS[k];
      }
    }
      
    return self._sp;
  }

  self.command_start = function() {
    var string = '{0} -dmS {1} {2} -server {3} -Xmx{4}M -Xms{5}M {6} -jar {7} {8}';
    return string.format( '/usr/bin/screen', //path to screen
                          'mc-{0}'.format(self.server_name), //server_name
                          '/usr/bin/java',   //path to java
                          '',                //java_debug_args
                          '256',             //xmx
                          '256',             //xms
                          '',                //java_tweaks
                          'minecraft_server.jar', //server_jar
                          'nogui')           //jar_args
  }

  return self;
}

String.prototype.format = function() {
  var s = this;
  for(var i = 0, iL = arguments.length; i<iL; i++) {
    s = s.replace(new RegExp('\\{'+i+'\\}', 'gm'), arguments[i]);
  }
  return s;
};
