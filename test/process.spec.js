const assert = require("assert");
const path = require("path");
const { spawn, exec } = require("child_process");
const shellPath = path.resolve(__dirname, "../src", "process.js");

function translateArrStrToArr(str) {
    str = str.replace(/[\[\]\s']/g, "");
    return str.split(",");
}

describe("#process", function() {
    it("test process.argv`", done => {
        exec(`node ${shellPath} test_argv`, (err, stdout, stderr) => {
            let argv = translateArrStrToArr(stdout);
            assert.equal(argv.length, 3);
            done();
        });
    });
    it("test process.argv.length`", done => {
        exec(`node ${shellPath} length arg2 arg3`, (err, stdout, stderr) => {
            let argv = translateArrStrToArr(stdout);
            assert.equal(argv[0], 5);
            done();
        });
    });
    it("test process.argv0`", done => {
        exec(`node ${shellPath} test_argv0`, (err, stdout, stderr) => {
            let argv = translateArrStrToArr(stdout);
            assert.equal(argv, "node");
            done();
        });
    });
});
