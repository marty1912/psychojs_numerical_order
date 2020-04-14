import { PsychoJS } from './lib/core-2020.1.js';
import * as core from './lib/core-2020.1.js';
import { TrialHandler } from './lib/data-2020.1.js';
import { Scheduler } from './lib/util-2020.1.js';
import * as util from './lib/util-2020.1.js';
import * as visual from './lib/visual-2020.1.js';
import * as sound from './lib/sound-2020.1.js';
import {Vs_stim} from './lib/grid_stim.js';
import {Phon_stim} from './lib/phon_stim.js';
import {StaircaseScheduler} from './lib/staircase_sheduler.js';
import {SingleScheduler} from './lib/single_sheduler.js';
import {DualScheduler} from './lib/dual_sheduler.js';
import {SchedulerUtils} from './lib/scheduler_utils.js';

// main psychoJS:
const psychoJS = new PsychoJS({
    debug: true
});

// open window:
psychoJS.openWindow({
    fullscr: true,
    color: new util.Color([0, 0, 0]),
    units: 'height',
    waitBlanking: true
});

// store info about the experiment session:
let expName = 'Ordinalitäten';  // from the Builder filename that created this script
var expInfo = {'prob_code': ''};

// schedule the experiment:
psychoJS.schedule(psychoJS.gui.DlgFromDict({
    dictionary: expInfo,
    title: "Bitte Tragen Sie hier Ihren Probandencode ein."
}));

const mainScheduler = new Scheduler(psychoJS);


psychoJS.schedule(mainScheduler);
mainScheduler.add(main); 

psychoJS.start({
    expName: expName,
    expInfo: expInfo,
});


function main() {
    expInfo['date'] = util.MonotonicClock.getDateStr();  // add a simple timestamp
    expInfo['expName'] = expName;
    expInfo['psychopyVersion'] = '2020.1.2';
    expInfo['OS'] = window.navigator.platform;

    let frameDur ;
    // store frame rate of monitor if we can measure it successfully
    expInfo['frameRate'] = psychoJS.window.getActualFrameRate();
    if (typeof expInfo['frameRate'] !== 'undefined')
        frameDur = 1.0 / Math.round(expInfo['frameRate']);
    else
        frameDur = 1.0 / 60.0; // couldn't get a reliable measure so guess

    // add info from the URL:
    util.addInfoFromUrl(expInfo);

    let prob_code = expInfo['prob_code'];
    let order = SchedulerUtils.getOrderFromServer();

    // add schedule to 
    mainScheduler.add(new SingleScheduler({psychojs: psychoJS,prob_code:prob_code ,debug:true}));
    mainScheduler.add(new StaircaseScheduler(psychoJS,"phon"));
    mainScheduler.add(new StaircaseScheduler(psychoJS,"vis"));
    mainScheduler.add(new DualScheduler(psychoJS,"phon"));
    mainScheduler.add(new DualScheduler(psychoJS,"vis"));


    return Scheduler.Event.NEXT;
}

/*
function quitPsychoJS(message, isCompleted) {
    // Check for and save orphaned data
    if (psychoJS.experiment.isEntryEmpty()) {
        psychoJS.experiment.nextEntry();
    }
    psychoJS.window.close();
    psychoJS.quit({message: message, isCompleted: isCompleted});

    return Scheduler.Event.QUIT;
}
*/
