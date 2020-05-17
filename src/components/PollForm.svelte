<script>
    import PollStore from '../stores/PollStore.js';
    import {createEventDispatcher} from 'svelte';
    const dispatch = createEventDispatcher();
    import Button from '../shared/Button.svelte';
    let fields = { question:'',answerA:'',answerB:''};
    let errors = {question:'',answerA:'',answerB:''};
    let valid = false;
    const submitHandeler = () => {
        valid = true;
        //validate question
        if(fields.question.trim().length < 5) {
            valid = false;
            errors.question = 'Question must be at least 5 character long'
        } else {
            errors.question = '';
        }
        //validate answerA
        if(fields.answerA.trim().length < 1) {
            valid = false;
            errors.answerA = 'Question must be at least 5 character long'
        } else {
            errors.answerA = '';
        }
        //validate answerB
        if(fields.answerB.trim().length < 1) {
            valid = false;
            errors.answerB = 'Question must be at least 5 character long'
        } else {
            errors.answerB = '';
        }
        //add new poll
        if (valid) {
            let poll = {...fields,voteA:0,voteB:0,id:Math.random()};
            //save poll to store
            PollStore.update(currentPolls => {
                return [poll,...currentPolls];
            })
            dispatch('add_poll');
        }
    }
</script>

<form on:submit|preventDefault={submitHandeler}>
    <div class="form-field">
        <label for="question">Poll question</label>
        <input type="text" id="question" bind:value={fields.question}>
        <div class="error">{errors.question}</div>
    </div>
    <div class="form-field">
        <label for="answer-a">Answer A:</label>
        <input type="text" id="answer-a" bind:value={fields.answerA}>
        <div class="error">{errors.answerA}</div>
    </div>
    <div class="form-field">
        <label for="answer-b">Answer B:</label>
        <input type="text" id="answer-b" bind:value={fields.answerB}>
        <div class="error">{errors.answerB}</div>
    </div>
    <Button type="secondary" flat={false}>
        Add poll
    </Button>
</form>

<style>
    form {
        width: 400px;
        margin: 0 auto;
        text-align: center;
    }
    .form-field {
        margin: 18px suto;
    }
    input {
        width: 100%;
        border-radius: 6px;
    }
    label {
        margin: 10px auto;
        text-align: left;
    }
    .error {
        font-weight: bold;
        font-size: 12px;
        color: #d91b42;
    }
</style>