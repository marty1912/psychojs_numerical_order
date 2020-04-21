import { PsychoJS } from '../psychojs/core-2020.1.js';
import { Color } from '../psychojs/util-2020.1.js';
import { TextStim } from '../psychojs/visual-2020.1.js';
import * as util from '../psychojs/util-2020.1.js';
import * as visual from '../psychojs/visual-2020.1.js';
import * as sound from '../psychojs/sound-2020.1.js';
import {Phon_stim} from '../stims/phon_stim.js';
import {Ord_stim} from '../stims/ord_stim.js';
import {Vs_stim} from '../stims/grid_stim.js';
import {StaircaseScheduler} from '../staircase_sheduler.js';
import {DualScheduler} from '../dual_sheduler.js';
import {SingleScheduler} from '../single_sheduler.js';
import {InstuctionsScheduler} from '../instructions_sheduler.js';
import * as constants from './constants.js';
import { Scheduler } from '../psychojs/util-2020.1.js';

///////////////////////////////////////////////////////////////////
//                    Scheduler Utils                            //
//                                                               //
// this file contains a few helper functions.                    //
//                                                               //
///////////////////////////////////////////////////////////////////



    // checkToActivateStim
    // used in frame loops to check if a stimulus should be activated
    export function checkToAcitvateStim(current_t,start_time,stim,frameIndex){
        if (current_t >= start_time && stim.status === PsychoJS.Status.NOT_STARTED) {
            //console.log("stim: ",stim.name,", activated: t: ",current_t);
            // keep track of start time/frame for later
            stim.tStart = current_t;  // (not accounting for frame time here)
            stim.frameNStart = frameIndex;  // exact frame index

            stim.setAutoDraw(true);
        }

    }

// checkToDeactivateStim
// used in frame loops to check if a stimulus should be deactivated
export function checkToDeacitvateStim(current_t,end_time,stim,frameIndex,psychoJS){
    let time_adjusted_with_frame = end_time - psychoJS.window.monitorFramePeriod * 0.75;  // most of one frame period left
    if (stim.status === PsychoJS.Status.STARTED && current_t >= time_adjusted_with_frame) {

        //console.log("stim: ",stim.name,", deactivated: t: ",current_t);
        stim.setAutoDraw(false);
    }


}

// activateAndDeactivateStim
// used in frame loops to check if a stimulus should be deactivated / activated
export function activateAndDeactivateStim(current_t,start_time,end_time,stim,frame_index,psychoJS){
    checkToAcitvateStim(current_t,start_time,stim,frame_index);
    checkToDeacitvateStim(current_t,end_time,stim,frame_index,psychoJS);
}

// activateAndDeactivateKeyboard
// used in frame loops to check if a stimulus should be deactivated / activated
export function activateAndDeactivateKeyboard(current_t,start_time,end_time,keyboard,frame_index,psychoJS){
    // KEYBOARD handling
    if (current_t >= start_time && keyboard.status === PsychoJS.Status.NOT_STARTED) {
        // keep track of start time/frame for later

        //console.log("keyboard activated..");
        keyboard.tStart = current_t;  // (not accounting for frame time here)
        keyboard.frameNStart = frame_index;  // exact frame index

        // we do this at window flip for better timing!!
        psychoJS.window.callOnFlip(function(clock) { clock.reset(); },keyboard.clock);  // t=0 on next screen flip
        psychoJS.window.callOnFlip(function(keyboard) { keyboard.start(); },keyboard); // start on screen flip
        psychoJS.window.callOnFlip(function(keyboard) { keyboard.clearEvents(); },keyboard);
    }

    if (keyboard.status === PsychoJS.Status.STARTED && current_t >= end_time) {
        //console.log("keyboard deactivated..");
        keyboard.stop();
    }

}


// getStartEndTimes
// used as an helper function to get start and endtime object from a starttime + duration.
// @return object with {start,end}
export function getStartEndTimes(start_time,duration){
    let times = {start:start_time,end:start_time+duration}
    //console.log("getting times: ", times);
    return times;
}


// checks if the user pressed escape and ends the expreriment if so.
export function quitOnEscape(psychoJS){
    if (psychoJS.experiment.experimentEnded || psychoJS.eventManager.getKeys({keyList:['escape']}).length > 0) {

        window.location.href = constants.URL_REDIRECT;

        psychoJS.window.close();
        //psychoJS.quit({message: "Die [Escape] Taste wurde gedrückt. Das Experiment wurde abgebrochen. Danke für Ihre Teilnahme.", isCompleted: false});
        // redirect:

        return Scheduler.Event.Quit; 
    }
    return false;
}

//getFeedbackStim(sched,correct)
//@param sched: the scheduler for whom we need to get the instructions
//@return the correct instruction image to use.
export function getFeedbackStim(win,mode,correct){



    let image = undefined;
    if(mode == 'vis'){
        if(correct){
            image=constants.IMG.FEEDBACK_VIS_CORRECT;
        }else{
            image=constants.IMG.FEEDBACK_VIS_INCORRECT;
        }
    }
    else if(mode == 'phon'){
        if(correct){
            image=constants.IMG.FEEDBACK_PHON_CORRECT;
        }else{
            image=constants.IMG.FEEDBACK_PHON_INCORRECT;
        }
    }
    else if(mode == 'single'){
        if(correct){
            image=constants.IMG.FEEDBACK_ORD_CORRECT;
        }else{
            image=constants.IMG.FEEDBACK_ORD_INCORRECT;
        }
    }

    let stim = new visual.ImageStim({
        win: win,
        name: 'feedback',
        image: image,
        pos: [0, 0], ori: 0,
        size:1,
        opacity: 1,
        depth: 0.0 
    });


    return stim;
}

//getInstructionsText(sched)
//@param sched: the scheduler for whom we need to get the instructions
//@return the correct instruction image to use.
export function getInstructionsImage(sched){
    let images=[];
    if(sched instanceof StaircaseScheduler)
    {
        if (sched.correct_key =='j'){
            if(sched.mode == 'vis'){
                if(sched.practice){
                    images.push(constants.IMG.INSTRUCTION_STAIR_VIS_J_PRACTICE);
                    images.push(constants.IMG.INSTRUCTION_STAIR_VIS_J_PRACTICE_2);
                }else{
                    images.push(constants.IMG.INSTRUCTION_STAIR_VIS_J);
                }
            }
            else if(sched.mode == 'phon'){
                if(sched.practice){
                    images.push(constants.IMG.INSTRUCTION_STAIR_PHON_J_PRACTICE);
                    images.push(constants.IMG.INSTRUCTION_STAIR_PHON_J_PRACTICE_2);
                }else{
                    images.push(constants.IMG.INSTRUCTION_STAIR_PHON_J);
                }
            }
        }else{
            if(sched.mode == 'vis'){
                if(sched.practice){
                    images.push(constants.IMG.INSTRUCTION_STAIR_VIS_K_PRACTICE);
                    images.push(constants.IMG.INSTRUCTION_STAIR_VIS_K_PRACTICE_2);
                }else{
                    images.push(constants.IMG.INSTRUCTION_STAIR_VIS_K);
                }
            }
            else if(sched.mode == 'phon'){
                if(sched.practice){
                    images.push(constants.IMG.INSTRUCTION_STAIR_PHON_K_PRACTICE);
                    images.push(constants.IMG.INSTRUCTION_STAIR_PHON_K_PRACTICE_2);
                }else{
                    images.push(constants.IMG.INSTRUCTION_STAIR_PHON_K);
                }
            }

        }
    }
    else if(sched instanceof DualScheduler)
    {
        if (sched.correct_key =='j'){
            if(sched.mode == 'vis'){
                if(sched.practice){
                    images.push(constants.IMG.INSTRUCTION_DUAL_VIS_J_PRACTICE);
                    images.push(constants.IMG.INSTRUCTION_DUAL_VIS_J_PRACTICE_2);
                }else{
                    images.push(constants.IMG.INSTRUCTION_DUAL_VIS_J);
                }
            }
            else if(sched.mode == 'phon'){
                if(sched.practice){
                    images.push(constants.IMG.INSTRUCTION_DUAL_PHON_J_PRACTICE);
                    images.push(constants.IMG.INSTRUCTION_DUAL_PHON_J_PRACTICE_2);
                }else{
                    images.push(constants.IMG.INSTRUCTION_DUAL_PHON_J);
                }
            }

        }else{
            if(sched.mode == 'vis'){
                if(sched.practice){
                    images.push(constants.IMG.INSTRUCTION_DUAL_VIS_K_PRACTICE);
                    images.push(constants.IMG.INSTRUCTION_DUAL_VIS_K_PRACTICE_2);
                }else{
                    images.push(constants.IMG.INSTRUCTION_DUAL_VIS_K);
                }
            }
            else if(sched.mode == 'phon'){
                if(sched.practice){
                    images.push(constants.IMG.INSTRUCTION_DUAL_PHON_K_PRACTICE);
                    images.push(constants.IMG.INSTRUCTION_DUAL_PHON_K_PRACTICE_2);
                }else{
                    images.push(constants.IMG.INSTRUCTION_DUAL_PHON_K);
                }
            }


        }



    }
    else if(sched instanceof SingleScheduler)
    {
        if (sched.correct_key =='j'){
            if(sched.rig == true){
                if(sched.practice){
                    images.push(constants.IMG.INSTRUCTION_RIG_J_PRACTICE);
                    images.push(constants.IMG.INSTRUCTION_RIG_J_PRACTICE_2);
                }else{
                    images.push(constants.IMG.INSTRUCTION_RIG_J);
                }
            }
            else if(sched.rig == false){
                if(sched.practice){
                    images.push(constants.IMG.INSTRUCTION_SINGLE_J_PRACTICE);
                    images.push(constants.IMG.INSTRUCTION_SINGLE_J_PRACTICE_2);
                }else{
                    images.push(constants.IMG.INSTRUCTION_SINGLE_J);
                }

            }

        }else{
            if(sched.rig == true){
                if(sched.practice){
                    images.push(constants.IMG.INSTRUCTION_RIG_K_PRACTICE);
                    images.push(constants.IMG.INSTRUCTION_RIG_K_PRACTICE_2);
                }else{
                    images.push(constants.IMG.INSTRUCTION_RIG_K);
                }
            }
            else if(sched.rig == false){
                if(sched.practice){
                    images.push(constants.IMG.INSTRUCTION_SINGLE_K_PRACTICE);
                    images.push(constants.IMG.INSTRUCTION_SINGLE_K_PRACTICE_2);
                }else{
                    images.push(constants.IMG.INSTRUCTION_SINGLE_K);
                }

            }



        }
    }

    console.log("got images:",images);
    return images;
}
// addInsrtuctionsToSchedule
// gets correct instructions and adds them to the schedule
export function addInstructionsToSchedule(sched){
    let instr_imgs = getInstructionsImage(sched);
    for(let i=0;i<instr_imgs.length;i++){
        let pause_after = 4;
        if(i+1!=instr_imgs.length){
            pause_after=0;
        }

        if(sched instanceof SingleScheduler && (sched.rig == true)){
            pause_after=0;
        }

        console.log("adding instructions.");
        sched.add(new InstuctionsScheduler({psychojs:sched.psychojs,correct_key:sched.correct_key,image:instr_imgs[i],pause_after:pause_after}));
    }

    if(sched instanceof SingleScheduler && (sched.rig == true)){
        console.log("adding instructions.");
        sched.add(new InstuctionsScheduler({psychojs:sched.psychojs,correct_key:constants.KEY_RIG,image:constants.IMG.INSTRUCTION_RIG_2,pause_after:4}));
    }

    return;

}

// getScheduleOrder(prob_count)
// @param prob_count: the current participant number (0 for the first participant 1 for second..)
//
// @return object with fields 
// correct_key: (can be k or j)
// staircase_modes: array with "phon" and "vis" in the order to use for the participant.
// dual_modes: array with "phon" and "vis" and "rig" in the order to use for the participant.
export function getScheduleOrder(prob_count){
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
export function perm(xs) {
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
export function clone(obj) {
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


// copied from stackoverflow. checks if image is loaded correctly.
export function IsImageOk(img) {
    // During the onload event, IE correctly identifies any images that
    // weren’t downloaded as not complete. Others should too. Gecko-based
    // browsers act like NS4 in that they report this incorrectly.
    if (!img.complete) {
        return false;
    }

    // However, they do have two very useful properties: naturalWidth and
    // naturalHeight. These give the true size of the image. If it failed
    // to load, either of these should be zero.
    if (img.naturalWidth === 0) {
        return false;
    }

    // No other way of checking: assume it’s ok.
    return true;
}

export function allImagesLoaded(){
    for (const image in constants.IMG){

        if (image instanceof Image) {

            if(!isImageOk(image)){
                return false;
            }

        }
        return true;
    }

}
