import * as _ from 'underscore';

/**
 * Generate a random Message-ID
 * (default value of len: 8)
 */
export function genMsgId(len?: number): string {
  let a = "";
  len = len || 8;

  for (let i=0; i<len; i++)
    a = a + genChar();

  return a;
}

/**
 * Generate a random Character (0~9, a~z, A~Z)
 */
function genChar(): string {
  let a = Math.floor(Math.random()*62);

  if      (a<10) a +=48; // 0 ~ 9 => 48~57  ('0'~'9')
  else if (a<36) a +=55; // 10~35 => 65~90  ('A'~'Z')
  else           a +=61; // 36~61 => 97~122 ('a'~'z')

  return String.fromCharCode(a);
}

/**
 * Parse comma-separated string, and returns array of values.
 * Accepted types of values are string or number.
 * @param csvString comma-separated string
 * @returns         Array of values
 */
export function parseCSV(csvString: string): Array<string | number> {
    // return empty array for empty string
    if (!csvString.trim())
        return [];

    let params: string[] = csvString.trim().split(',');
    let ret: Array<string | number> = [];

    for (let param of params) {
        let parsed = parseFloat(param);
        // If param is string, then parsed is NaN
        if (isNaN(parsed)) {
            let str = param.trim();   // string parameter
            if (str) ret.push(str);   // string is not empty
            else ret.push(undefined); // string is empty
        }
        // If parsed is not NaN, it is number
        else
            ret.push(parsed);   // number parameter
    }

    return ret;
}

export function parseValue(csvString): number | string | Array<string | number> {
    let arr = parseCSV(csvString);
    if (arr.length === 0) return undefined;
    if (arr.length === 1) return arr[0];
    return arr;
}

/**
 * Make comma-separated string from array.
 * @param values  Array of values
 * @returns       comma-separated string
 */
export function mkString(values: any): string {

    // Return empty string if it does not contain a value
    if (!values) return '';

    if (typeof values === 'string')
        return values;
    if (typeof values === 'number')
        return values.toString();

    if (_.isArray(values)) {
        let csvString = '';

        for (let val of values) {
            if (typeof val === 'string')
                csvString += ',' + val.trim();
            else if (typeof val === 'number')
                csvString += ',' + val.toString();
            else throw new Error('Arguments for mkString() should be string, number, or Array of string & number');
        }

        // Remove first comma (e.g. if csvString = ',1,two', then '1,two')
        // If csvString is empty string, then it is still empty string
        csvString = csvString.slice(1, csvString.length);

        return csvString;
    }

    // Throw exception if it does not match with any case above
    throw new Error('Arguments for mkString() should be string, number, or Array of string & number');
}
