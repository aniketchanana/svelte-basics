<script>
    import PollStore from '../stores/PollStore.js';
    import Card from '../shared/Card.svelte';
    import Button from '../shared/Button.svelte';
    import {tweened} from 'svelte/motion';
    export let poll;

    $: totalVotes = poll.voteA + poll.voteB;
    $: percentA = Math.floor(100 / totalVotes * poll.voteA) || 0;
    $: percentB = Math.floor(100 / totalVotes * poll.voteB) || 0;

    const tweenedA = tweened(0);
    const tweenedB = tweened(0);

    $: tweenedA.set(percentA);
    $: tweenedB.set(percentB);

    $: console.log($tweenedA,$tweenedB);
    //tweened percentages
    const handelVote = (option,id) => {
        PollStore.update(currentPolls => {
            let copiedPolls = [...currentPolls];
            let upVotedPoll = copiedPolls.find((poll) => poll.id === id);
            if(option === 'a') {
                upVotedPoll.voteA++;
            }
            if(option === 'b') {
                upVotedPoll.voteB++;
            }

            return copiedPolls;
        })
    }
    const handelDelete = id => {
        console.log(id);
        PollStore.update(currentPolls => {
            return currentPolls.filter( poll => poll.id !== id);
        })
    }
</script>

<Card>
    <div class="poll">
        <h3>{poll.question}</h3>
        <p>Total Votes: ({totalVotes})</p>
        <div class="answer" on:click={() => handelVote('a',poll.id)}>
            <div class="percent percent-a" style="width: {$tweenedA}%;"></div>
            <span>{poll.answerA} ({poll.voteA})</span>
        </div>
        <div class="answer" on:click={() => handelVote('b',poll.id)}>
            <div class="percent percent-b" style="width: {$tweenedB}%;"></div>
            <span>{poll.answerB} ({poll.voteB})</span>
        </div>
        <div class="delete">
            <Button flat={true} on:click={()=> handelDelete(poll.id)}>Delete</Button>
        </div>
    </div>
</Card>

<style>
  h3{
    margin: 0 auto;
    color: #555;
  }
  p{
    margin-top: 6px;
    font-size: 14px;
    color: #aaa;
    margin-bottom: 30px;
  }
  .answer{
    background: #fafafa;
    cursor: pointer;
    margin: 10px auto;
    position: relative;
  }
  .answer:hover{
    opacity: 0.6;
  }
  span{
    display: inline-block;
    padding: 10px 20px;
  }
  .percent {
    height: 100%;
    position: absolute;
    box-sizing: border-box;
  }
  .percent-a {
    border-left: 4px solid #d91b42;
    background: rgba(217, 27, 66,0.5);
  }
  .percent-b {
    border-left: 4px solid #45c496;
    background: rgba(69, 196, 150,0.2);
  }
  .delete {
    margin-top: 30px;
    text-align: center;
}
</style>