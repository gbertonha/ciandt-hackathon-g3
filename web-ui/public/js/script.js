/*global firebase, document */
/*jslint browser:true */
"use strict";
import axios from "axios";

/**
 * Reads data from Firestore and updates information
 * displayed on the dashboard
 * @param {String} sensor The sensor key.
 */
function readData(sensor) {
  let db = firebase.firestore();
  db.collection(sensor).onSnapshot(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
      document.getElementById(sensor).innerText = doc.data().value;
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
    let sensors = ["temperature", "humidity", "pressure"];
    sensors.forEach(function(sensor) {
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
