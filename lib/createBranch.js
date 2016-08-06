module.exports = function (starflow) {

  var _ = require('lodash');
  var spawnFactory = require('starflow-shell')(starflow).factories.spawn;
  var Task = starflow.Task;
  var BaseExecutable = starflow.BaseExecutable;

  function CreateBranch(options) {
    BaseExecutable.call(this, 'git.createBranch');
    this.options = _.defaults({}, options, {
      cwd: './'
    });
  }
  CreateBranch.prototype = Object.create(BaseExecutable.prototype);
  CreateBranch.prototype.constructor = CreateBranch;

  CreateBranch.prototype.createBranch = function createBranch(branchName) {
    function onCreateBranchSuccess() {
      starflow.logger.log('Git branch created: ' + branchName);
      this.storage.set('name', branchName);
    }
    function onCreateBranchErr(err) {
      if (!/already exists/.test(err.message)) {
        throw err;
      }
      starflow.logger.warning('Could not create the branch because it already exists');
    }

    var options = this.options;
    var spawnConfig = {
      cmd: 'git',
      args: ['branch', branchName],
      options: {
        cwd: options.cwd
      }
    };
    var executableChild = this.createExecutable(spawnFactory);
    return new Task(executableChild, spawnConfig)
      .run()
      .then(onCreateBranchSuccess.bind(this), onCreateBranchErr);
  };

  CreateBranch.prototype.checkout = function checkout(branchName) {
    var options = this.options;
    var spawnConfig = {
      cmd: 'git',
      args: ['checkout', branchName],
      options: {
        cwd: options.cwd
      }
    };
    var executableChild = this.createExecutable(spawnFactory);
    return new starflow.Task(executableChild, spawnConfig)
      .run();
  };

  CreateBranch.prototype.exec = function exec(branchName, withCheckout) {
    var promise = this.createBranch(branchName);
    if (withCheckout) {
      promise = promise.then(this.checkout.bind(this, branchName));
    }
    return promise;
  };

  return function (options) {
    return new CreateBranch(options);
  };

};
