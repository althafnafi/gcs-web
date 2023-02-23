// Connect to ROS
var ros = new ROSLIB.Ros({
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

/* Publisher */
var dataPub = new ROSLIB.Topic({
  ros: ros,
  name: "/pub_data",
  messageType: "std_msgs/UInt8",
});

var dataToPub = new ROSLIB.Message({
  data: 100,
});

dataPub.publish(dataToPub);
console.log(dataToPub.data);

/* Subscriber */
var joySub = new ROSLIB.Topic({
  ros: ros,
  name: "/joy",
  messageType: "sensor_msgs/Joy",
});

joySub.subscribe((msg) => {
  console.log(`Received message on ${joySub.name}: ${msg.buttons[0]}`);
  dataToPub.data = msg.buttons;
  // joySub.unsubscribe();
});
