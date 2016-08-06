var expect = require('chai').expect;
var createBranchFactoryWrapper = require('../lib/createBranch');
var starflow = require('starflow');
var helpers = require('./helpers');

beforeEach(function () {
  starflow.logger.mute();
});

afterEach(function () {
  starflow.logger.unmute();
});

describe('CreateBranch', function () {

  it('Factory should provide an executable instance', function () {
    var createBranchInstance = createBranchFactoryWrapper(starflow)();
    expect(typeof createBranchInstance).to.equal('object');
    expect(typeof createBranchInstance.exec).to.equal('function');
  });

  it('Name should be "git.createBranch"', function () {
    var createBranchInstance = createBranchFactoryWrapper(starflow)();
    expect(createBranchInstance.name).to.equal('git.createBranch');
  });

  it('should create a new branch without checkout', function (done) {
    helpers
      .createTmpDirectory()
      .then(initGit)
      .then(execCreateBranchInstance)
      .then(getBranches)
      .then(function (res) {
        expect(res.branches.indexOf('my-new-branch')).not.to.equal(-1);
        res.cleanupCallback();
        done();
      });

    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function execCreateBranchInstance(res) {
      var createBranchInstance = createBranchFactoryWrapper(starflow)({
        cwd: res.path
      });
      return createBranchInstance
        .exec('my-new-branch')
        .then(function () {
          return res;
        });
    }
  });

  it('should create a new branch and checkout to it', function (done) {
    helpers
      .createTmpDirectory()
      .then(initGit)
      .then(execCreateBranchInstance)
      .then(getBranches)
      .then(function (res) {
        expect(res.branches.indexOf('* my-new-branch')).not.to.equal(-1);
        res.cleanupCallback();
        done();
      });

    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function execCreateBranchInstance(res) {
      var createBranchInstance = createBranchFactoryWrapper(starflow)({
        cwd: res.path
      });
      return createBranchInstance
        .exec('my-new-branch', true)
        .then(function () {
          return res;
        });
    }
  });

  /* -------------------------------------------------------
   * Functions common to every `it`
   * ---------------------------------------------------- */

  function initGit(res) {
    return helpers
      .initTmpGitEnv(res.path)
      .then(function () {
        return res;
      });
  }

  function getBranches(res) {
    return helpers
      .gitBranches(res.path)
      .then(function (branches) {
        return {
          branches: branches,
          cleanupCallback: res.cleanupCallback
        };
      });
  }

});
