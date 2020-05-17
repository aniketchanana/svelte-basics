<script>
    import {fade, slide, scale} from 'svelte/transition';
    import { flip } from 'svelte/animate';
    import PollStore from '../stores/PollStore';
    // import {onDestroy} from 'svelte';
    let polls = [];
    import PollDetails from './PollDetails.svelte';
    // const unSub = PollStore.subscribe( data => {
    //     polls = data;
    // });
    // onDestroy(()=>{
    //     console.log('component destroyed');
    //     unSub();
    // })
</script>

<div class="poll-list">
    <!-- added listener to store is value changes we can get the change using this eliminates subscribing and unsubscribing of store -->
    {#each $PollStore as poll (poll.id)}
        <div in:fade out:scale|local animate:flip={{duration:500}}>
            <PollDetails {poll}/>
        </div>
    {/each}
</div>

<style>
    .poll-list {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: 20px;
    }
</style>