<script>
    let todo;
    export let addTodo;
    const handelSubmit = () => {
        if (!todo) {
            alert('Value cannot be empty');
            return ;
        }
        addTodo(todo);
        todo = '';
    }
</script>

<form on:submit|preventDefault={handelSubmit}>
    <input type="text" placeholder="Enter your todo here..." bind:value={todo}>
    <input type="submit" value="Add todo">
</form>