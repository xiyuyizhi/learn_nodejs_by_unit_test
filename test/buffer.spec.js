const assert = require('assert');

describe('#Buffer', () => {
  it('test Buffer implemenet Uint8Array', () => {
    const b = Buffer.alloc(1);
    b[0] = 3456;
    assert.equal(b.length, 1);
    assert.ok(b.buffer instanceof ArrayBuffer);
    assert.equal(b[0], new Uint8Array([3456])[0]); // 128

    const unit16 = new Uint16Array([5000, 4000]);
    const bb = Buffer.from(unit16.buffer);

    assert.equal(bb.length, 4);
    bb.swap16(); // <Buffer 13 88 0f a0>
    const hex_5000 = (5000).toString(16); //1388
    assert.equal(bb[0].toString(16) + bb[1].toString(16), hex_5000);
  });

  it('test Buffer.from(Array)', () => {
    const b = Buffer.from([0x61, 2, 0xff]);
    assert.equal(b.length, 3);
    assert.equal(b[0], 'a'.charCodeAt(0));
    assert.equal(b[1], 2);
    assert.equal(b[2], 0xff);
  });

  it('test Buffer.from(arrayBuffer)', () => {
    //Int8Array store number rang -128 ~ 127
    const int8Arr = new Int8Array(8);
    int8Arr[0] = 1;
    int8Arr[1] = 127;
    int8Arr[2] = 128;
    int8Arr[3] = -128;
    int8Arr[4] = -129;

    assert.equal(int8Arr[0], 1);
    assert.equal(int8Arr[1], 127);
    assert.equal(int8Arr[2], -128); //128的二进制表示 ‘1000 0000’, 在8位有符号整数中表示 -128
    assert.equal(int8Arr[3], -128);
    assert.equal(int8Arr[4], 127); // -129的二进制表示 源‘1 1000 0001’  返‘1 0111 1110’ 补‘1 0111 1111’
    // 补码第一位忽略 ‘0111 1111’，表示127

    const b = Buffer.from(int8Arr); // not shared memory,copy
    const c = Buffer.from(int8Arr.buffer); //shared memory

    assert.equal(b[0], 1);
    assert.equal(b[1], 127);
    assert.equal(b[2], 128); //上面是有符号，这里是无符号 128  因为 Buffer内部实现的是Uint8Array
    assert.equal(b[4], 127);

    int8Arr[0] = 100;
    assert.equal(int8Arr[0], 100);
    assert.equal(b[0], 1);
    assert.equal(c[0], int8Arr[0]);
    assert.equal(c[0], 100);
  });

  it('test Buffer.from(arrayBuffer), byteOffset', () => {
    const int8Arr = new Int8Array(8);
    int8Arr[0] = 100;
    int8Arr[1] = 101;
    int8Arr[2] = 102;
    const b = Buffer.from(int8Arr.buffer, 1, 3);
    assert.equal(b.length, 3);
    assert.equal(b[0], 101);
    assert.equal(b[1], 102);
    assert.equal(b[2], 0);
  });

  it('test Buffer.from(string)', () => {
    const b = Buffer.from('123');
    assert.equal(b[0].toString(16), 31);
    assert.equal(b[1], 50);
    assert.equal(b.length, 3);

    //汉子占三个字节
    const c = Buffer.from('哈');
    assert.equal(c.length, 3);
  });
  it('test Buffer.from(buffer)', () => {
    const int16Arr = new Int16Array(16);

    int16Arr.forEach((x, index) => {
      int16Arr[index] = index;
    });

    const b = Buffer.from(int16Arr); // Copies the passed buffer data
    const b_buffer = Buffer.from(int16Arr.buffer); // the newly created Buffer will share the same allocated memory
    assert.equal(int16Arr.length, 16);
    assert.equal(int16Arr.byteLength, 32);
    assert.equal(b.length, 16);
    assert.equal(b_buffer.length, 32);
    int16Arr[0] = 100;

    assert.equal(b[0], 0); // not shared memory
    assert.equal(b_buffer[0], 100); // shard memory with int16Arr
    assert.equal(b_buffer[1], 0); // 两个字节表示int16Arr中的一个元素
    assert.equal(b_buffer[2], 1);
  });

  it('test create new TypedArray with Buffer args', () => {
    const buffer = Buffer.from([1, 2, 3, 4]);
    assert.equal(buffer.length, 4);

    const int32Arr = new Int32Array(buffer);
    assert.equal(int32Arr.length, 4);
    assert.equal(int32Arr.byteLength, 16);
    assert.equal(int32Arr.buffer.byteLength, 16);
  });
});
