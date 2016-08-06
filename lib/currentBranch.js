module.exports = function (starflow) {

  var _ = require('lodash');
  var spawnFactory = require('starflow-shell')(starflow).factories.spawn;
  var Task = starflow.Task;
  var BaseExecutable = starflow.BaseExecutable;

  function CurrentBranch(options) {
    BaseExecutable.call(this, 'git.currentBranch');
    this.options = _.defaults({}, options, {
      cwd: './'
    });
  }
  CurrentBranch.prototype = Object.create(BaseExecutable.prototype);
  CurrentBranch.prototype.constructor = CurrentBranch;

  CurrentBranch.prototype.currentBranch = function currentBranch() {
    var executableChild = spawnFactory();
    this.addChild(executableChild);

    function onSuccess() {
      var branchName = String(executableChild.storage.get('output')).trim();
      starflow.logger.log('Current git branch: ' + branchName);
      this.storage.set('name', branchName);
    }

    var options = this.options;
    var spawnConfig = {
      cmd: 'git',
      args: ['rev-parse', '--abbrev-ref', 'HEAD'],
      options: {
        cwd: options.cwd
      }
    };
    return new Task(executableChild, spawnConfig, null, 'git rev-parse --abbrev-ref HEAD')
      .run()
      .then(onSuccess.bind(this));
  };

  CurrentBranch.prototype.exec = function exec() {
    return this.currentBranch();
  };

  return function (options) {
    return new CurrentBranch(options);
  };

};
