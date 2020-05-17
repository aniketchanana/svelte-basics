import {writable} from 'svelte/store';

const PollStore = writable([
    {
        id:1,
        question:'Python or javascript',
        answerA:'Python',
        answerB:'Javascript',
        voteA:0,
        voteB:0
    },
]);

export default PollStore;
