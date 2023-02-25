// Connect to ROS
let ros = new ROSLIB.Ros({
  url: "ws://localhost:9090",
});

ros.on("connection", () => {
  console.log("Connected to websocket server.");
});

ros.on("error", () => {
  console.log("Error connecting to websocket server: ", error);
});

ros.on("close", () => {
  console.log("Connection to websocket server closed.");
});

/* HTML element declaration */
let is_pressed_el = document.querySelector("#is-pressed");

/* Publisher */
let dataPub = new ROSLIB.Topic({
  ros: ros,
  name: "/pub_data",
  messageType: "std_msgs/UInt8",
});

let dataToPub = new ROSLIB.Message({
  data: -1,
});

setInterval(() => {
  dataPub.publish(dataToPub);
  console.log(`Publishing...`);
  updateElements();
}, 50);
console.log(dataToPub.data);

let updateElements = () => {
  /* Update Elements*/
  is_pressed_el.innerHTML =
    dataToPub.data === 1 ? "Pressed!" : "Not pressed :(";
  is_pressed_el.style.backgroundColor = dataToPub.data === 1 ? "lime" : "pink";
};

let joyData = new ROSLIB.Message({
  header: null,
  axes: null,
  buttons: null,
});

/* Subscriber */
let joySub = new ROSLIB.Topic({
  ros: ros,
  name: "/joy",
  messageType: "sensor_msgs/Joy",
});

joySub.subscribe((msg) => {
  console.log(`Received message on ${joySub.name}: ${msg.buttons[0]}`);
  joyData = msg;
  dataToPub.data = msg.buttons[0];
  console.log(joyData);
  // console.log(`dataToPub: ${dataToPub.data}`);
});

let imageTopic = new ROSLIB.Topic({
  ros: ros,
  name: "/camera/stream/compressed",
  messageType: "sensor_msgs/CompressedImage",
});

imageTopic.subscribe((msg) => {
  document.getElementById("img-1").src = "data:image/jpg;base64," + msg.data;
  document.getElementById("img-fs").src = "data:image/jpg;base64," + msg.data;
});
