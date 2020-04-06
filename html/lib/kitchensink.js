import { PsychoJS } from './core-2020.1.js';
import { Color } from './util-2020.1.js';
import { TextStim } from './visual-2020.1.js';
import * as util from './util-2020.1.js';
import * as visual from './visual-2020.1.js';
import * as sound from './sound-2020.1.js';
import {Phon_stim} from './phon_stim.js';
import {Ord_stim} from './ord_stim.js';
import {Vs_stim} from './grid_stim.js';

class Kitchensink {


    static checkToAcitvateStim(current_t,start_time,stim,frameIndex){
        if (current_t >= start_time && stim.status === PsychoJS.Status.NOT_STARTED) {
            console.log("stim activated: t: ",current_t);
            // keep track of start time/frame for later
            stim.tStart = current_t;  // (not accounting for frame time here)
            stim.frameNStart = frameIndex;  // exact frame index

            stim.setAutoDraw(true);
        }

    }
    static checkToDeacitvateStim(current_t,end_time,stim,frameIndex,psychoJS){
        let time_adjusted_with_frame = end_time - psychoJS.window.monitorFramePeriod * 0.75;  // most of one frame period left
        if (stim.status === PsychoJS.Status.STARTED && current_t >= time_adjusted_with_frame) {

            console.log("stim deactivated: t: ",current_t);
            stim.setAutoDraw(false);
        }


    }
    static activateAndDeactivateStim(current_t,start_time,end_time,stim,frame_index,psychoJS){
        Kitchensink.checkToAcitvateStim(current_t,start_time,stim,frame_index);
        Kitchensink.checkToDeacitvateStim(current_t,end_time,stim,frame_index,psychoJS);
    }
    static activateAndDeactivateKeyboard(current_t,start_time,end_time,keyboard,frame_index,psychoJS){
        // KEYBOARD handling
        if (current_t >= start_time && keyboard.status === PsychoJS.Status.NOT_STARTED) {
            // keep track of start time/frame for later

            console.log("keyboard activated..");
            keyboard.tStart = current_t;  // (not accounting for frame time here)
            keyboard.frameNStart = frame_index;  // exact frame index

            // we do this at window flip for better timing!!
            psychoJS.window.callOnFlip(function(clock) { clock.reset(); },keyboard.clock);  // t=0 on next screen flip
            psychoJS.window.callOnFlip(function(keyboard) { keyboard.start(); },keyboard); // start on screen flip
            psychoJS.window.callOnFlip(function(keyboard) { keyboard.clearEvents(); },keyboard);
        }

        if (keyboard.status === PsychoJS.Status.STARTED && current_t >= end_time) {
            console.log("keyboard deactivated..");
            keyboard.stop();
        }

    }
    

    static getStartEndTimes(start_time,duration){
        let times = {start:start_time,end:start_time+duration}
        console.log("getting times: ", times);
        return times;
    }
    





}


export { Kitchensink};
