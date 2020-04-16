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
import * as SchedulerUtils from './lib/util/scheduler_utils.js';

const psychoJS = new PsychoJS({
    debug: true // TODO disable!
});

// open window:
psychoJS.openWindow({
    fullscr: true,
    color: new util.Color('white'),
    units: 'height',
    waitBlanking: true
});
let expName = 'Untersuchung zu Ordinalitäten';  
var expInfo = {'Probandencode':'' };

// schedule the experiment:
psychoJS.schedule(psychoJS.gui.DlgFromDict({
    dictionary: expInfo,
    title: "Bitte Tragen Sie hier Ihren Probandencode ein.",
    logoUrl:'images/prob_code.png',
}));

const mainScheduler = new Scheduler(psychoJS);

psychoJS.schedule(mainScheduler);
mainScheduler.add(main); 

psychoJS.start({
    expName: expName,
    expInfo: expInfo,
});


function main() {

    // add info from the URL:
    util.addInfoFromUrl(expInfo);

    let prob_code = expInfo['Probandencode'];
    getPCSpecs(prob_code);


    // setup the experiment schedule 
    let prob_count = ServerUtils.getCountFromServer();
    let order = SchedulerUtils.getScheduleOrder(prob_count);

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
                practice:true}));

            mainScheduler.add(new SingleScheduler({psychojs: psychoJS,
                prob_code:prob_code ,
                correct_key:order.correct_key,
                rig:true,
                practice:false}));

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
                staircase_sched:staircases.vis,
                practice:true}));

            mainScheduler.add(new DualScheduler({
                psychojs:psychoJS,
                mode:order.dual_modes[i],
                correct_key:order.correct_key,
                staircase_sched:staircases.vis,
                practice:false}));
        }

    }


    // after the experiment we redirect to the limesurvey for Versuchsscheine.
    mainScheduler.add(function() {window.location.href = "http://new_url.com";}); 

    return Scheduler.Event.NEXT;
}

// getPCSpecs(prob_code)
// gets the specs of the users pc and uploads them to the server.
//
// @param prob_code: the participants code.
function getPCSpecs(prob_code){

    let client_info = {};
    client_info.psychopyVersion = '2020.1.2';
    client_info.os = window.navigator.platform;
    client_info.frame_rate = psychoJS.window.getActualFrameRate();
    client_info.n_cpus = navigator.hardwareConcurrency; 

    client_info.screen_height = window.screen.height;
    client_info.screen_width = window.screen.width;
    client_info.screen_availHeight = window.screen.availHeight;
    client_info.screen_availWidth = window.screen.availWidth;
    client_info.screen_pixel_ratio = window.devicePixelRatio;
    client_info.screen_height_t_ratio = window.screen.height * window.devicePixelRatio;
    client_info.screen_width_t_ratio = window.screen.width * window.devicePixelRatio;

    


    ServerUtils.upload([client_info],"client_info_",prob_code);
}



