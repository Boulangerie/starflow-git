# starflow-git [![Build Status](https://travis-ci.org/Boulangerie/starflow-git.svg?branch=master)](https://travis-ci.org/Boulangerie/starflow-git)

## Prerequisites

In order to use this plugin, your project must have [starflow](http://github.com/boulangerie/starflow) as a dependency.

## Install

```
$ npm install --save-dev starflow-git
```

## Usage

Using a workflow:

```js
var starflow = require('starflow');

var steps = [
  {'git.createBranch': 'my-branch'}
];

var workflow = new starflow.Workflow(steps);
return workflow
  .addPlugin(require('starflow-git'))
  .run();
```

In an executable:

```js
module.exports = function (starflow) {
  var createBranchFactory = require('starflow-git')(starflow).factories.createBranch;

  function MyExecutable() {
    starflow.BaseExecutable.call(this, 'myPlugin.myExecutable');
  }
  MyExecutable.prototype = Object.create(starflow.BaseExecutable.prototype);
  MyExecutable.prototype.constructor = MyExecutable;

  MyExecutable.prototype.exec = function exec() {
    var createBranchExecutable = this.createExecutable(createBranchFactory);
    return new starflow.Task(createBranchExecutable, ['my-branch'])
      .run();
  };

  return function () {
    return new MyExecutable();
  };
};
```

## Executables

Thereafter is the list of all the executable classes provided by this plugin.

> **Important** The titles indicate the name that can be used when writing the steps of a workflow.

### git.createBranch

Create a new git branch (and checkout to it if set in the args).

Usage:
```js
// for a workflow
var withCheckout = true;
var steps = [
  {'git.createBranch': ['branch-name', withCheckout]}
  // or {'git.createBranch': 'branch-name'} if no checkout after branch creation
];

// in an executable
var createBranchFactory = require('starflow-git')(starflow).factories.createBranch;
var withCheckout = true;
var myTask = new starflow.Task(createBranchFactory, ['branch-name', withCheckout]);
```

### git.currentBranch

Get the current branch name.

Usage:
```js
// for a workflow
var steps = [
  'git.currentBranch' // no arg required
];

// in an executable
var currentBranchFactory = require('starflow-git')(starflow).factories.currentBranch;
var myTask = new starflow.Task(currentBranchFactory);
```

### git.stash

Stash (or unstash if arg is provided) some changes in the git tree.

Usage:
```js
// for a workflow
var steps = [
  'git.stash', // stashes the current changes
  {'git.stash': true} // unstashes the changes
];

// in an executable
var stashFactory = require('starflow-git')(starflow).factories.stash;
var isUnstash = true;
var myTask = new starflow.Task(stashFactory, [isUnstash]);
```

> **Note**: the created stash element's name is `starflow-tmp`.

## Storage

Some of the executables of this plugin store some values in their storage.

### git.currentBranch

- **name** Contains the name of the current git branch.

  Example:

  ```js
  var starflow = require('starflow');

  var steps = [
    'git.currentBranch',
    {'custom.echo': '{{/git.currentBranch/name}}'} // displays the current git branch name
  ];

  var workflow = new starflow.Workflow(steps);
  return workflow
    .addPlugin(require('starflow-git'))
    .addPlugin(require('starflow-custom')) // plugin that contains the 'echo' executable
    .run();
  ```

> **Note:** learn more about storage paths on the [Starflow documentation page](http://github.com/boulangerie/starflow/blob/master/docs/API.md#path-format).
