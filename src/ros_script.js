const topBar = document.querySelector("#is-pressed");
// Connect to ROS
let ros = new ROSLIB.Ros({
  url: "ws://localhost:9090",
});

ros.on("connection", () => {
  console.log("Connected to websocket server.");
  topBar.classList.remove("bg-error");
  topBar.classList.add("bg-success");
  topBar.textContent = "Already connected to ROS :)";
});

ros.on("error", () => {
  console.log("Error connecting to websocket server: ", error);
});

ros.on("close", () => {
  console.log("Connection to websocket server closed.");
  topBar.classList.remove("bg-success");
  topBar.classList.add("bg-error");
  topBar.textContent = "Currently not connected to ROS... Please refresh!";
});

/* FUNCTIONS */
let getCamObj = () => {
  return {
    brightness: 20,
    gamma: 10,
    brightness_val_el: null,
    gamma_val_el: null,
    gamma_slider_el: null,
  };
};

let cur_state = {
  gripper: 0,
  killswitch: 1,
  joy: 0,
};

const cam0 = getCamObj();
cam0.brightness_val_el = document.querySelector("cam0-brightness");
cam0.gamma_val_el = document.querySelector("#cam0-gamma");
cam0.gamma_slider_el = document.querySelector("#cam0-gamma-slider");

const cam1 = getCamObj();

const updateState = () => {
  const gripper_color = document.querySelector("#gripper-state-color");
  const ks_color = document.querySelector("#ks-state-color");
  const joy_color = document.querySelector("#other-state-color");

  // cur_state.joy = joy;
  // cur_state.killswitch = killswitch;
  // cur_state.gripper = gripper;

  // Change color of gripper
  if (cur_state.gripper == 1) {
    gripper_color.classList.add("bg-success");
    gripper_color.classList.remove("bg-error");
  } else if (cur_state.gripper == 0) {
    gripper_color.classList.add("bg-error");
    gripper_color.classList.remove("bg-success");
  }

  // Change color of killswitch
  if (cur_state.killswitch == "on") {
    ks_color.classList.add("bg-success");
    ks_color.classList.remove("bg-error");
    ks_color.classList.remove("bg-info");
  } else if (cur_state.killswitch == "hw") {
    ks_color.classList.add("bg-info");
    ks_color.classList.remove("bg-success");
    ks_color.classList.remove("bg-error");
  } else if (cur_state.killswitch == "off") {
    ks_color.classList.add("bg-error");
    ks_color.classList.remove("bg-success");
    ks_color.classList.remove("bg-info");
  }

  // Change color of joy
  if (cur_state.joy == 1) {
    joy_color.classList.add("bg-success");
    joy_color.classList.remove("bg-error");
  } else if (cur_state.joy == 0) {
    joy_color.classList.add("bg-error");
    joy_color.classList.remove("bg-success");
  }
};

let updateStateColor = function (e) {
  const state_color = document.querySelector("#other-state-color");

  if (e.value == 1 || this.value == 1) {
    state_color.classList.add("bg-success");
    state_color.classList.remove("bg-error");
    dataToPub.data = 1;
  } else if (e.value == 0 || this.value == 0) {
    state_color.classList.add("bg-error");
    state_color.classList.remove("bg-success");
    dataToPub.data = 0;
  }
};

const other_btns = document.querySelectorAll("input[name='other-radio']");
for (const radioButton of other_btns) {
  radioButton.addEventListener("change", updateStateColor);
}
/* HTML element declaration */
let is_pressed_el = document.querySelector("#is-pressed");

/* Publisher */
let dataPub = new ROSLIB.Topic({
  ros: ros,
  name: "/pub_data",
  messageType: "std_msgs/UInt8",
});

let dataToPub = new ROSLIB.Message({
  data: 0,
});

setInterval(() => {
  dataPub.publish(dataToPub);
  // console.log(`Publishing...`);
  updateElements();
}, 50);
// console.log(dataToPub.data);

let gammaData = new ROSLIB.Message({
  data: null,
});

let gammaPub = new ROSLIB.Topic({
  ros: ros,
  name: "/cam0/gamma",
  messageType: "std_msgs/Int16",
});

setInterval(() => {
  cam0.gamma = parseInt(cam0.gamma_slider_el.value);
  gammaData.data = cam0.gamma;
  gammaPub.publish(gammaData);
}, 200);

let updateElements = () => {
  /* Update Elements*/

  // Cam0
  cam0.gamma_val_el.textContent = cam0.gamma_slider_el.value;

  if (dataToPub.data === 1) {
    document.querySelector("#other-on").checked = true;
    updateStateColor(document.querySelector("#other-on"));
  } else {
    document.querySelector("#other-off").checked = true;
    updateStateColor(document.querySelector("#other-off"));
  }
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
  // console.log(`Received message on ${joySub.name}: ${msg.buttons[0]}`);

  if (msg.buttons[1] == 1) {
    cam0.gamma_slider_el.value = parseInt(cam0.gamma_slider_el.value) + 1;
  }
  if (msg.buttons[2] == 1) {
    cam0.gamma_slider_el.value = parseInt(cam0.gamma_slider_el.value) - 1;
  }

  if (msg.buttons[0] == 1) {
    dataToPub.data = dataToPub.data == 1 ? 0 : 1;
    console.log(`dataToPub: ${dataToPub.data}`);
  }
  joyData = msg;
});

// const other_on_btn = document.querySelector("#other-on");
// other_on_btn.addEventListener("change", function (e) {
//   console.log("pressed!");
//   if (this.checked) console.log(this.value);
//   else console.log("unchecked!");
// });
// const states = document.querySelector("#other-on");
// const other_stt_rads = document.querySelectorAll("input[name='other-radio']");

// other_stt.addEventListener("change", () => {
//   const color_stt = document.querySelector("#other-state-color");
//   if (document.querySelector("input[name='other-radio']:checked").value == 1) {
//     color_stt.classList.add("bg-success");
//     color_stt.classList.remove("bg-error");
//   } else {
//     color_stt.classList.add("bg-error");
//     color_stt.classList.remove("bg-success");
//   }
// });

let imageTopic = new ROSLIB.Topic({
  ros: ros,
  name: "/camera/stream/compressed",
  messageType: "sensor_msgs/CompressedImage",
});

imageTopic.subscribe((msg) => {
  document.getElementById("img-1").src = "data:image/jpg;base64," + msg.data;
  document.getElementById("img-fs").src = "data:image/jpg;base64," + msg.data;
});
