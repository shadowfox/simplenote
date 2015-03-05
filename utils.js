/* Misc utilities */

// Returns a timestamp of the current time in the format YYYY-MM-DD HH:MM:SS
if (typeof Date.prototype.getTimestamp != 'function') {
    Date.prototype.getTimestamp = function() {
        var dateInfo = [this.getFullYear(), this.getMonth() + 1, this.getDate()];
        var timeInfo = [this.getHours(), this.getMinutes(), this.getSeconds()];

        // Append zeros if needed (eg. 9 becomes 09)
        for (var i = 0; i < 3; i++) {
            if (dateInfo[i] < 10) {
                dateInfo[i] = "0" + dateInfo[i];
            }
            if (timeInfo[i] < 10) {
                timeInfo[i] = "0" + timeInfo[i];
            }
        }

        return dateInfo.join("-") + " " + timeInfo.join(":");
    };
}

if (typeof String.prototype.truncate != 'function') {
    String.prototype.truncate = function(maxLength) {
        if (this.length > maxLength) {
            return this.substr(0, maxLength) + '...';
        }
        return this;
    };
}

if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function(str) {
        return this.slice(0, str.length) == str;
    };
}

if (typeof String.prototype.endsWith != 'function') {
    String.prototype.endsWith = function(str) {
        return this.slice(-str.length) == str;
    };
}

// String format from http://stackoverflow.com/a/4673436
if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) { 
            return typeof args[number] != 'undefined'
                ? args[number]
                : match;
        });
    };
}

// Generate a summary from the first line of a note, up to 40 characters
function noteSummary(content) {
    content = content.split('\n')[0];
    if (content == '' || content == '\n') {
        return "&nbsp;";
    }
    return content.truncate(40);
}

// IE does not know about the target attribute. It looks for srcElement
// This function will get the event target in a browser-compatible way
// See: http://stackoverflow.com/a/5116987
function getEventTarget(e) {
    e = e || window.event;
    return e.target || e.srcElement; 
}