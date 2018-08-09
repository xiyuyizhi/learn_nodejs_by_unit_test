const path = require("path");
const { spawn, exec } = require("child_process");
const DIRNAME = path.resolve(__dirname, "../src");

const translateArrStrToArr = str => {
    str = str.replace(/[\[\] ']/g, ""); // 替换 [ ] ' ' '
    return str.split(/[\n,]/).filter(x => !!x);
};

exports.translateArrStrToArr = translateArrStrToArr;

exports.resolvePath = shellName => {
    return path.resolve(__dirname, "../src", shellName);
};

exports.execShell = (argvs = [], preArgs, callback) => {
    const [shellName, ...rest] = argvs;
    let params = ["node", path.join(DIRNAME, shellName), ...rest];
    if (Array.isArray(preArgs)) {
        params = [...preArgs, ...params];
    } else {
        callback = preArgs;
    }
    const shellCommand = params.join(" ");
    exec(shellCommand, (err, stdout, stderr) => {
        let argv = translateArrStrToArr(stdout);
        callback(argv, stderr, err);
    });
};
