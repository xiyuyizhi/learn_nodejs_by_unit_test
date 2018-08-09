switch (process.argv[2]) {
    case "signal":
        signal();
        break;
    case "killChild":
        killChild();
        break;
    case "notEmitWhenHaveMessage":
        notEmitWhenHaveMessage();
        break;
    case "silent":
        silent();
        break;
    case "options_stdio":
        options_stdio();
        break;
}

function signal() {
    process.send(process.pid);
}

function killChild() {
    const timer = setInterval(() => {}, 300);

    process.on("SIGTERM", () => {
        // process.exit();
        clearInterval(timer);
    });
}
function notEmitWhenHaveMessage() {
    const timer = setInterval(() => {}, 300);
    process.on("SIGTERM", () => {
        process.exit();
        // clearInterval(timer); // not effect
    });
    process.on("message", msg => {
        clearInterval(timer); // not effect
    });
}

function silent() {
    console.log("log_to_parent_not_to_terminal");
}

function options_stdio() {
    throw new Error("error");
}
