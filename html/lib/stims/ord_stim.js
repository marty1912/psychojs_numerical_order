import { PsychoJS } from '../psychojs/core-2020.1.js';
import { Color } from '../psychojs/util-2020.1.js';
import { TextStim } from '../psychojs/visual-2020.1.js';


class Ord_stim extends TextStim{

    // ctor: name is not used and can be anything
    // win is the window where we want to show this stim
    // numbers is an array of number to be displayed as text ([1,2,3] for example)
    constructor( {
        name,
        win,
        numbers
    }={}) 
    {

        let text = Ord_stim.getTextFromNumbers(numbers);

        super({name:name,win:win,pos:[0,0],opacity:1,text:text,color: new Color('black')});

        this.numbers =numbers;
    }

    getNumbers(){
        return this.numbers;
    }

    // gets the smallest distance between two numbers in the numbers array 
    getDistance(){
        return Ord_stim.getDistance(this.numbers);
    }

    // same functions as below but for the object not the class
    isOrdered(){
    return  Ord_stim.isOrdered(this.numbers);
    }

    isAscending(){
     return  Ord_stim.isAscending(this.numbers);
    }

    isDescending(){
       return  Ord_stim.isDescending(this.numbers);
    }

    // gets the smallest distance between two numbers in the numbers array 
    static getDistance(numbers){
        let smallest_dist = Number.MAX_VALUE;

        for(let i= 0;i<numbers.length;i++){
            for(let j= 0;j<numbers.length;j++){

                if(j==i){
                    // skip if we have the same element
                    continue;
                }
                let distance = Math.abs(numbers[i]-numbers[j]);
                if (distance < smallest_dist){
                    smallest_dist = distance;
                }
            }
        }
        return smallest_dist;
    }

    // checks if the numbers array is in ascending or descending order.
    static isOrdered(numbers){
        if (Ord_stim.isAscending(numbers) || Ord_stim.isDescending(numbers)){
            return true;
        }
        return false;
    }
    // checks if the numbers array is in ascending order.
    static isAscending(numbers){
        for (let i= 1;i<numbers.length;i++){
            if(numbers[i] <= numbers[i-1])
            {
                return false;
            }

        }
        return true;
    }
    // checks if the numbers that are presented are in descending order.
    static isDescending(numbers){
        for (let i= 1;i<numbers.length;i++){
            if(numbers[i] >= numbers[i-1])
            {
                return false;
            }

        }
        return true;

    }

    // creates text that is displayed as a stimulus from the numbers array
    static getTextFromNumbers(array){
        return array.join(" ");
    }

    // copied from stackoverflow. 
    // returns all permutations for a given array xs.
    static perm(xs) {
        let ret = [];

        for (let i = 0; i < xs.length; i = i + 1) {
            let rest = Ord_stim.perm(xs.slice(0, i).concat(xs.slice(i + 1)));

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

    // copied from stackoverflow. shuffles an array in place
    // Fisher Yates shuffle
    //
    // @return the array
    static  shuffle(array) {
        let counter = array.length;

        // While there are elements in the array
        while (counter > 0) {
            // Pick a random index
            let index = Math.floor(Math.random() * counter);

            // Decrease counter by 1
            counter--;

            // And swap the last element with it
            let temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }

        return array;
    }



    static getStimsForTrial(win){

        // we have a total of 10 ordered pairs for distance 2
        let ascending_dist2 = [[1,3,5],[2,4,6],[3,5,7],[4,6,8],[5,7,9]]

        let descending_dist2 = []
        let unordered_dist2 =  []
        for(let i=0;i<ascending_dist2.length;i++){
            let permutations = Ord_stim.perm(ascending_dist2[i]);

            //console.log("(Ord_stim) permutations: ",permutations);
            for(let j= 0; j<permutations.length;j++){
                if(Ord_stim.isOrdered(permutations[j]) == false){
                    unordered_dist2.push(permutations[j]);
                }
                if(Ord_stim.isDescending(permutations[j]) == true) {
                    descending_dist2.push(permutations[j]);

                }
            }
        }
        //console.log("(Ord_stim) all unordered_dist2: ",unordered_dist2);
        //console.log("(Ord_stim) descending dist2: ",descending_dist2);
        // we only want 10 randomly selected trios from the unordered numbers.
        Ord_stim.shuffle(unordered_dist2);
        unordered_dist2 = unordered_dist2.slice(0,10);
        //console.log("(Ord_stim) 10 random unordered_dist2: ",unordered_dist2);

        let ascending_dist1 = [[1,2,3],[2,3,4],[3,4,5],[4,5,6],[5,6,7],[6,7,8],[7,8,9]]
        let descending_dist1 = []
        let unordered_dist1 = []

        for(let i=0;i<ascending_dist1.length;i++){
            let permutations = Ord_stim.perm(ascending_dist1[i]);

            //console.log("(Ord_stim) permutations: ",permutations);
            for(let j= 0; j<permutations.length;j++){

                if(Ord_stim.isOrdered(permutations[j]) == false){
                    unordered_dist1.push(permutations[j]);
                }
                if(Ord_stim.isDescending(permutations[j]) == true) {
                    descending_dist1.push(permutations[j]);

                }
            }
        }

        //console.log("(Ord_stim) all unordered_dist1: ",unordered_dist1);
        //console.log("(Ord_stim) descending dist1: ",descending_dist1);

        Ord_stim.shuffle(unordered_dist1);
        unordered_dist1 = unordered_dist1.slice(0,10);
        //console.log("(Ord_stim) 10 random unordered_dist1: ",unordered_dist1);

        Ord_stim.shuffle(ascending_dist1);
        ascending_dist1 = ascending_dist1.slice(0,5);
        //console.log("(Ord_stim) 5 random ascending_dist1: ",ascending_dist1);

        Ord_stim.shuffle(descending_dist1);
        descending_dist1 = descending_dist1.slice(0,5);
        //console.log("(Ord_stim) 5 random descending_dist1: ",descending_dist1);

        let all_trios = []
       all_trios= all_trios.concat(ascending_dist1);
       all_trios= all_trios.concat(ascending_dist2);
all_trios=        all_trios.concat(descending_dist1);
all_trios=        all_trios.concat(descending_dist2);
all_trios=        all_trios.concat(unordered_dist1);
all_trios=        all_trios.concat(unordered_dist2);

        // shuffle trios so we get a random order.
        
        Ord_stim.shuffle(all_trios);
        // debug some statistics:
        let n_unordered = 0;
        let n_ascending = 0;
        let n_descending = 0;
        let n_distance1 = 0;
        let n_distance2 = 0;
        for(let i=0;i<all_trios.length;i++){
            if(Ord_stim.isOrdered(all_trios[i]) == false){
                n_unordered++;
            }
            if(Ord_stim.isAscending(all_trios[i]) == true){
                n_ascending++;
            }
            if(Ord_stim.isDescending(all_trios[i]) == true){
                n_descending++;
            }
            if(Ord_stim.getDistance(all_trios[i]) == 1){
                n_distance1++;
            }
            if(Ord_stim.getDistance(all_trios[i]) == 2){
                n_distance2++;
            }

        }
        //console.log("(Ord_stim) debug: n_unordered:",n_unordered," n_ascending:",n_ascending," n_descending",n_descending," n_distance1",n_distance1,"n_distance2",n_distance2);

            
        let all_stims = [];
        for(let i=0;i<all_trios.length;i++){
            all_stims.push(new Ord_stim({name:"ord_stim",win:win,numbers:all_trios[i]}));
        }

        return all_stims;
    }








}


export { Ord_stim};
