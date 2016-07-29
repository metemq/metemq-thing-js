"use strict";
function genMsgId(len) {
    var a = "";
    len = len || 8;
    for (var i = 0; i < len; i++)
        a = a + genChar();
    return a;
}
exports.genMsgId = genMsgId;
function genChar() {
    var a = Math.floor(Math.random() * 62);
    if (a < 10)
        a += 48;
    else if (a < 36)
        a += 55;
    else
        a += 61;
    return String.fromCharCode(a);
}
