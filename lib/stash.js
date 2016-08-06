module.exports = function (starflow) {

  var _ = require('lodash');
  var Promise = require('bluebird');
  var spawnFactory = require('starflow-shell')(starflow).factories.spawn;
  var Task = starflow.Task;
  var BaseExecutable = starflow.BaseExecutable;

  var STASH_NAME = 'starflow-tmp';
  var STASH_ID_UNDEFINED_MESSAGE = 'Could not find any stash ID for starflow-tmp';

  function Stash(options) {
    BaseExecutable.call(this, 'git.stash');
    this.options = _.defaults({}, options, {
      cwd: './'
    });
  }
  Stash.prototype = Object.create(BaseExecutable.prototype);
  Stash.prototype.constructor = Stash;

  Stash.prototype.getStashId = function getStashId() {
    var executableChild = spawnFactory();
    this.addChild(executableChild);

    function onSuccess() {
      var pattern = '^stash@\\{(\\d+)\\}\\: (?:.+\\: )' + STASH_NAME;
      var lastShellOutput = executableChild.storage.get('output');
      var stashLines = lastShellOutput ? lastShellOutput.split('\n') : [];
      var matches;
      _.forEach(stashLines, function (line) {
        matches = line.match(new RegExp(pattern));
        if (matches) {
          this.storage.set('starflowTmpStashId', matches[1]);
          return false;
        }
      }.bind(this));

      if (_.isUndefined(this.storage.get('starflowTmpStashId'))) {
        throw new Error(STASH_ID_UNDEFINED_MESSAGE);
      }
    }

    var options = this.options;
    var spawnConfig = {
      cmd: 'git',
      args: ['stash', 'list'],
      options: {
        cwd: options.cwd
      }
    };
    return new Task(executableChild, spawnConfig, '$')
      .run()
      .then(onSuccess.bind(this));
  };

  Stash.prototype.stash = function stash(isPop) {
    function onStashError(err) {
      if (!/No stash found/.test(err.message)) {
        throw err;
      }
      starflow.logger.warning('Nothing was stashed');
    }

    var options = this.options;
    function onGetStashIdSuccess() {
      var spawnConfig = {
        cmd: 'git',
        args: ['stash', (isPop ? 'pop' : 'save'), (isPop ? 'stash@{' + this.storage.get('starflowTmpStashId') + '}' : STASH_NAME)],
        options: {
          cwd: options.cwd
        }
      };
      var executableChild = spawnFactory();
      this.addChild(executableChild);
      return new Task(executableChild, spawnConfig, '$').run();
    }

    function onGetStashIdError(err) {
      if (err.message !== STASH_ID_UNDEFINED_MESSAGE) {
        throw err;
      }
      starflow.logger.warning('No starflow-tmp stash was found');
    }
    // @todo: Test this case when isPop is false
    var promise = isPop ? this.getStashId.bind(this) : Promise.resolve;

    return promise()
      .then(onGetStashIdSuccess.bind(this), onGetStashIdError)
      .catch(onStashError);
  };

  Stash.prototype.exec = function exec(isPop) {
    return this.stash(!!isPop);
  };

  return function (options) {
    return new Stash(options);
  };

};
