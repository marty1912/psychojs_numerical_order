import { PsychoJS } from './lib/psychojs/core-2020.1.js';
import * as core from './lib/psychojs/core-2020.1.js';
import { TrialHandler } from './lib/psychojs/data-2020.1.js';
import { Scheduler } from './lib/psychojs/util-2020.1.js';
import * as util from './lib/psychojs/util-2020.1.js';
import * as visual from './lib/psychojs/visual-2020.1.js';
import * as sound from './lib/psychojs/sound-2020.1.js';
import {Vs_stim} from './lib/stims/grid_stim.js';
import {Phon_stim} from './lib/stims/phon_stim.js';
import {StaircaseScheduler} from './lib/staircase_sheduler.js';
import {SingleScheduler} from './lib/single_sheduler.js';
import {DualScheduler} from './lib/dual_sheduler.js';
import * as constants from './lib/util/constants.js';
import * as ServerUtils from './lib/util/server_utils.js';

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

let expName = 'Untersuchung zu Ordinalitäten';  
var expInfo = {'Probanden Code': ''};

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

        // add info from the URL:
    util.addInfoFromUrl(expInfo);

    let prob_code = expInfo['Probanden Code'];
    getPCSpecs(prob_code);


    // setup the experiment schedule 
    let prob_count = ServerUtils.getCountFromServer();
    let order = getScheduleOrder(prob_count);

    // staircases first
    // we use an object so we can give it to the dual task later. it needs it to get the correct difficulty.
    let staircases = {
        pract_phon: new StaircaseScheduler({psychojs:psychoJS, prob_code:prob_code , mode:'phon',correct_key:order.correct_key,practice:true}),
        phon: new StaircaseScheduler({psychojs:psychoJS, prob_code:prob_code ,mode:'phon',correct_key:order.correct_key,practice:false}),
        pract_vis: new StaircaseScheduler({psychojs:psychoJS, prob_code:prob_code ,mode:'vis',correct_key:order.correct_key,practice:true}),
        vis: new StaircaseScheduler({psychojs:psychoJS, prob_code:prob_code ,mode:'vis',correct_key:order.correct_key,practice:false}),
    };

    for (let i=0;i<order.staircase_modes.length;i++){
        if(order.staircase_modes[i] == 'phon'){
            mainScheduler.add(staircases.pract_phon);
            mainScheduler.add(staircases.phon);
        }
        else if(order.staircase_modes[i] == 'vis'){
            mainScheduler.add(staircases.pract_vis);
            mainScheduler.add(staircases.vis);
        }
    }

    // single task 
    mainScheduler.add(new SingleScheduler({psychojs: psychoJS,
        prob_code:prob_code ,
        correct_key:order.correct_key,
        practice:true}));
    mainScheduler.add(new SingleScheduler({psychojs: psychoJS,
        prob_code:prob_code ,
        correct_key:order.correct_key,
        practice:false}));

    // dual tasks
    for (let i=0;i<order.dual_modes.length;i++){
        if(order.dual_modes[i] == 'rig'){

            mainScheduler.add(new SingleScheduler({psychojs: psychoJS,
                prob_code:prob_code ,
                correct_key:order.correct_key,
                rig:true,
                practice:false}));
            mainScheduler.add(new SingleScheduler({psychojs: psychoJS,
                prob_code:prob_code ,
                correct_key:order.correct_key,
                rig:true,
                practice:true}));

        }
        else if(order.dual_modes[i] == 'phon'){

            mainScheduler.add(new DualScheduler({psychojs:psychoJS,
                mode:order.dual_modes[i],
                correct_key:order.correct_key,
                staircase_sched:staircases.phon,
                practice:true}));

            mainScheduler.add(new DualScheduler({psychojs:psychoJS,
                mode:order.dual_modes[i],
                correct_key:order.correct_key,
                staircase_sched:staircases.phon,
                practice:false}));
        }
        else if(order.dual_modes[i] == 'vis'){

            mainScheduler.add(new DualScheduler({
                psychojs:psychoJS,
                mode:order.dual_modes[i],
                correct_key:order.correct_key,
                staircase_sched:staircases.phon,
                practice:true}));

            mainScheduler.add(new DualScheduler({
                psychojs:psychoJS,
                mode:order.dual_modes[i],
                correct_key:order.correct_key,
                staircase_sched:staircases.phon,
                practice:false}));
        }

    }


    return Scheduler.Event.NEXT;
}

// getPCSpecs(prob_code)
// gets the specs of the users pc and uploads them to the server.
//
// @param prob_code: the participants code.
function getPCSpecs(prob_code){

    console.log("test");
    let user_info = {};
    user_info.psychopyVersion = '2020.1.2';
    user_info.os = window.navigator.platform;
    user_info.frame_rate = psychoJS.window.getActualFrameRate();

    user_info.screen_height = window.screen.height;
    user_info.screen_width = window.screen.width;
    user_info.screen_availHeight = window.screen.availHeight;
    user_info.screen_availWidth = window.screen.availWidth;
    user_info.screen_pixel_ratio = window.devicePixelRatio;
    user_info.screen_height_t_ratio = window.screen.height * window.devicePixelRatio;
    user_info.screen_width_t_ratio = window.screen.width * window.devicePixelRatio;

    console.log("user_info: ",user_info);
    


    ServerUtils.upload([user_info],"user_info_",prob_code);
}


// getScheduleOrder(prob_count)
// @param prob_count: the current participant number (0 for the first participant 1 for second..)
//
// @return object with fields 
// correct_key: (can be k or j)
// staircase_modes: array with "phon" and "vis" in the order to use for the participant.
// dual_modes: array with "phon" and "vis" and "rig" in the order to use for the participant.
function getScheduleOrder(prob_count){
    // get the list of all possibilities:
    let base_order = {
        correct_key:constants.KEYS_ACCEPT_DECLINE,
        staircase_modes:["phon","vis"],
        dual_modes:["phon","vis","rig"],
    };
    let all_orderings = [];

    let possible_keys = ['j','k'];
    // all keys.
    for (let i=0;i<possible_keys.length;i++){
        let key = possible_keys[i];
        let current_order = clone(base_order);
        current_order.correct_key = key;
        all_orderings.push(current_order);
    }
    // staircases
    let len = all_orderings.length;
    for (let i= 0;i<len;i++){
        let current_order = clone(all_orderings[i]);
        let perms = perm(current_order.staircase_modes);
        for (let j=0;j<perms.length;j++){
            // compares the arrays
            if( !(perms[j].every(function(value, index) { return value == current_order.staircase_modes[index]}))){ 
                let new_order = clone(current_order);
                new_order.staircase_modes = perms[j];
                all_orderings.push(new_order);
            }
        }
    }

    // duals
    len = all_orderings.length;
    for (let i= 0;i<len;i++){
        let current_order = clone(all_orderings[i]);
        let perms = perm(current_order.dual_modes);
        for (let j=0;j<perms.length;j++){
            // compares the arrays
            if( !(perms[j].every(function(value, index) { return value == current_order.dual_modes[index]}))){ 
                let new_order = clone(current_order);
                new_order.dual_modes = perms[j];
                all_orderings.push(new_order);
            }
        }
    }

    return all_orderings[prob_count%all_orderings.length];
}

// copied from stackoverflow.
// generates all possible permutations for a given array.
function perm(xs) {
    let ret = [];

    for (let i = 0; i < xs.length; i = i + 1) {
        let rest = perm(xs.slice(0, i).concat(xs.slice(i + 1)));

        if(!rest.length) {
            ret.push([xs[i]])
        } else {
            for(let j = 0; j < rest.length; j = j + 1) {
                ret.push([xs[i]].concat(rest[j]))
            }
        }
    }
    return ret;
}

// copied from stackoverflow.
// copies an js object
function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

