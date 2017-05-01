/*
 *  flowparser.js
 *  Author: Pablo Carrillo
 *  Company: Calvium Ltd.
 *  License: MIT
 *  Copyright Calvium Ltd. 2016
 *  flowparser is a simple wrapper for flow that will check the output and
 *  parse it. The output can then be feed to `arc lint` and included in the
 *  arc diff workflow
 */
 
"use strict";
const execFile = require('child_process').execFile;
const flow = require('flow-bin');
const dir = process.argv[2];
const file = process.argv[3];
const flowError = 'flow-type-error';
let path;
function parseOutput(json, path)
{
    // Pretended output, one per line
    // ${file}: line ${line}, col ${col}, ${error-type} - {issue-type}. (code)
    let output = "";
    if(json.passed === false)
    {
        const arrayOfStrings = json.errors.map(
            errorObject =>
            {
                let info = errorObject.message[0];
                if(path !== info.path)
                {
                    return "";
                }
                return `${info.path}: line ${info.line}, col ${info.start}, ${errorObject.level} - ${errorObject.message.reduce(
                    (a, b) => `${a} ${b.descr}`, ""
                )}. (${flowError})`;
            }
        );
        output = arrayOfStrings.reduce((a, b) => `${a}\n${b}`);
    }
    return output;
}

// Catch flow as if some error is found it would exit with a code != 0
try
{
    path = process.cwd() + "/" + file;
    const child = execFile(
        flow,
        ['--json'],
        {
            cwd: dir,
            // This should bullet proof an issue where the flow output is too big
            // for the default value (50MB buffer size)
            // This should not be necessary when 
            // https://github.com/facebook/flow/issues/2364 is solved
            maxBuffer: 50*1024*1024, 
        },
        (error, stdout) =>
        {
            let json = JSON.parse(stdout);
            console.log(parseOutput(json, path));
        }
    );
}
catch(err)
{
    let json = JSON.parse(err.stdout);
    console.log(parseOutput(json, path));
}

return 0;
