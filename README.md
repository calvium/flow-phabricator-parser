# flow-phabricator-parser
A flow output parser to be use with phabricator `arc lint`


This is a simple wrapper - parser for node that will transform the output from [flow]() to something that phabricator can inspect in the linting stage.

##How to use it.

Install the package with

```lang=bash
npm install flow-phabricator-parser --save-dev 
#or 
yarn add flow-phabricator-parser --dev
```

or copy the source file to your project.

To configure the script with _*arc lint*_
create a `.arclint` file and add

```lang=javascript
{
  "linters": {
    ....
  "flow-regex-based": {
    "type": "script-and-regex",
    "include": "(\\.js?$)",
    "exclude": [ ],
    "script-and-regex.script": "sh -c '(node ./ProjectDir/node_modules/flow-phabricator-parser/flowparser.js ./ProjectDir \"$0\")'",
    "script-and-regex.regex": "/^(?P<file>.*): line (?P<line>[0-9]*), col (?P<char>[0-9]*), (?P<severity>error|warning) - (?P<message>.*) \\((?P<code>[a-z-]+)\\)$/m"
    }
  }
}
```

Notes
----

You **must** install the appropiate version of flow-bin for your project.

We point to `"(\\.js?$)",` to get all the js files changed since last version. Also the parser will discard errors that doesn't belong to changed files. If you think some error reported is criptic you may want to runt flow in your __project folder__. 

On 

```lang=javascript
"script-and-regex.script": "sh -c '(node ./ProjectDir/node_modules/flow-phabricator-parser/flowparser.js ./ProjectDir \"$0\")'"
```

we need to pass `./ProjectDir ` as the folder where flow will be run (AKA the folder of your `.flowconfig` file) relative to the root of the git repository.

##Current Limitations

- Flow is invoked for each file and the output processed for each different file.
- Right now, in very big projects with many dependencies in `node_modules`; errors in the parsing are not impossible although really unlikely. To solve this we may need to move from `execFile` to a more robust mechanism.
