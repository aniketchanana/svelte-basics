<script>
    import {createEventDispatcher} from 'svelte';
    let dispatch = createEventDispatcher();
    export let isEditing;
    export let value;
    export let deleteTodo;
    export let toggleEditing;
    export let updateTodo;
    export let id;
    let updateValue = value;
    const handelSubmit = () => {
        if (!updateValue) {
            alert('Value cannot be empty');
            return ;
        }
        updateTodo(updateValue,id);
    }
</script>

<div>
    {#if !isEditing}
        <div class="todo">
            <p>{value}</p>
            <div>
                <img class="icon" src="./images/delete.svg" alt="" on:click={()=> deleteTodo(id)}/>
                <img class="icon" src="./images/pencil.svg" alt="" on:click={()=> toggleEditing(id)}/>
            </div>
        </div>
    {:else}
        <form on:submit|preventDefault={handelSubmit}>
            <input type="text" bind:value={updateValue}/>
            <input type="submit" value="update">
        </form>
    {/if}
</div>

<style>
    .todo {
        margin-top: 5px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #eee;
        min-width: 300px;
        padding-left: 20px;
        border-radius: 5px;
    }
    .icon {
        width: 20px;
        background-color: #fff;
        padding: 5px ;
        margin: 5px;
        border-radius: 10px;
        cursor: pointer;
    }
</style>