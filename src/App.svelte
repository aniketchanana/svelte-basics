<script>
	import TodoList from './components/TodoList.svelte';
</script>

<main>
	<h1>Todo app!</h1>
	<TodoList/>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1em;
		margin: 0 auto;
	}
	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 3em;
		font-weight: 100;
	}
	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>