import './App.css';
import * as ml5 from 'ml5';
import Webcam from 'react-webcam';
import React, {useRef, useEffect, useState } from 'react';

const posibilities = ['l','d','y','<3']

function App() {

  const videoRef = useRef();
  const questionRef = useRef();
  const [currentLetter, setCurrentLetter] = useState('a');
  const [prevLetter, setPrevLetter] = useState('');
  const [menu, setMenu] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [delay, setDelay] = useState(false);
  const [finished, setFinished] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  let endimage;


   useEffect(() => {
    

    



    let detectionInterval;
    const options = {
      inputs: 42,
      outputs: 1,
      task: 'classification',
      debug: true    
    }
  
    const modelInfo = {
      model: 'https://raw.githubusercontent.com/isitusnoamow/ml5Model/main/model.json',
      metadata: 'https://raw.githubusercontent.com/isitusnoamow/ml5Model/main/model_meta.json',
      weights: 'https://raw.githubusercontent.com/isitusnoamow/ml5Model/main/model.weights.bin',
    };
  
    let brain;
    const modelLoaded = () => {
      console.log("Everythings Loaded!");
      videoRef.current.video.width = 600;
      videoRef.current.video.height = 480;
      detectionInterval = setInterval(() => {
        detect();
      }, 200);
    }

    const networkLoaded = () => {
      console.log('network loaded');
    }

    const gotResult = (error, results) => {
      setPrevLetter(currentLetter);
      if(results[0].label === 'Meta'){
        setCurrentLetter('<3');
      }else{
      setCurrentLetter(results[0].label);
      }
    }

    brain = ml5.neuralNetwork(options);
    brain.load(modelInfo, networkLoaded);


    const handpose = ml5.handpose(videoRef, modelLoaded);

    const detect = () => {
      if(videoRef.current.video.readyState !== 4){
        console.warn("cam not ready")
        return;
      }
      handpose.predict(videoRef.current.video, results => {
        if(results.length > 0){
          let result = results[0];
          let landmarks = result.landmarks
          let inputs = [];

          for(let i = 0; i < landmarks.length; i++){
            inputs.push(landmarks[i][0]);
            inputs.push(landmarks[i][1]);
          }
          brain.classify(inputs, gotResult);
        }
      });
    }

    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    }

  
  },[]);

  useEffect(() => {
    console.log(questions);
    if(currentLetter === questions[0]){
      setQuestions(questions => questions.slice(1));
      console.log(questions[0]);
    }

    if(!menu && questions.length === 0 && !gameOver){
      setGameOver(true)
      setFinished(true)
    }
  },[currentLetter,questions,menu, gameOver]);

  useEffect(() => {
    let timeInterval;
    if(gameStarted){
      timeInterval = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 1000)
      setGameStarted(false);
    }
  },[gameStarted]);
  
  useEffect(() => {
    if(finished){
      setScore(timer)
      setFinished(false);
    }
  },[finished,timer]);


  function start20(){
    for(let i=0; i<20; i++){
      setQuestions(questions => questions.concat(posibilities[Math.floor(Math.random() * posibilities.length)]));
    }
    setMenu(false);
    setGameStarted(true);
  }

  function start100(){
    for(let i=0; i<100; i++){
      setQuestions(questions => questions.concat(posibilities[Math.floor(Math.random() * posibilities.length)]));
    }
    setMenu(false);
    setGameStarted(true);
  }

  return (
    <div className="App">
      <div className='camera'>
        <Webcam ref={videoRef}/>
        
        <p className='caption'>{currentLetter}</p>
      </div>
      <h1>SignTime</h1>
      {menu 
      ?<><button className='start' onClick={start20}>Symbols x20</button><button className='start2' onClick={start100}>Symbols x100</button></>
      : <>{gameOver 
        ? <h3>Final time was {score}</h3> 
        :<h2 className='questions' >{questions[0]}</h2>}</>
       
      }
    </div>
  );
}

export default App;