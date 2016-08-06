var _ = require('lodash');
var expect = require('chai').expect;
var currentBranchFactoryWrapper = require('../lib/currentBranch');
var starflow = require('starflow');
var helpers = require('./helpers');

beforeEach(function () {
  starflow.logger.mute();
});

afterEach(function () {
  starflow.logger.unmute();
});

describe('CurrentBranch', function () {

  it('Factory should provide an executable instance', function () {
    var currentBranchInstance = currentBranchFactoryWrapper(starflow)();
    expect(typeof currentBranchInstance).to.equal('object');
    expect(typeof currentBranchInstance.exec).to.equal('function');
  });

  it('Name should be "git.currentBranch"', function () {
    var currentBranchInstance = currentBranchFactoryWrapper(starflow)();
    expect(currentBranchInstance.name).to.equal('git.currentBranch');
  });

  it('should store the correct "current" git branch name', function (done) {
    helpers
      .createTmpDirectory()
      .then(initGit)
      .then(createAndCheckoutBranch)
      .then(execCurrentBranchInstance)
      .then(function (res) {
        expect(res.currentBranchInstance.storage.get('name')).to.equal('my-branch');
        res.cleanupCallback();
        done();
      });

    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function initGit(res) {
      return helpers
        .initTmpGitEnv(res.path)
        .then(function () {
          return res;
        });
    }

    function createAndCheckoutBranch(res) {
      return helpers
        .gitCreateAndCheckoutBranch(res.path, 'my-branch')
        .then(function () {
          return res;
        });
    }

    function execCurrentBranchInstance(res) {
      var currentBranchInstance = currentBranchFactoryWrapper(starflow)({
        cwd: res.path
      });
      return currentBranchInstance
        .exec()
        .then(function () {
          return _.assign(res, {
            currentBranchInstance: currentBranchInstance
          });
        });
    }
  });

});
