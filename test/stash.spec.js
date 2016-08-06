var _ = require('lodash');
var expect = require('chai').expect;
var stashFactoryWrapper = require('../lib/stash');
var starflow = require('starflow');
var helpers = require('./helpers');

beforeEach(function () {
  // starflow.logger.mute();
});

afterEach(function () {
  // starflow.logger.unmute();
});

describe('Stash', function () {

  var dummyFileName = 'bob.txt';

  it('Factory should provide an executable instance', function () {
    var stashInstance = stashFactoryWrapper(starflow)();
    expect(typeof stashInstance).to.equal('object');
    expect(typeof stashInstance.exec).to.equal('function');
  });

  it('Name should be "git.stash"', function () {
    var stashInstance = stashFactoryWrapper(starflow)();
    expect(stashInstance.name).to.equal('git.stash');
  });

  it('should stash the not-staged changes', function (done) {
    helpers
      .createTmpDirectory()
      .then(initGit)
      .then(createDummyFile)
      .then(gitAddFile)
      .then(execStashInstance)
      .then(getStashes)
      .then(function (res) {
        var stashLine = 'stash@{0}: On master: starflow-tmp';
        expect(res.stashes.indexOf(stashLine)).not.to.equal(-1);
        res.cleanupCallback();
        done();
      });

    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function execStashInstance(res) {
      var stashInstance = stashFactoryWrapper(starflow)({
        cwd: res.path
      });
      return stashInstance
        .exec()
        .then(function () {
          return res;
        });
    }
  });

  it('should unstash the previously stashed changes', function (done) {
    var statusLineRegex = new RegExp('new file:\\s*' + dummyFileName);
    helpers
      .createTmpDirectory()
      .then(initGit)
      .then(createDummyFile)
      .then(gitAddFile)
      .then(function (res) {
        return execStashInstance(res);
      })
      .then(gitStatus)
      .then(function (res) {
        // make sure the changes have been stashed
        expect(statusLineRegex.test(res.status)).not.to.equal(true);
        return res;
      })
      .then(function (res) {
        // unstash the changes that just got stashed
        return execStashInstance(res, true);
      })
      .then(gitStatus)
      .then(function (res) {
        expect(statusLineRegex.test(res.status)).to.equal(true);
        res.cleanupCallback();
        done();
      });

    ////////////////////////////////////////////////////////////////////////////////////////////////////

    function execStashInstance(res, isUnstash) {
      isUnstash = isUnstash || false;
      var stashInstance = stashFactoryWrapper(starflow)({
        cwd: res.path
      });
      return stashInstance
        .exec(isUnstash)
        .then(function () {
          return res;
        });
    }
    
    function gitStatus(res) {
      return helpers
        .gitStatus(res.path)
        .then(function (status) {
          return _.assign(res, {
            status: status
          });
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

  function createDummyFile(res) {
    return helpers
      .createDummyFile(res.path, dummyFileName)
      .then(function () {
        return res;
      });
  }

  function gitAddFile(res) {
    return helpers
      .gitAddFile(res.path, dummyFileName)
      .then(function () {
        return res;
      });
  }

  function getStashes(res) {
    return helpers
      .gitStashes(res.path)
      .then(function (stashes) {
        return _.assign(res, {
          stashes: stashes
        });
      });
  }

});
