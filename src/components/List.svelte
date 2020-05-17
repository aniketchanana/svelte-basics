<script>
    import ListItem from './ListItem.svelte';
    export let todos; 
    export let deleteTodo;
    export let toggleEditing;
    export let updateTodo;
</script>

<main>
    {#each todos as todo (todo.id)}
        <ListItem {...todo} {deleteTodo} {toggleEditing} {updateTodo}/>
    {/each}
</main>

<style>
    main {
        margin-top: 20px;
    }
</style>