document.addEventListener("DOMContentLoaded", function () {
    var timerRef = document.querySelector(".timer-display");
    var hourInput = document.getElementById("hourInput");
    var minuteInput = document.getElementById("minuteInput");
    var activeAlarms = document.querySelector(".activeAlarms");
    var setAlarm = document.getElementById("set");
    var alarmsArray = JSON.parse(localStorage.getItem("alarms") || "[]");
    var alarmIndex = alarmsArray.length > 0 ? alarmsArray[alarmsArray.length - 1].id : 0;
    var alarmSound = new Audio("./alarm-song.mp3");
    var initialHour = 0;
    var initialMinute = 0;
    var appendZero = function (value) {
        return value < 10 ? "0" + value : value.toString();
    };
    var searchObject = function (parameter, value) {
        var alarmObject = {
            id: 0,
            alarmHour: "",
            alarmMinute: "",
            isActive: false,
        };
        var objIndex = 0;
        var exists = false;
        alarmsArray.forEach(function (alarm, index) {
            if (alarm[parameter] === value) {
                exists = true;
                alarmObject = alarm;
                objIndex = index;
            }
        });
        return [exists, alarmObject, objIndex];
    };
    var displayTimer = function () {
        var date = new Date();
        var _a = [
            appendZero(date.getHours()),
            appendZero(date.getMinutes()),
            appendZero(date.getSeconds()),
        ], hours = _a[0], minutes = _a[1], seconds = _a[2];
        if (timerRef) {
            timerRef.innerHTML = [hours, minutes, seconds].join(":");
        }
        alarmsArray.forEach(function (alarm) {
            if (alarm.isActive &&
                "".concat(alarm.alarmHour, ":").concat(alarm.alarmMinute) === "".concat(hours, ":").concat(minutes)) {
                alarmSound.play();
            }
        });
    };
    var inputCheck = function (inputValue) {
        var value = parseInt(inputValue);
        if (value < 10) {
            value = +appendZero(value);
        }
        return value.toString();
    };
    hourInput === null || hourInput === void 0 ? void 0 : hourInput.addEventListener("input", function () {
        if (hourInput) {
            hourInput.value = inputCheck(hourInput.value);
        }
    });
    minuteInput === null || minuteInput === void 0 ? void 0 : minuteInput.addEventListener("input", function () {
        if (minuteInput) {
            minuteInput.value = inputCheck(minuteInput.value);
        }
    });
    var createAlarm = function (alarmObj) {
        var id = alarmObj.id, alarmHour = alarmObj.alarmHour, alarmMinute = alarmObj.alarmMinute;
        var alarmDiv = document.createElement("div");
        alarmDiv.classList.add("alarm");
        alarmDiv.setAttribute("data-id", id.toString());
        var alarmSpan = document.createElement("span");
        alarmSpan.innerText = "".concat(alarmHour, ":").concat(alarmMinute);
        alarmDiv.appendChild(alarmSpan);
        var checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        checkbox.checked = true;
        checkbox.addEventListener("click", function (e) {
            if (e.target instanceof HTMLInputElement) {
                if (e.target.checked) {
                    startAlarm(e);
                }
                else {
                    stopAlarm(e);
                }
            }
        });
        alarmDiv.appendChild(checkbox);
        var deleteButton = document.createElement("button");
        deleteButton.innerHTML = "Delete";
        deleteButton.classList.add("deleteButton");
        deleteButton.addEventListener("click", function (e) { return deleteAlarm(e); });
        alarmDiv.appendChild(deleteButton);
        var activeAlarms = document.querySelector(".activeAlarms");
        if (activeAlarms) {
            activeAlarms.appendChild(alarmDiv);
        }
    };
    var deleteAlarm = function (e) {
        var alarmDiv = e.target.closest(".alarm");
        if (!alarmDiv) {
            console.error("error alarmDiv");
            return;
        }
        var searchId = alarmDiv.getAttribute("data-id");
        if (!searchId) {
            console.error("error searchId");
            return;
        }
        var index = alarmsArray.findIndex(function (alarm) { return alarm.id === +searchId; });
        if (index === -1) {
            console.error("error index");
            return;
        }
        alarmsArray.splice(index, 1);
        saveAlarmsToLocalStorage();
        alarmDiv.remove();
    };
    var saveAlarmsToLocalStorage = function () {
        localStorage.setItem("alarms", JSON.stringify(alarmsArray));
    };
    setAlarm === null || setAlarm === void 0 ? void 0 : setAlarm.addEventListener("click", function () {
        if (!hourInput.value || !minuteInput.value) {
            console.error("Please set alarm completely!");
            hourInput.value = "00";
            minuteInput.value = "00";
            throw new Error("Please set alarm completely!");
        }
        if ((hourInput &&
            (parseInt(hourInput.value) > 23 || parseInt(hourInput.value) < 0)) ||
            (minuteInput &&
                (parseInt(minuteInput.value) > 59 || parseInt(minuteInput.value) < 0))) {
            alert("Please choose real minutes and/or hours!");
            hourInput.value = "00";
            minuteInput.value = "00";
            throw new Error("Please choose real minutes and/or hours!");
        }
        var exists = alarmsArray.some(function (alarm) {
            return alarm.alarmHour === hourInput.value &&
                alarm.alarmMinute === minuteInput.value;
        });
        if (exists) {
            alert("Alarm already exists!");
            throw new Error("Alarm already exists!");
        }
        alarmIndex += 1;
        var newId = alarmIndex;
        var alarmObj = {
            id: newId,
            alarmHour: (hourInput === null || hourInput === void 0 ? void 0 : hourInput.value) || "",
            alarmMinute: (minuteInput === null || minuteInput === void 0 ? void 0 : minuteInput.value) || "",
            isActive: true,
        };
        alarmObj.alarmHour = appendZero(+alarmObj.alarmHour);
        alarmObj.alarmMinute = appendZero(+alarmObj.alarmMinute);
        alarmsArray.push(alarmObj);
        alarmsArray.sort(function (a, b) {
            var timeA = parseInt(a.alarmHour) * 60 + parseInt(a.alarmMinute);
            var timeB = parseInt(b.alarmHour) * 60 + parseInt(b.alarmMinute);
            return timeA - timeB;
        });
        saveAlarmsToLocalStorage();
        createAlarm(alarmObj);
        // if (hourInput.value && minuteInput.value) {
        //   hourInput.value = appendZero(initialHour);
        //   minuteInput.value = appendZero(initialMinute);
        // }
    });
    var startAlarm = function (e) {
        var _a;
        var searchId = ((_a = e.target.parentElement) === null || _a === void 0 ? void 0 : _a.getAttribute("data-id")) || "";
        var _b = searchObject("id", searchId), exists = _b[0], obj = _b[1], index = _b[2];
        if (exists) {
            alarmsArray[+index].isActive = true;
            saveAlarmsToLocalStorage();
        }
    };
    var stopAlarm = function (e) {
        var _a;
        var searchId = ((_a = e.target.parentElement) === null || _a === void 0 ? void 0 : _a.getAttribute("data-id")) || "";
        var _b = searchObject("id", searchId), exists = _b[0], obj = _b[1], index = _b[2];
        if (exists) {
            alarmsArray[+index].isActive = false;
            alarmSound.pause();
            saveAlarmsToLocalStorage();
        }
    };
    hourInput === null || hourInput === void 0 ? void 0 : hourInput.addEventListener("input", function () { return (hourInput.value = inputCheck(hourInput.value)); });
    minuteInput === null || minuteInput === void 0 ? void 0 : minuteInput.addEventListener("input", function () { return (minuteInput.value = inputCheck(minuteInput.value)); });
    window.onload = function () {
        setInterval(displayTimer, 1000);
        alarmsArray = JSON.parse(localStorage.getItem("alarms") || "[]");
        if (alarmsArray.length > 0 && activeAlarms) {
            alarmsArray.forEach(function (alarm) {
                createAlarm(alarm);
            });
        }
        // if (hourInput.value && minuteInput.value) {
        //   hourInput.value = appendZero(initialHour);
        //   minuteInput.value = appendZero(initialMinute);
        // }
    };
});
