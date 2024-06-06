/**
 * 处理坐标，经纬度数据对调(建个新的，不要直接修改经纬度，图形可能会自动调整经纬度而导致出问题)
 */
function processCoord(coord) {
    var newCoord = [];
    for (var i = 0; i < coord.length; i++) {
        newCoord.push([]);
        for (var j = 0; j < coord[i].length; j++) {
            newCoord[i].push([coord[i][j][1], coord[i][j][0]]);
        }
    }
    return newCoord;
}

/**
 * 函数防抖
 */
function createDebounce(waitTime) {
    let timeout;

    return (func) => {
        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            timeout = undefined;
            func();
        }, waitTime || 500);
    };
}

/**
 * 判断字符串是否为空
 */
function isEmptyString(str) {
    if (str == null || str == undefined) {
        return true;
    } else {
        if (str.trim().length == 0) {
            return true;
        } else {
            return false;
        }
    }
}

/**
 * 判断字符串是否不为空
 */
function isNotEmptyString(str) {
    if (str == null || str == undefined) {
        return false;
    } else {
        if (str.trim().length == 0) {
            return false;
        } else {
            return true;
        }
    }
}

/**
 * 获取url参数
 */
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return (undefined);
}

export { processCoord, createDebounce, isEmptyString, isNotEmptyString, getQueryVariable }
