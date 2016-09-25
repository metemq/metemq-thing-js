import * as _ from 'underscore';

/**
 * Generate a random Message-ID
 * (default value of len: 8)
 */
export function genMsgId(len?: number): string {
    let a = "";
    len = len || 8;

    for (let i = 0; i < len; i++)
        a = a + genChar();

    return a;
}

/**
 * Generate a random Character (0~9, a~z, A~Z)
 */
function genChar(): string {
    let a = Math.floor(Math.random() * 62);

    if (a < 10) a += 48; // 0 ~ 9 => 48~57  ('0'~'9')
    else if (a < 36) a += 55; // 10~35 => 65~90  ('A'~'Z')
    else a += 61; // 36~61 => 97~122 ('a'~'z')

    return String.fromCharCode(a);
}

/**
 * Parse comma-separated string, and returns array of values.
 * Accepted types of values are string or number.
 * @param csvString comma-separated string
 * @returns         Array of values
 */
export function parseJSON(jsonString: string): undefined | number | string | Array<string | number> {
    // return empty array if string is empty
    if (!jsonString.trim()) return undefined;

    let ret;

    try {
        ret = JSON.parse(jsonString);
    } catch (e) {
        throw new Error(`Cannot parse JSON string! which is ${jsonString}`);
    }

    return ret;

    // function checkArrayType(arr: any[]) {
    //     if (!_.isArray(arr)) return false;
    //     for (let val of arr) {
    //
    //     }
    // }
}

// export function parseValue(jsonString): number | string | Array<string | number> {
//     let arr = parseJSON(jsonString);
//     if (arr.length === 0) return undefined;
//     if (arr.length === 1) return arr[0];
//     return arr;
// }

/**
 * Make comma-separated string from array.
 * @param values  Array of values
 * @returns       comma-separated string
 */
export function stringifyJSON(obj: any): string {

    if (typeof obj === 'number') return String(obj);

    // Return undefined if it does not contain a value
    if (!obj) return undefined;

    let str;

    try {
        str = JSON.stringify(obj);
    } catch (e) {
        throw new Error(`Cannot stringify JSON! which is ${obj}`);
    }

    return str;
}
