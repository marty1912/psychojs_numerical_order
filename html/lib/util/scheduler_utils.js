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
import * as constants from './constants.js';
import { Scheduler } from '../psychojs/util-2020.1.js';


class SchedulerUtils {


    // checkToActivateStim
    // used in frame loops to check if a stimulus should be activated
    static checkToAcitvateStim(current_t,start_time,stim,frameIndex){
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
    static checkToDeacitvateStim(current_t,end_time,stim,frameIndex,psychoJS){
        let time_adjusted_with_frame = end_time - psychoJS.window.monitorFramePeriod * 0.75;  // most of one frame period left
        if (stim.status === PsychoJS.Status.STARTED && current_t >= time_adjusted_with_frame) {

            //console.log("stim: ",stim.name,", deactivated: t: ",current_t);
            stim.setAutoDraw(false);
        }


    }

    // activateAndDeactivateStim
    // used in frame loops to check if a stimulus should be deactivated / activated
    static activateAndDeactivateStim(current_t,start_time,end_time,stim,frame_index,psychoJS){
        SchedulerUtils.checkToAcitvateStim(current_t,start_time,stim,frame_index);
        SchedulerUtils.checkToDeacitvateStim(current_t,end_time,stim,frame_index,psychoJS);
    }

    // activateAndDeactivateKeyboard
    // used in frame loops to check if a stimulus should be deactivated / activated
    static activateAndDeactivateKeyboard(current_t,start_time,end_time,keyboard,frame_index,psychoJS){
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
    // used as an helperfunction to get start and endtime object from a starttime + duration.
    // @return object with {start,end}
    static getStartEndTimes(start_time,duration){
        let times = {start:start_time,end:start_time+duration}
        //console.log("getting times: ", times);
        return times;
    }


    // checks if the user pressed escape and ends the expreriment if so.
    static quitOnEscape(psychoJS){
        if (psychoJS.experiment.experimentEnded || psychoJS.eventManager.getKeys({keyList:['escape']}).length > 0) {
            psychoJS.window.close();
            //psychoJS.quit({message: "Die [Escape] Taste wurde gedrückt. Das Experiment wurde abgebrochen. Danke für Ihre Teilnahme.", isCompleted: false});
            return Scheduler.Event.Quit; 
        }
        return false;
    }

    // getCurrentDateString()
    // gets the current Date as a string. used for filenames.
    static getCurrentDateString(){
        let cur_date_user = new Date();
        let date_string = cur_date_user.getFullYear()+"_"
            +(cur_date_user.getMonth()+1)+"_" // +1 because the months start at 0 in js
            +cur_date_user.getDate()+"_"
            +cur_date_user.getHours()+""
            +cur_date_user.getMinutes();

        return date_string;

    }


    // getCountFromServer()
    // gets the prob count from the server. so we can handle the randomisations of the trials with it.
    static getCountFromServer(){

        let req = new XMLHttpRequest();
        // we use a sync process for the get. (false as last param)
        req.open('GET', 'counter.php', false);
        req.send();

        // get random number between 0 and 23 for if we dont get a response from the server
        let count = Math.floor(Math.random() * 24) 

        if(req.status == 200) {

            //console.log("recieved: ",req.responseText);
            let resp_ob = JSON.parse(req.responseText);
            //console.log("count: ",resp_ob["count"]);
            count = resp_ob["count"];
        }

        return count;
    }

    // uploads data to our server via http post
    // @param data: object to be used as data.
    // transforms the data object into an csv.
    // @param trial: used in filename.
    // @param prob_code: the participants code. (also used for filename)
    static upload(data,trial,prob_code){

        // get data
        let worksheet = XLSX.utils.json_to_sheet(data);
        let csv = XLSX.utils.sheet_to_csv(worksheet);

        // get date and time for the filename

        let date_string =  SchedulerUtils.getCurrentDateString();
        let file_name = prob_code+"_"+trial+"_"+date_string+".csv";


        let ndata = "filename="+file_name+"&data="+csv;

        let http = new XMLHttpRequest();
        http.open('POST', 'handler.php', true);

        //Send the proper header information along with the request
        http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        // register callback for when we get the reply from the server
        http.onreadystatechange = function() {
            if(http.readyState == 4 && http.status == 200) {
                //console.log(http.responseText);
            }
        }

        http.send(ndata);
        //console.log("data sent. ");

    }

    //getInstructionsText(sched)
    //@param sched: the scheduler for whom we need to get the instructions
    //@return the correct instructions to use.
    static getInstructionsText(sched){
        if(sched instanceof StaircaseScheduler)
        {
            if (sched.correct_key =='j'){
                if(sched.mode == 'vis'){
                    if(sched.practice){
                        return constants.INSTRUCTION_STAIR_VIS_J_PRACTICE;
                    }else{
                        return  constants.INSTRUCTION_STAIR_VIS_J;
                    }
                }
                else if(sched.mode == 'phon'){
                    if(sched.practice){
                        return  constants.INSTRUCTION_STAIR_PHON_J_PRACTICE;
                    }else{
                        return constants.INSTRUCTION_STAIR_PHON_J;
                    }
                }
            }else{
                if(sched.mode == 'vis'){
                    if(sched.practice){
                        return constants.INSTRUCTION_STAIR_VIS_K_PRACTICE;
                    }else{
                        return  constants.INSTRUCTION_STAIR_VIS_K;
                    }
                }
                else if(sched.mode == 'phon'){
                    if(sched.practice){
                        return  constants.INSTRUCTION_STAIR_PHON_K_PRACTICE;
                    }else{
                        return constants.INSTRUCTION_STAIR_PHON_K;
                    }
                }

            }
        }
        else if(sched instanceof DualScheduler)
        {
            if (sched.correct_key =='j'){
                if(sched.mode == 'vis'){
                    if(sched.practice){
                        return constants.INSTRUCTION_DUAL_VIS_J_PRACTICE;
                    }else{
                        return  constants.INSTRUCTION_DUAL_VIS_J;
                    }
                }
                else if(sched.mode == 'phon'){
                    if(sched.practice){
                        return  constants.INSTRUCTION_DUAL_PHON_J_PRACTICE;
                    }else{
                        return constants.INSTRUCTION_DUAL_PHON_J;
                    }
                }

            }else{
                if(sched.mode == 'vis'){
                    if(sched.practice){
                        return constants.INSTRUCTION_DUAL_VIS_K_PRACTICE;
                    }else{
                        return  constants.INSTRUCTION_DUAL_VIS_K;
                    }
                }
                else if(sched.mode == 'phon'){
                    if(sched.practice){
                        return  constants.INSTRUCTION_DUAL_PHON_K_PRACTICE;
                    }else{
                        return constants.INSTRUCTION_DUAL_PHON_K;
                    }
                }


            }
       


        }
        else if(sched instanceof SingleScheduler)
        {
            if (sched.correct_key =='j'){
                if(sched.rig == true){
                    if(sched.practice){
                        return constants.INSTRUCTION_RIG_J_PRACTICE;
                    }else{
                        return  constants.INSTRUCTION_RIG_J;
                    }
                }
                else if(sched.rig == false){
                    if(sched.practice){
                        return constants.INSTRUCTION_SINGLE_J_PRACTICE;
                    }else{
                        return  constants.INSTRUCTION_SINGLE_J;
                    }

                }

            }else{
                if(sched.rig == true){
                    if(sched.practice){
                        return constants.INSTRUCTION_RIG_K_PRACTICE;
                    }else{
                        return  constants.INSTRUCTION_RIG_K;
                    }
                }
                else if(sched.rig == false){
                    if(sched.practice){
                        return constants.INSTRUCTION_SINGLE_K_PRACTICE;
                    }else{
                        return  constants.INSTRUCTION_SINGLE_K;
                    }

                }



            }
        }

        return "could not determine correct instruction text.";
    }


}
export { SchedulerUtils, };
