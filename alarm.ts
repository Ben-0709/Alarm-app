document.addEventListener("DOMContentLoaded", () => {
  const timerRef: HTMLDivElement | null =
    document.querySelector(".timer-display");
  const hourInput: HTMLInputElement | null = document.getElementById(
    "hourInput"
  ) as HTMLInputElement;
  const minuteInput: HTMLInputElement | null = document.getElementById(
    "minuteInput"
  ) as HTMLInputElement;
  const activeAlarms: HTMLDivElement | null =
    document.querySelector(".activeAlarms");
  const setAlarm = document.getElementById("set") as HTMLButtonElement | null;

  interface Alarm {
    id: number;
    alarmHour: string;
    alarmMinute: string;
    isActive: boolean;
  }

  let alarmsArray: Alarm[] = JSON.parse(localStorage.getItem("alarms") || "[]");

  let alarmIndex: number =
    alarmsArray.length > 0 ? alarmsArray[alarmsArray.length - 1].id : 0;

  const alarmSound: HTMLAudioElement = new Audio("./alarm-song.mp3");

  const appendZero = (value: number): string =>
    value < 10 ? "0" + value : value.toString();

  const searchObject = (
    parameter: keyof (typeof alarmsArray)[0],
    value: string
  ) => {
    let alarmObject: Alarm = {
      id: 0,
      alarmHour: "",
      alarmMinute: "",
      isActive: false,
    };
    let objIndex = 0;
    let exists = false;
    alarmsArray.forEach((alarm, index) => {
      if (alarm[parameter] === value) {
        exists = true;
        alarmObject = alarm;
        objIndex = index;
      }
    });
    return [exists, alarmObject, objIndex] as const;
  };

  const displayTimer = () => {
    const date = new Date();
    const [hours, minutes, seconds] = [
      appendZero(date.getHours()),
      appendZero(date.getMinutes()),
      appendZero(date.getSeconds()),
    ];

    if (timerRef) {
      timerRef.innerHTML = [hours, minutes, seconds].join(":");
    }

    alarmsArray.forEach((alarm) => {
      if (
        alarm.isActive &&
        `${alarm.alarmHour}:${alarm.alarmMinute}` === `${hours}:${minutes}`
      ) {
        alarmSound.play();
      }
    });
  };

  const inputCheck = (inputValue: string): string => {
    let value = parseInt(inputValue) as number;
    if (value < 10) {
      value = +appendZero(value);
    }

    return value.toString();
  };

  hourInput?.addEventListener("input", () => {
    if (hourInput) {
      hourInput.value = inputCheck(hourInput.value);
    }
  });

  minuteInput?.addEventListener("input", () => {
    if (minuteInput) {
      minuteInput.value = inputCheck(minuteInput.value);
    }
  });

  const createAlarm = (alarmObj: Alarm) => {
    const { id, alarmHour, alarmMinute } = alarmObj;

    const alarmDiv = document.createElement("div");
    alarmDiv.classList.add("alarm");
    alarmDiv.setAttribute("data-id", id.toString());

    const alarmSpan = document.createElement("span");
    alarmSpan.innerText = `${alarmHour}:${alarmMinute}`;
    alarmDiv.appendChild(alarmSpan);

    const checkbox = document.createElement("input");
    checkbox.setAttribute("type", "checkbox");
    checkbox.checked = true;
    checkbox.addEventListener("click", (e) => {
      if (e.target instanceof HTMLInputElement) {
        if (e.target.checked) {
          startAlarm(e);
        } else {
          stopAlarm(e);
        }
      }
    });

    alarmDiv.appendChild(checkbox);

    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = `Delete`;
    deleteButton.classList.add("deleteButton");
    deleteButton.addEventListener("click", (e) => deleteAlarm(e));
    alarmDiv.appendChild(deleteButton);

    const activeAlarms = document.querySelector(".activeAlarms");
    if (activeAlarms) {
      activeAlarms.appendChild(alarmDiv);
    }
  };

  const deleteAlarm = (e: MouseEvent) => {
    const alarmDiv = (e.target as HTMLElement).closest(".alarm");
    if (!alarmDiv) {
      console.error("error alarmDiv");
      return;
    }

    const searchId = alarmDiv.getAttribute("data-id");
    if (!searchId) {
      console.error("error searchId");
      return;
    }

    const index = alarmsArray.findIndex((alarm) => alarm.id === +searchId);
    if (index === -1) {
      console.error("error index");
      return;
    }

    alarmsArray.splice(index, 1);
    saveAlarmsToLocalStorage();
    alarmDiv.remove();
  };

  const saveAlarmsToLocalStorage = () => {
    localStorage.setItem("alarms", JSON.stringify(alarmsArray));
  };

  setAlarm?.addEventListener("click", () => {
    if (!hourInput.value || !minuteInput.value) {
      console.error("Please set alarm completely!");
      hourInput.value = "00";
      minuteInput.value = "00";
      throw new Error("Please set alarm completely!");
    }
    if (
      (hourInput &&
        (parseInt(hourInput.value) > 23 || parseInt(hourInput.value) < 0)) ||
      (minuteInput &&
        (parseInt(minuteInput.value) > 59 || parseInt(minuteInput.value) < 0))
    ) {
      alert("Please choose real minutes and/or hours!");
      hourInput.value = "00";
      minuteInput.value = "00";
      throw new Error("Please choose real minutes and/or hours!");
    }

    const exists = alarmsArray.some(
      (alarm) =>
        alarm.alarmHour === hourInput.value &&
        alarm.alarmMinute === minuteInput.value
    );
    if (exists) {
      alert("Alarm already exists!");
      throw new Error("Alarm already exists!");
    }

    alarmIndex += 1;
    const newId = alarmIndex;

    const alarmObj = {
      id: newId,
      alarmHour: hourInput?.value || "",
      alarmMinute: minuteInput?.value || "",
      isActive: true,
    };
    alarmObj.alarmHour = appendZero(+alarmObj.alarmHour);
    alarmObj.alarmMinute = appendZero(+alarmObj.alarmMinute);
    alarmsArray.push(alarmObj);

    alarmsArray.sort((a, b) => {
      const timeA = parseInt(a.alarmHour) * 60 + parseInt(a.alarmMinute);
      const timeB = parseInt(b.alarmHour) * 60 + parseInt(b.alarmMinute);
      return timeA - timeB;
    });

    saveAlarmsToLocalStorage();
    createAlarm(alarmObj);
  });

  const startAlarm = (e: MouseEvent) => {
    let searchId =
      (e.target as HTMLElement).parentElement?.getAttribute("data-id") || "";
    let [exists, obj, index] = searchObject("id", searchId);
    if (exists) {
      alarmsArray[+index].isActive = true;
      saveAlarmsToLocalStorage();
    }
  };

  const stopAlarm = (e: MouseEvent) => {
    let searchId =
      (e.target as HTMLElement).parentElement?.getAttribute("data-id") || "";
    let [exists, obj, index] = searchObject("id", searchId);
    if (exists) {
      alarmsArray[+index].isActive = false;
      alarmSound.pause();
      saveAlarmsToLocalStorage();
    }
  };

  hourInput?.addEventListener(
    "input",
    () => (hourInput.value = inputCheck(hourInput.value))
  );
  minuteInput?.addEventListener(
    "input",
    () => (minuteInput.value = inputCheck(minuteInput.value))
  );

  window.onload = () => {
    setInterval(displayTimer, 1000);

    alarmsArray = JSON.parse(localStorage.getItem("alarms") || "[]");
    if (alarmsArray.length > 0 && activeAlarms) {
      alarmsArray.forEach((alarm) => {
        createAlarm(alarm);
      });
    }
  };
});
