/*
  hand pose detection
  
  https://ml5js.org/
  
  This example uses the hand as an synth oscillator

*/

let synth;
let lfilter;
let playing, note;
let isPressed = false;
let trigger = false;
let filterFreq = 100;

let video,
    handpose,
    hand; 

function setup() {
  createCanvas(640, 480);
  textSize(18);

  //add the button that allows the browser to play sound
  addGUI();
  

  video = createCapture(VIDEO);
  video.hide();
  handpose = ml5.handpose(video, modelReady);

  //synth settings
  playing = false;

  lfilter = new Tone.Filter({
    frequency: filterFreq,
    type: 'lowpass',
    rolloff: -48
  }).toDestination();
  
  synth = new Tone.Synth({
    volume: -6
  }).connect(lfilter);
  
  
  const reverb = new Tone.Reverb({
    wet: 0.5,
    decay: 5
  }).toDestination();
  
  lfilter.connect(reverb);
}

function draw() {
  background(0)
  // if we have the video access yet, draw it
  if (video) {
    //image(video, 0, 0);
  }

  drawHand();

  if (playing) {
    //if synth is playing

    //change note
    synth.setNote(note, 0.1);
    // ramp to filter gradually
    lfilter.frequency.rampTo(filterFreq, 0.2);

  }
}

function modelReady() {
  handpose.on('predict', gotPose);
}

function gotPose(results) {
  hand = results;
};

function drawHand() {

  push(); 
  noStroke();
  fill(255,0,0);

  // if we have any hand detected, draw it
  if (hand && hand.length > 0) {

    let landmarks = hand[0].landmarks;
   
    // for (let i = 0; i < landmarks.length; i++) {
    //   let [x, y, z] = landmarks[i];
    //   ellipse(x, y, 7);
    //   text(i, x, y);
    // }

    //set note to follow yAxis
    //console.log(landmarks[12])
    let yAxis = landmarks[12][1]
    let xAxis = landmarks[12][0]


    let xValue = map(xAxis, 0, 640, 640, 0);
    //console.log(xValue)

    ellipse(xValue, yAxis, 10);
    //text(12, xAxis, yAxis);
    //map the yAxis to frequency
    note = constrain(map(yAxis, 0, 400, 600, 50), 50, 800);
    //map the filter to the x axis
    filterFreq = map(xAxis, 0, width, 100, 3000);

    //extra function so the synth only triggers once.
    if (!trigger) {
    playSynth();
    trigger = true;
    }
    
  } else if (hand && hand.length <= 0 && playing == true) {
    //stop playing if hand is inactive, and fade out
    synth.triggerRelease("+0.2")
    playing = false;
    trigger = false;
  }

  pop();
}

//play the synth function
function playSynth() {
  synth.triggerAttack(note, 0.3);
  playing = true;
}

function addGUI() {
  //most browsers require a user action to initiate sound
  button = createButton("allow sound")
  button.addClass("button");
  button.position(2, height);
  button.mousePressed(bPress);

}

//button function
function bPress() {
  console.log('button pressed')
  if (isPressed) {
    isPressed = false;
    button.html("allow sound");
    Tone.Transport.stop();
    //button.removeClass("inactive");
  } else {
    isPressed = true;
    button.html("stop sound");
    Tone.Transport.start();
  }
}

