<script>
    import TodoForm from './TodoForm.svelte';
    import List from './List.svelte';
    let todos = [];
    const toggleEditing = (id) => {
        todos.forEach((todo,index) => {
            if(todo.id === id) {
                todos[index].isEditing = !todos[index].isEditing;
                return;
            }
        })
    }
    const deleteTodo = (id) => {
        todos = todos.filter( t => id !== t.id);
    }
    const updateTodo = (updateValue,id) => {
        todos.forEach((todo,index) => {
            if(todo.id === id) {
                todos[index].value = updateValue;
                todos[index].isEditing = !todos[index].isEditing;
                return;
            }
        })
    }

    const addTodo = (value) => {
        todos = [{value,isEditing:false,id:todos.length},...todos];
    }
</script>

<main>
    <TodoForm {addTodo}/>
    <List {todos} {toggleEditing} {deleteTodo} {updateTodo}/>
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 10px;
    }
</style>