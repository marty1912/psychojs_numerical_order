import { PsychoJS } from './core-2020.1.js';
import { Color } from './util-2020.1.js';
import { TextStim } from './visual-2020.1.js';


class Phon_stim extends TextStim{

	constructor( {
        name,
        win,
        len 
    }={}) 
    {
        let rand_string = Phon_stim.getRandomString(len);
        super({name:name,win:win,pos:[0,0],opacity:1,text:rand_string});
        this.text = rand_string;
    }

    getDifficulty(){
        return this.text.length;
    }
    // changes one letter of the text
    changeOneLetter(){
        console.log("(changeOneLetter) called");
        let string = this.text;
        let letter_array = string.split('');
        // we do not want to swap the first letter because that would be too easy
        // also we swap with the index +1 so we need it to stop one element short of the last one
        let index_to_swap = Math.floor(Math.random()*(letter_array.length-2)) + 1;
        // swapidiswap
        let tmp = letter_array[index_to_swap];
        letter_array[index_to_swap] = letter_array[index_to_swap+1];
        letter_array[index_to_swap+1] = tmp

        this.text = letter_array.join('');
        this.setText(this.text);

    }
    
    static getRandomString(len,possible_letters=['B','C','D','F','G','H','J','K','L','M','N','P','Q','R','S','T','V','W','X','Y','Z']){
        // clamp the len between 0 and the array len.
        len = (len > possible_letters.length) ? possible_letters.length : len;
        len = (len < 0) ? 0 : len;
        possible_letters = Phon_stim.shuffle(possible_letters);
        return possible_letters.slice(0,len).join('');
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
    


    static getPairForTrial(len,win,correct,size=1){
        let stim_first = new Phon_stim({name:'learn',win:win,len:len});
        let stim_second = new Phon_stim({name:'learn',win:win,len:len});
        stim_second.text = stim_first.text.toLowerCase();
        stim_second.setText(stim_second.text);

        if(correct == false){
            stim_second.changeOneLetter();
        }


        return {learn: stim_first,test:stim_second};

    }








}


export { Phon_stim };
