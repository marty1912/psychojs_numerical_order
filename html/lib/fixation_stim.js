import { PsychoJS } from './core-2020.1.js';
import { Color } from './util-2020.1.js';
import { Polygon} from './visual-2020.1.js';


class FixationStim extends Polygon{

    // ctor: name is not used and can be anything
    // win is the window where we want to show this stim
    // numbers is an array of number to be displayed as text ([1,2,3] for example)
    constructor({
        name='fixation',
        win,size=0.1 }={}) 
    {

        super({
            name:name,
            win:win,
            pos:[0,0],
            size:size,
            lineColor: new Color('black'),
            fillColor: new Color('black'),
            edges: 32
        });

    }

    static getNFixations(win,n){
        let fixations = []
        for(let i=0;i<n;i++){
            fixations.push( new FixationStim({win:win}));
        }
        return fixations;
    }


}


export { FixationStim};
