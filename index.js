module.exports = function (starflow) {

  return {
    factories: {
      currentBranch: require('./lib/currentBranch')(starflow),
      createBranch: require('./lib/createBranch')(starflow),
      stash: require('./lib/stash')(starflow)
    }
  };

};
