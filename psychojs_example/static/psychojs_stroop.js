/***************
 * Stroop *
 ***************/

// Adapted from a PsychoPy Builder export (PsychoPy 2026.1.3) for use with BOFS.
// Modifications relative to the Builder export are marked with `// BOFS:` and
// are kept narrow on purpose so this file reads as a recipe for adapting your
// own Builder-exported PsychoJS experiments. The three changes are:
//   1. Vendored lib path under `/static/psychojs/lib/` (and trialList path).
//   2. Skip the participant info dialog — read participantID from the BOFS
//      session via the inline window.BOFS_PARTICIPANT_ID set in the template.
//   3. Override `quitPsychoJS` to POST trial rows to `/table/psychojs_trials`
//      and navigate to `/redirect_next_page` instead of contacting Pavlovia.

// BOFS: vendored lib path.
import { core, data, sound, util, visual, hardware } from '/static/psychojs/lib/psychojs-2026.1.3.js';
const { PsychoJS } = core;
const { TrialHandler, MultiStairHandler } = data;
const { Scheduler } = util;
//some handy aliases as in the psychopy scripts;
const { abs, sin, cos, PI: pi, sqrt } = Math;
const { round } = util;

// BOFS: per-trial rows accumulated in `trialRoutineEnd` and POSTed in `quitPsychoJS`.
const bofsTrials = [];

// store info about the experiment session:
let expName = 'stroop';  // from the Builder filename that created this script
let expInfo = {
    'session': '01',
    // BOFS: participantID is injected by the BOFS template.
    'participant': window.BOFS_PARTICIPANT_ID || '',
};
let PILOTING = util.getUrlParameters().has('__pilotToken');

// Start code blocks for 'Before Experiment'
// init psychoJS:
const psychoJS = new PsychoJS({
  debug: true
});

// open window:
psychoJS.openWindow({
  // BOFS: fullscreen requires a fresh user gesture; the BOFS "Next" click was
  // consumed by the page navigation, so run windowed instead.
  fullscr: false,
  color: new util.Color('black'),
  units: 'height',
  waitBlanking: true,
  backgroundImage: '',
  backgroundFit: 'none',
});
// BOFS: skip the participant info dialog — expInfo['participant'] is prefilled
// from the BOFS session above. Schedule flow directly.
const flowScheduler = new Scheduler(psychoJS);
psychoJS.schedule(flowScheduler);

flowScheduler.add(updateInfo); // add timeStamp
flowScheduler.add(experimentInit);
flowScheduler.add(instructRoutineBegin());
flowScheduler.add(instructRoutineEachFrame());
flowScheduler.add(instructRoutineEnd());
const trialsLoopScheduler = new Scheduler(psychoJS);
flowScheduler.add(trialsLoopBegin(trialsLoopScheduler));
flowScheduler.add(trialsLoopScheduler);
flowScheduler.add(trialsLoopEnd);


flowScheduler.add(thanksRoutineBegin());
flowScheduler.add(thanksRoutineEachFrame());
flowScheduler.add(thanksRoutineEnd());
flowScheduler.add(quitPsychoJS, 'Thank you for your patience.', true);

psychoJS.start({
  expName: expName,
  expInfo: expInfo,
  // BOFS: register the trial CSV as a named resource. Pavlovia normally
  // auto-discovers resources from config.json; here we register them inline.
  resources: [
    { name: 'trialTypes.csv', path: '/static/psychojs/trialTypes.csv' },
  ],
  });

psychoJS.experimentLogger.setLevel(core.Logger.ServerLevel.WARNING);


var currentLoop;
var frameDur;
async function updateInfo() {
  currentLoop = psychoJS.experiment;  // right now there are no loops
  expInfo['date'] = util.MonotonicClock.getDateStr();  // add a simple timestamp
  expInfo['expName'] = expName;
  expInfo['psychopyVersion'] = '2026.1.3';
  expInfo['OS'] = window.navigator.platform;


  // store frame rate of monitor if we can measure it successfully
  expInfo['frameRate'] = psychoJS.window.getActualFrameRate();
  if (typeof expInfo['frameRate'] !== 'undefined')
    frameDur = 1.0 / Math.round(expInfo['frameRate']);
  else
    frameDur = 1.0 / 60.0; // couldn't get a reliable measure so guess

  // add info from the URL:
  util.addInfoFromUrl(expInfo);
  

  
  psychoJS.experiment.dataFileName = (("." + "/") + (("data" + "/") + `${expInfo["participant"]}_${expInfo["date"]}`));
  psychoJS.experiment.field_separator = '\t';


  return Scheduler.Event.NEXT;
}


var instructClock;
var ready;
var instrText;
var trialClock;
var resp;
var word;
var thanksClock;
var thanksText;
var globalClock;
var routineTimer;
async function experimentInit() {
  // Initialize components for Routine "instruct"
  instructClock = new util.Clock();
  ready = new core.Keyboard({psychoJS: psychoJS, clock: new util.Clock(), waitForStart: true});
  
  instrText = new visual.TextBox({
    win: psychoJS.window,
    name: 'instrText',
    text: 'OK. Ready for the real thing?\n\nRemember, ignore the word itself; press:\nLeft for red LETTERS\nDown for green LETTERS\nRight for blue LETTERS\n(Esc will quit)\n\nPress any key to continue',
    placeholder: 'Type here...',
    font: 'Arial',
    pos: [0, 0], 
    draggable: false,
    letterHeight: 0.05,
    lineSpacing: 1.0,
    size: [0.8, 0.8],  units: undefined, 
    ori: 0.0,
    color: 'white', colorSpace: 'rgb',
    fillColor: undefined, borderColor: undefined,
    languageStyle: 'LTR',
    bold: false, italic: false,
    opacity: 1.0,
    padding: undefined,
    alignment: 'center',
    overflow: 'visible',
    editable: false,
    multiline: true,
    anchor: 'center',
    depth: -1.0 
  });
  
  // Initialize components for Routine "trial"
  trialClock = new util.Clock();
  resp = new core.Keyboard({psychoJS: psychoJS, clock: new util.Clock(), waitForStart: true});
  
  word = new visual.TextBox({
    win: psychoJS.window,
    name: 'word',
    text: '',
    placeholder: 'Type here...',
    font: 'Arial',
    pos: [0, 0], 
    draggable: false,
    letterHeight: 0.2,
    lineSpacing: 1.0,
    size: [null, null],  units: undefined, 
    ori: 0.0,
    color: 'white', colorSpace: 'rgb',
    fillColor: undefined, borderColor: undefined,
    languageStyle: 'LTR',
    bold: false, italic: false,
    opacity: 1.0,
    padding: 0.0,
    alignment: 'center',
    overflow: 'visible',
    editable: false,
    multiline: true,
    anchor: 'center',
    depth: -1.0 
  });
  
  // Initialize components for Routine "thanks"
  thanksClock = new util.Clock();
  thanksText = new visual.TextBox({
    win: psychoJS.window,
    name: 'thanksText',
    text: 'This is the end of the experiment.\n\nThanks!',
    placeholder: 'Type here...',
    font: 'Arial',
    pos: [0, 0], 
    draggable: false,
    letterHeight: 0.1,
    lineSpacing: 1.0,
    size: undefined,  units: undefined, 
    ori: 0.0,
    color: 'white', colorSpace: 'rgb',
    fillColor: undefined, borderColor: undefined,
    languageStyle: 'LTR',
    bold: false, italic: false,
    opacity: 1.0,
    padding: undefined,
    alignment: 'center',
    overflow: 'visible',
    editable: false,
    multiline: true,
    anchor: 'center',
    depth: 0.0 
  });
  
  // Create some handy timers
  globalClock = new util.Clock();  // to track the time since experiment started
  routineTimer = new util.CountdownTimer();  // to track time remaining of each (non-slip) routine
  
  return Scheduler.Event.NEXT;
}


var t;
var frameN;
var continueRoutine;
var routineForceEnded;
var instructMaxDurationReached;
var _ready_allKeys;
var instructMaxDuration;
var instructComponents;
function instructRoutineBegin(snapshot) {
  return async function () {
    TrialHandler.fromSnapshot(snapshot); // ensure that .thisN vals are up to date
    
    //--- Prepare to start Routine 'instruct' ---
    t = 0;
    frameN = -1;
    continueRoutine = true; // until we're told otherwise
    // keep track of whether this Routine was forcibly ended
    routineForceEnded = false;
    instructClock.reset();
    routineTimer.reset();
    instructMaxDurationReached = false;
    // update component parameters for each repeat
    ready.keys = undefined;
    ready.rt = undefined;
    _ready_allKeys = [];
    psychoJS.experiment.addData('instruct.started', globalClock.getTime());
    instructMaxDuration = null
    // keep track of which components have finished
    instructComponents = [];
    instructComponents.push(ready);
    instructComponents.push(instrText);
    
    for (const thisComponent of instructComponents)
      if ('status' in thisComponent)
        thisComponent.status = PsychoJS.Status.NOT_STARTED;
    return Scheduler.Event.NEXT;
  }
}


function instructRoutineEachFrame() {
  return async function () {
    //--- Loop for each frame of Routine 'instruct' ---
    // get current time
    t = instructClock.getTime();
    frameN = frameN + 1;// number of completed frames (so 0 is the first frame)
    // update/draw components on each frame
    
    // *ready* updates
    if (t >= 0 && ready.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      ready.tStart = t;  // (not accounting for frame time here)
      ready.frameNStart = frameN;  // exact frame index
      
      // keyboard checking is just starting
      psychoJS.window.callOnFlip(function() { ready.clock.reset(); });  // t=0 on next screen flip
      psychoJS.window.callOnFlip(function() { ready.start(); }); // start on screen flip
      psychoJS.window.callOnFlip(function() { ready.clearEvents(); });
    }
    
    // if ready is active this frame...
    if (ready.status === PsychoJS.Status.STARTED) {
      let theseKeys = ready.getKeys({
        keyList: typeof [] === 'string' ? [[]] : [], 
        waitRelease: false
      });
      _ready_allKeys = _ready_allKeys.concat(theseKeys);
      if (_ready_allKeys.length > 0) {
        ready.keys = _ready_allKeys[_ready_allKeys.length - 1].name;  // just the last key pressed
        ready.rt = _ready_allKeys[_ready_allKeys.length - 1].rt;
        ready.duration = _ready_allKeys[_ready_allKeys.length - 1].duration;
        // a response ends the routine
        continueRoutine = false;
      }
    }
    
    
    // *instrText* updates
    if (t >= 0.0 && instrText.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      instrText.tStart = t;  // (not accounting for frame time here)
      instrText.frameNStart = frameN;  // exact frame index
      
      instrText.setAutoDraw(true);
    }
    
    
    // if instrText is active this frame...
    if (instrText.status === PsychoJS.Status.STARTED) {
    }
    
    // check for quit (typically the Esc key)
    if (psychoJS.experiment.experimentEnded || psychoJS.eventManager.getKeys({keyList:['escape']}).length > 0) {
      return quitPsychoJS('The [Escape] key was pressed. Goodbye!', false);
    }
    
    // check if the Routine should terminate
    if (!continueRoutine) {  // a component has requested a forced-end of Routine
      routineForceEnded = true;
      return Scheduler.Event.NEXT;
    }
    
    continueRoutine = false;  // reverts to True if at least one component still running
    for (const thisComponent of instructComponents)
      if ('status' in thisComponent && thisComponent.status !== PsychoJS.Status.FINISHED) {
        continueRoutine = true;
        break;
      }
    
    // refresh the screen if continuing
    if (continueRoutine) {
      return Scheduler.Event.FLIP_REPEAT;
    } else {
      return Scheduler.Event.NEXT;
    }
  };
}


function instructRoutineEnd(snapshot) {
  return async function () {
    //--- Ending Routine 'instruct' ---
    for (const thisComponent of instructComponents) {
      if (typeof thisComponent.setAutoDraw === 'function') {
        thisComponent.setAutoDraw(false);
      }
    }
    psychoJS.experiment.addData('instruct.stopped', globalClock.getTime());
    ready.stop();
    // the Routine "instruct" was not non-slip safe, so reset the non-slip timer
    routineTimer.reset();
    
    // Routines running outside a loop should always advance the datafile row
    if (currentLoop === psychoJS.experiment) {
      psychoJS.experiment.nextEntry(snapshot);
    }
    return Scheduler.Event.NEXT;
  }
}


var trials;
function trialsLoopBegin(trialsLoopScheduler, snapshot) {
  return async function() {
    TrialHandler.fromSnapshot(snapshot); // update internal variables (.thisN etc) of the loop
    
    // set up handler to look after randomisation of conditions etc
    trials = new TrialHandler({
      psychoJS: psychoJS,
      nReps: 5, method: TrialHandler.Method.RANDOM,
      extraInfo: expInfo, originPath: undefined,
      // BOFS: resource name registered in psychoJS.start({ resources: ... }).
      trialList: 'trialTypes.csv',
      seed: undefined, name: 'trials'
    });
    psychoJS.experiment.addLoop(trials); // add the loop to the experiment
    currentLoop = trials;  // we're now the current loop
    
    // Schedule all the trials in the trialList:
    for (const thisTrial of trials) {
      snapshot = trials.getSnapshot();
      trialsLoopScheduler.add(importConditions(snapshot));
      trialsLoopScheduler.add(trialRoutineBegin(snapshot));
      trialsLoopScheduler.add(trialRoutineEachFrame());
      trialsLoopScheduler.add(trialRoutineEnd(snapshot));
      trialsLoopScheduler.add(trialsLoopEndIteration(trialsLoopScheduler, snapshot));
    }
    
    return Scheduler.Event.NEXT;
  }
}


async function trialsLoopEnd() {
  // terminate loop
  psychoJS.experiment.removeLoop(trials);
  // update the current loop from the ExperimentHandler
  if (psychoJS.experiment._unfinishedLoops.length>0)
    currentLoop = psychoJS.experiment._unfinishedLoops.at(-1);
  else
    currentLoop = psychoJS.experiment;  // so we use addData from the experiment
  return Scheduler.Event.NEXT;
}


function trialsLoopEndIteration(scheduler, snapshot) {
  // ------Prepare for next entry------
  return async function () {
    if (typeof snapshot !== 'undefined') {
      // ------Check if user ended loop early------
      if (snapshot.finished) {
        // Check for and save orphaned data
        if (psychoJS.experiment.isEntryEmpty()) {
          psychoJS.experiment.nextEntry(snapshot);
        }
        scheduler.stop();
      } else {
        psychoJS.experiment.nextEntry(snapshot);
      }
    return Scheduler.Event.NEXT;
    }
  };
}


var trialMaxDurationReached;
var _resp_allKeys;
var trialMaxDuration;
var trialComponents;
function trialRoutineBegin(snapshot) {
  return async function () {
    TrialHandler.fromSnapshot(snapshot); // ensure that .thisN vals are up to date
    
    //--- Prepare to start Routine 'trial' ---
    t = 0;
    frameN = -1;
    continueRoutine = true; // until we're told otherwise
    // keep track of whether this Routine was forcibly ended
    routineForceEnded = false;
    trialClock.reset();
    routineTimer.reset();
    trialMaxDurationReached = false;
    // update component parameters for each repeat
    resp.keys = undefined;
    resp.rt = undefined;
    _resp_allKeys = [];
    word.setColor(new util.Color(letterColor));
    word.setText(text);
    psychoJS.experiment.addData('trial.started', globalClock.getTime());
    trialMaxDuration = null
    // keep track of which components have finished
    trialComponents = [];
    trialComponents.push(resp);
    trialComponents.push(word);
    
    for (const thisComponent of trialComponents)
      if ('status' in thisComponent)
        thisComponent.status = PsychoJS.Status.NOT_STARTED;
    return Scheduler.Event.NEXT;
  }
}


function trialRoutineEachFrame() {
  return async function () {
    //--- Loop for each frame of Routine 'trial' ---
    // get current time
    t = trialClock.getTime();
    frameN = frameN + 1;// number of completed frames (so 0 is the first frame)
    // update/draw components on each frame
    
    // *resp* updates
    if (t >= 0.5 && resp.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      resp.tStart = t;  // (not accounting for frame time here)
      resp.frameNStart = frameN;  // exact frame index
      
      // keyboard checking is just starting
      psychoJS.window.callOnFlip(function() { resp.clock.reset(); });  // t=0 on next screen flip
      psychoJS.window.callOnFlip(function() { resp.start(); }); // start on screen flip
      psychoJS.window.callOnFlip(function() { resp.clearEvents(); });
    }
    
    // if resp is active this frame...
    if (resp.status === PsychoJS.Status.STARTED) {
      let theseKeys = resp.getKeys({
        keyList: typeof ["left","down","right"] === 'string' ? [["left","down","right"]] : ["left","down","right"], 
        waitRelease: false
      });
      _resp_allKeys = _resp_allKeys.concat(theseKeys);
      if (_resp_allKeys.length > 0) {
        resp.keys = _resp_allKeys[_resp_allKeys.length - 1].name;  // just the last key pressed
        resp.rt = _resp_allKeys[_resp_allKeys.length - 1].rt;
        resp.duration = _resp_allKeys[_resp_allKeys.length - 1].duration;
        // was this correct?
        if (resp.keys == corrAns) {
            resp.corr = 1;
        } else {
            resp.corr = 0;
        }
        // a response ends the routine
        continueRoutine = false;
      }
    }
    
    
    // *word* updates
    if (t >= 0.5 && word.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      word.tStart = t;  // (not accounting for frame time here)
      word.frameNStart = frameN;  // exact frame index
      
      word.setAutoDraw(true);
    }
    
    
    // if word is active this frame...
    if (word.status === PsychoJS.Status.STARTED) {
    }
    
    // check for quit (typically the Esc key)
    if (psychoJS.experiment.experimentEnded || psychoJS.eventManager.getKeys({keyList:['escape']}).length > 0) {
      return quitPsychoJS('The [Escape] key was pressed. Goodbye!', false);
    }
    
    // check if the Routine should terminate
    if (!continueRoutine) {  // a component has requested a forced-end of Routine
      routineForceEnded = true;
      return Scheduler.Event.NEXT;
    }
    
    continueRoutine = false;  // reverts to True if at least one component still running
    for (const thisComponent of trialComponents)
      if ('status' in thisComponent && thisComponent.status !== PsychoJS.Status.FINISHED) {
        continueRoutine = true;
        break;
      }
    
    // refresh the screen if continuing
    if (continueRoutine) {
      return Scheduler.Event.FLIP_REPEAT;
    } else {
      return Scheduler.Event.NEXT;
    }
  };
}


function trialRoutineEnd(snapshot) {
  return async function () {
    //--- Ending Routine 'trial' ---
    for (const thisComponent of trialComponents) {
      if (typeof thisComponent.setAutoDraw === 'function') {
        thisComponent.setAutoDraw(false);
      }
    }
    psychoJS.experiment.addData('trial.stopped', globalClock.getTime());
    // was no response the correct answer?!
    if (resp.keys === undefined) {
      if (['None','none',undefined].includes(corrAns)) {
         resp.corr = 1;  // correct non-response
      } else {
         resp.corr = 0;  // failed to respond (incorrectly)
      }
    }
    // store data for current loop
    // update the trial handler
    if (currentLoop instanceof MultiStairHandler) {
      currentLoop.addResponse(resp.corr, level);
    }
    psychoJS.experiment.addData('resp.keys', resp.keys);
    psychoJS.experiment.addData('resp.corr', resp.corr);
    if (typeof resp.keys !== 'undefined') {  // we had a response
        psychoJS.experiment.addData('resp.rt', resp.rt);
        psychoJS.experiment.addData('resp.duration', resp.duration);
        routineTimer.reset();
        }

    // BOFS: collect this trial as a typed row for the BOFS data table. `text`,
    // `letterColor`, and `corrAns` are bound here by importConditions().
    bofsTrials.push({
      trial_index: bofsTrials.length,
      word: text,
      letterColor: letterColor,
      corrAns: corrAns,
      response: resp.keys,
      correct: resp.corr,
      rt: resp.rt,
    });
    
    resp.stop();
    // the Routine "trial" was not non-slip safe, so reset the non-slip timer
    routineTimer.reset();
    
    // Routines running outside a loop should always advance the datafile row
    if (currentLoop === psychoJS.experiment) {
      psychoJS.experiment.nextEntry(snapshot);
    }
    return Scheduler.Event.NEXT;
  }
}


var thanksMaxDurationReached;
var thanksMaxDuration;
var thanksComponents;
function thanksRoutineBegin(snapshot) {
  return async function () {
    TrialHandler.fromSnapshot(snapshot); // ensure that .thisN vals are up to date
    
    //--- Prepare to start Routine 'thanks' ---
    t = 0;
    frameN = -1;
    continueRoutine = true; // until we're told otherwise
    // keep track of whether this Routine was forcibly ended
    routineForceEnded = false;
    thanksClock.reset(routineTimer.getTime());
    routineTimer.add(2.000000);
    thanksMaxDurationReached = false;
    // update component parameters for each repeat
    psychoJS.experiment.addData('thanks.started', globalClock.getTime());
    thanksMaxDuration = null
    // keep track of which components have finished
    thanksComponents = [];
    thanksComponents.push(thanksText);
    
    for (const thisComponent of thanksComponents)
      if ('status' in thisComponent)
        thisComponent.status = PsychoJS.Status.NOT_STARTED;
    return Scheduler.Event.NEXT;
  }
}


var frameRemains;
function thanksRoutineEachFrame() {
  return async function () {
    //--- Loop for each frame of Routine 'thanks' ---
    // get current time
    t = thanksClock.getTime();
    frameN = frameN + 1;// number of completed frames (so 0 is the first frame)
    // update/draw components on each frame
    
    // *thanksText* updates
    if (t >= 0.0 && thanksText.status === PsychoJS.Status.NOT_STARTED) {
      // keep track of start time/frame for later
      thanksText.tStart = t;  // (not accounting for frame time here)
      thanksText.frameNStart = frameN;  // exact frame index
      
      thanksText.setAutoDraw(true);
    }
    
    
    // if thanksText is active this frame...
    if (thanksText.status === PsychoJS.Status.STARTED) {
    }
    
    frameRemains = 0.0 + 2.0 - psychoJS.window.monitorFramePeriod * 0.75;// most of one frame period left
    if (thanksText.status === PsychoJS.Status.STARTED && t >= frameRemains) {
      // keep track of stop time/frame for later
      thanksText.tStop = t;  // not accounting for scr refresh
      thanksText.frameNStop = frameN;  // exact frame index
      // update status
      thanksText.status = PsychoJS.Status.FINISHED;
      thanksText.setAutoDraw(false);
    }
    
    // check for quit (typically the Esc key)
    if (psychoJS.experiment.experimentEnded || psychoJS.eventManager.getKeys({keyList:['escape']}).length > 0) {
      return quitPsychoJS('The [Escape] key was pressed. Goodbye!', false);
    }
    
    // check if the Routine should terminate
    if (!continueRoutine) {  // a component has requested a forced-end of Routine
      routineForceEnded = true;
      return Scheduler.Event.NEXT;
    }
    
    continueRoutine = false;  // reverts to True if at least one component still running
    for (const thisComponent of thanksComponents)
      if ('status' in thisComponent && thisComponent.status !== PsychoJS.Status.FINISHED) {
        continueRoutine = true;
        break;
      }
    
    // refresh the screen if continuing
    if (continueRoutine && routineTimer.getTime() > 0) {
      return Scheduler.Event.FLIP_REPEAT;
    } else {
      return Scheduler.Event.NEXT;
    }
  };
}


function thanksRoutineEnd(snapshot) {
  return async function () {
    //--- Ending Routine 'thanks' ---
    for (const thisComponent of thanksComponents) {
      if (typeof thisComponent.setAutoDraw === 'function') {
        thisComponent.setAutoDraw(false);
      }
    }
    psychoJS.experiment.addData('thanks.stopped', globalClock.getTime());
    if (routineForceEnded) {
        routineTimer.reset();} else if (thanksMaxDurationReached) {
        thanksClock.add(thanksMaxDuration);
    } else {
        thanksClock.add(2.000000);
    }
    // Routines running outside a loop should always advance the datafile row
    if (currentLoop === psychoJS.experiment) {
      psychoJS.experiment.nextEntry(snapshot);
    }
    return Scheduler.Event.NEXT;
  }
}


function importConditions(currentLoop) {
  return async function () {
    psychoJS.importAttributes(currentLoop.getCurrentTrial());
    return Scheduler.Event.NEXT;
    };
}


// BOFS: replaces the Builder-generated quitPsychoJS so the experiment hands
// data to BOFS instead of Pavlovia. On normal completion we POST the trial
// rows to /table/psychojs_trials and navigate to /redirect_next_page so BOFS
// advances to the next page in PAGE_LIST. On abort (Esc / non-completion)
// we close the PsychoJS window and skip the data POST.
async function quitPsychoJS(message, isCompleted) {
  if (psychoJS.experiment.isEntryEmpty()) {
    psychoJS.experiment.nextEntry();
  }
  psychoJS.window.close();

  if (isCompleted && bofsTrials.length > 0) {
    await fetch('/table/psychojs_trials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bofsTrials),
    });
    window.location.href = '/redirect_next_page';
  }

  return Scheduler.Event.QUIT;
}
