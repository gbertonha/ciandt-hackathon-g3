/*global firebase, document */
/*jslint browser:true */
"use strict";

/**
 * Reads data from Firestore and updates information
 * displayed on the dashboard
 * @param {String} sensor The sensor key.
 */

let state = {
  useful_data: {},
  isAirCon: true
};

function readData(sensor) {
  let db = firebase.firestore();
  db.collection(sensor).onSnapshot(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
      console.log(doc.data());
      state.useful_data[sensor] = doc.data().value;
      document.getElementById(sensor).innerText = doc.data().value;
      let today = new Date();
      let date =
        today.getFullYear() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getDate();
      let time =
        today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      let dateTime = date + " " + time;
      document.getElementById("last-update").innerText = dateTime;
    });
  });
}

function printMessage() {
  const in_temp = state.useful_data.temperature;
  const out_temp = state.useful_data["outside-temperature"];
  const diff = in_temp - out_temp;
  const message = document.getElementsByClassName("message")[0];
  const otherMessage = state.isAirCon
    ? "...and maybe turn off the aircon!"
    : "";
  if (diff > 3) {
    message.innerText =
      "The temperature is too high! Consider cooling." + otherMessage;
  } else if (diff < -3) {
    message.innerText = "The temperature is too low! Consider heating.";
  } else {
    message.innerText = "The temperature is fine. Turn off the AC if ON.";
  }
}

function processSensors(sensors) {
  sensors.forEach(sensor => {
    readData(sensor);
  });
}

let tempDiff = 0;
/**
 * Triggered once DOM is loaded.
 */
document.addEventListener("DOMContentLoaded", async () => {
  try {
    document.getElementById("aircon").classList.add("isOn");
    let sensors = [
      "data",
      "temperature",
      "pressure",
      "humidity",
      "outside-temperature"
    ];
    processSensors(sensors);
  } catch (e) {
    console.error(e);
  }
});

const airconControl = document.getElementsByClassName("airconControl")[0];

airconControl.addEventListener("click", () => {
  if (state.isAirCon) {
    state.isAirCon = false;
    document.getElementById("aircon").classList.add("isOff");
    document.getElementById("aircon").classList.remove("isOn");
  } else {
    state.isAirCon = true;
    document.getElementById("aircon").classList.toggle("isOn");
    document.getElementById("aircon").classList.remove("isOff");
  }
});

const checkDiff = document.getElementsByClassName("checkdiff")[0];
checkDiff.addEventListener("click", () => printMessage());
