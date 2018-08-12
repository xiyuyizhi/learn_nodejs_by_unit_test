const fs = require("fs");
const assert = require("assert");
const { execSync } = require("child_process");
const FILEPATH = "test/write.txt";

describe("#Stream", () => {
    beforeEach(() => {
        fs.openSync(FILEPATH, "w+");
    });
    afterEach(() => {
        fs.unlinkSync(FILEPATH);
    });
    it("test Writable stream reach highWaterMark", done => {
        const writer = fs.createWriteStream(FILEPATH);
        const highWaterMark = writer.writableHighWaterMark;
        const canWriteLinesBeforeReachHighWaterMark = Math.floor(
            highWaterMark / 19
        );
        let current = 0;
        let drainEmit = false;
        for (let i = 0; i < 1000; i++) {
            const rs = writer.write("一行十九字节\n");
            if (!rs) {
                current = i;
                break;
            }
        }
        assert.equal(canWriteLinesBeforeReachHighWaterMark, current);
        writer.on("drain", () => {
            drainEmit = true;
        });
        setTimeout(() => {
            assert.ok(drainEmit);
            done();
        }, 100);
    });
});
