import { PsychoJS } from '../psychojs/core-2020.1.js';
import * as constants from './constants.js';





// getCurrentDateString()
// gets the current Date as a string. used for filenames.
export function getCurrentDateString(){
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
export function getCountFromServer(){

    let req = new XMLHttpRequest();
    // we use a sync process for the get. (false as last param)
    req.open('GET', 'counter.php', false);
    req.send();

    // get random number between 0 and 23 for if we dont get a response from the server
    let count = Math.floor(Math.random() * 24) 

    console.log("response from server:",req.responseText);
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
export function upload(data,trial,prob_code){

    // get data
    let worksheet = XLSX.utils.json_to_sheet(data);
    let csv = XLSX.utils.sheet_to_csv(worksheet);

    // get date and time for the filename

    let date_string =  getCurrentDateString();
    let file_name = prob_code+"_"+trial+"_"+date_string+".csv";


    let ndata = "filename="+file_name+"&data="+csv;

    let http = new XMLHttpRequest();
    // we use a synchronous request. because we dont want to risk a loss of data 
    // (last param is asynchronous)
    http.open('POST', 'handler.php', false);

    //Send the proper header information along with the request
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    
    http.send(ndata);

}


