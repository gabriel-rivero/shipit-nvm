/**
 * Update NPM task.
 * - npm:install
 */

var sprintf = require('sprintf-js').sprintf;
var utils   = require('shipit-utils');
var chalk   = require('chalk');
var shipit;

function install(remote) {
  shipit.log('Installing npm modules.');
  var method = remote ? 'remote' : 'local';
  var cdPath = remote ? shipit.releasePath || shipit.currentPath : shipit.config.workspace;
  if (!cdPath) {
    var msg = remote ?
      'Please specify a deploy to path (shipit.config.deployTo)' :
      'Please specify a workspace (shipit.config.workspace)';
    throw new Error(shipit.log(chalk.red(msg)));
  }
  var args  = Array.isArray(shipit.config.npm.installArgs) ?
    shipit.config.npm.installArgs.join(' ') :
    shipit.config.npm.installArgs;
  var flags = Array.isArray(shipit.config.npm.installFlags) ?
    shipit.config.npm.installFlags.join(' ') :
    shipit.config.npm.installFlags;
  var AF = args ?
    flags ?
      args.concat(' ',flags) :
      args :
    flags ?
      flags :
      '';
  return shipit[method](
    sprintf('export PATH=/home/deploy/.nvm/versions/node/\\\`cat /home/deploy/.nvm/alias/default\\\`/bin:\\$PATH ; node -v && cd %s && npm i %s', cdPath, AF)
  );

}

module.exports = function (gruntOrShipit) {
  shipit = utils.getShipit(gruntOrShipit);

  utils.registerTask(gruntOrShipit, 'npm:install', function () {
    if (shipit.npm_inited) {
      return install(shipit.config.npm.remote)
        .then(function () {
          shipit.log(chalk.green('npm install complete'));
        })
        .then(function () {
          shipit.emit('npm_installed');
        })
        .catch(function (e) {
          shipit.log(chalk.red(e));
        });
    } else {
      throw new Error(
        shipit.log(chalk.gray('try running npm:init before npm:install'))
      );
    }
  });
};
