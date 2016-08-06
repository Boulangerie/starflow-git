var spawn = require('child_process').spawn;
var os = require('os');
var path = require('path');
var Promise = require('bluebird');
var tmp = require('tmp');
var fs = require('fs');

tmp.setGracefulCleanup();

function createTmpDirectory() {
  return new Promise(function (resolve, reject) {
    tmp.dir({unsafeCleanup: true}, function (err, path, cleanupCallback) {
      if (err) {
        reject(err);
      } else {
        resolve({
          path: path,
          cleanupCallback: cleanupCallback
        });
      }
    });
  });
}

function gitInit(cwd) {
  cwd = path.resolve(cwd || './');
  return new Promise(function (resolve, reject) {
    var cmd = spawn('git', ['init'], {
      cwd: cwd
    });
    cmd.stderr.setEncoding('utf8');
    cmd.stderr.on('data', function(chunk) {
      console.log(chunk);
    });
    cmd.on('error', function (err) {
      reject(err);
    });
    cmd.on('close', function (code) {
      if (code === 0) {
        resolve();
      } else {
        reject('Error code ' + code);
      }
    });
  });
}

function gitSetUserEmail(cwd, email) {
  cwd = path.resolve(cwd || './');
  return new Promise(function (resolve, reject) {
    var cmd = spawn('git', ['config', 'user.email', '"' + email + '"'], {
      cwd: cwd
    });
    cmd.stderr.setEncoding('utf8');
    cmd.stderr.on('data', function(chunk) {
      console.log(chunk);
    });
    cmd.on('error', function (err) {
      reject(err);
    });
    cmd.on('close', function (code) {
      if (code === 0) {
        resolve();
      } else {
        reject('Error code ' + code);
      }
    });
  });
}

function gitSetUserName(cwd, name) {
  cwd = path.resolve(cwd || './');
  return new Promise(function (resolve, reject) {
    var cmd = spawn('git', ['config', 'user.name', '"' + name + '"'], {
      cwd: cwd
    });
    cmd.stderr.setEncoding('utf8');
    cmd.stderr.on('data', function(chunk) {
      console.log(chunk);
    });
    cmd.on('error', function (err) {
      reject(err);
    });
    cmd.on('close', function (code) {
      if (code === 0) {
        resolve();
      } else {
        reject('Error code ' + code);
      }
    });
  });
}

function gitEmptyCommit(cwd) {
  cwd = path.resolve(cwd || './');
  return new Promise(function (resolve, reject) {
    var cmd = spawn('git', ['commit', '--allow-empty', '-m', '"Initial commit"'], {
      cwd: cwd
    });
    cmd.stderr.setEncoding('utf8');
    cmd.stderr.on('data', function(chunk) {
      console.log(chunk);
    });
    cmd.on('error', function (err) {
      reject(err);
    });
    cmd.on('close', function (code) {
      if (code === 0) {
        resolve();
      } else {
        reject('Error code ' + code);
      }
    });
  });
}

function gitCreateAndCheckoutBranch(cwd, name) {
  cwd = path.resolve(cwd || './');
  return new Promise(function (resolve, reject) {
    var cmd = spawn('git', ['checkout', '-b', name], {
      cwd: cwd
    });
    cmd.stderr.setEncoding('utf8');
    cmd.stderr.on('data', function(chunk) {
      console.log(chunk);
    });
    cmd.on('error', function (err) {
      reject(err);
    });
    cmd.on('close', function (code) {
      if (code === 0) {
        resolve();
      } else {
        reject('Error code ' + code);
      }
    });
  });
}

function initTmpGitEnv(path) {
  return gitInit(path)
    .then(function () {
      return gitSetUserEmail(path, 'you@example.com');
    })
    .then(function () {
      return gitSetUserName(path, 'Your Name');
    })
    .then(function () {
      return gitEmptyCommit(path);
    });
}

function gitBranches(cwd) {
  cwd = path.resolve(cwd || './');
  return new Promise(function (resolve, reject) {
    var cmd = spawn('git', ['branch'], {
      cwd: cwd
    });
    cmd.stdout.setEncoding('utf8');
    var out = '';
    cmd.stdout.on('data', function (chunk) {
      out += chunk;
    });
    cmd.stderr.setEncoding('utf8');
    cmd.stderr.on('data', function(chunk) {
      console.log(chunk);
    });
    cmd.on('error', function (err) {
      reject(err);
    });
    cmd.on('close', function (code) {
      if (code === 0) {
        var branches = out
          .split(os.EOL)
          .map(function (line) {
            return line.replace(/^\s*/, '').replace(/\s*$/, '');
          })
          .filter(function (line) {
            return line !== '';
          });
        resolve(branches);
      } else {
        reject('Error code ' + code);
      }
    });
  });
}

function createDummyFile(cwd, name) {
  cwd = path.resolve(cwd || './');
  return new Promise(function (resolve, reject) {
    try {
      fs.writeFileSync(path.join(cwd, '/', name), 'Hi, I\'m Bob!');
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

function gitAddFile(cwd, name) {
  cwd = path.resolve(cwd || './');
  return new Promise(function (resolve, reject) {
    var cmd = spawn('git', ['add', name], {
      cwd: cwd
    });
    cmd.stderr.setEncoding('utf8');
    cmd.stderr.on('data', function(chunk) {
      console.log(chunk);
    });
    cmd.on('error', function (err) {
      reject(err);
    });
    cmd.on('close', function (code) {
      if (code === 0) {
        resolve();
      } else {
        reject('Error code ' + code);
      }
    });
  });
}

function gitStatus(cwd) {
  cwd = path.resolve(cwd || './');
  return new Promise(function (resolve, reject) {
    var cmd = spawn('git', ['status'], {
      cwd: cwd
    });
    cmd.stdout.setEncoding('utf8');
    var out = '';
    cmd.stdout.on('data', function (chunk) {
      out += chunk;
    });
    cmd.stderr.setEncoding('utf8');
    cmd.stderr.on('data', function(chunk) {
      console.log(chunk);
    });
    cmd.on('error', function (err) {
      reject(err);
    });
    cmd.on('close', function (code) {
      if (code === 0) {
        resolve(out);
      } else {
        reject('Error code ' + code);
      }
    });
  });
}

function gitStashes(cwd) {
  cwd = path.resolve(cwd || './');
  return new Promise(function (resolve, reject) {
    var cmd = spawn('git', ['stash', 'list'], {
      cwd: cwd
    });
    cmd.stdout.setEncoding('utf8');
    var out = '';
    cmd.stdout.on('data', function (chunk) {
      out += chunk;
    });
    cmd.stderr.setEncoding('utf8');
    cmd.stderr.on('data', function(chunk) {
      console.log(chunk);
    });
    cmd.on('error', function (err) {
      reject(err);
    });
    cmd.on('close', function (code) {
      if (code === 0) {
        var stashes = out
          .split(os.EOL)
          .map(function (line) {
            return line.replace(/^\s*/, '').replace(/\s*$/, '');
          })
          .filter(function (line) {
            return line !== '';
          });
        resolve(stashes);
      } else {
        reject('Error code ' + code);
      }
    });
  });
}

module.exports = {
  createTmpDirectory: createTmpDirectory,
  gitInit: gitInit,
  gitEmptyCommit: gitEmptyCommit,
  initTmpGitEnv: initTmpGitEnv,
  gitCreateAndCheckoutBranch: gitCreateAndCheckoutBranch,
  gitBranches: gitBranches,
  createDummyFile: createDummyFile,
  gitAddFile: gitAddFile,
  gitStatus: gitStatus,
  gitStashes: gitStashes
};
