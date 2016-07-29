"use strict";
/**
 * Parse comma-separated string, and returns array of values.
 * Accepted types of values are string or number.
 * @param csvString comma-separated string
 * @returns         Array of values
 */
function parseCSV(csvString) {
    // return empty array for empty string
    if (!csvString.trim())
        return [];
    var params = csvString.trim().split(',');
    var ret = [];
    for (var _i = 0, params_1 = params; _i < params_1.length; _i++) {
        var param = params_1[_i];
        var parsed = parseFloat(param);
        // If param is string, then parsed is NaN
        if (isNaN(parsed)) {
            var str = param.trim(); // string parameter
            if (str)
                ret.push(str); // string is not empty
            else
                ret.push(undefined); // string is empty
        }
        else
            ret.push(parsed); // number parameter
    }
    return ret;
}
exports.parseCSV = parseCSV;
/**
 * Make comma-separated string from array.
 * @param values  Array of values
 * @returns       comma-separated string
 */
function mkString(values) {
    var csvString = '';
    for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
        var val = values_1[_i];
        if (typeof val === 'string')
            csvString += ',' + val.trim();
        else if (typeof val === 'number')
            csvString += ',' + val.toString();
    }
    // Remove first comma (e.g. if csvString = ',1,two', then '1,two')
    // If csvString is empty string, then it is still empty string
    csvString = csvString.slice(1, csvString.length);
    return csvString;
}
exports.mkString = mkString;
