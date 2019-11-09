/*global firebase, document */
/*jslint browser:true */
"use strict";

/**
 * Reads data from Firestore and updates information
 * displayed on the dashboard
 * @param {String} sensor The sensor key.
 */

const useful_data = {};

function readData(sensor) {
  let db = firebase.firestore();
  db.collection(sensor).onSnapshot(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
      console.log("I AM DOC", doc.data());
      console.log(document.getElementById(sensor));
      document.getElementById(sensor).innerText = doc.data().value;
      useful_data[sensor] = doc.data().value;
      var today = new Date();
      var date =
        today.getFullYear() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getDate();
      var time =
        today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var dateTime = date + " " + time;
      document.getElementById("last-update").innerText = dateTime;
    });
  });
}

/**
 * Triggered once DOM is loaded.
 */
document.addEventListener("DOMContentLoaded", function() {
  try {
    let sensors = [
      "temperature",
      "pressure",
      "humidity",
      "outside-temperature"
    ];
    sensors.forEach(function(sensor) {
      console.log("forEach", sensor);
      readData(sensor);
    });
  } catch (e) {
    console.error(e);
  }
});

document.getElementsByClassName("get-my-ip")[0];

document.addEventListener("click", async () => {
  try {
    const result = await axios({
      method: "get",
      url: "https://api.ipify.org?format=json"
    });
  } catch (e) {
    console.log("error!", e);
  }
  console.log(result);
});
