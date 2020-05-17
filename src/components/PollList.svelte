<script>
    export let polls = [];
    import PollDetails from './PollDetails.svelte';
</script>

<div class="poll-list">
    {#each polls as poll (poll.id)}
        <div>
            <PollDetails {poll} on:vote/>
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