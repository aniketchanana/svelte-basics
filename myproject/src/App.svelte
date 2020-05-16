<script>
	import Modal from './Modal.svelte';
	import AddPersonForm from './AddPersonForm.svelte';
	let people = [
		{ name: 'yashi', beltColor:'black', age:25, id:1},
		{ name: 'mario', beltColor:'orange', age:23, id:2},
		{ name: 'lulgi', beltColor:'brown', age:35, id:3}
	]
	let showModal = false;
	const handelClick = (id) => {
		people = people.filter(person => {
			return person.id !== id;
		})
	}
	const toggleModal = () => {
		showModal = !showModal;
	}
	const addPerson = (e) => {
		const person = e.detail;
		people = [person,...people];
		toggleModal();
	}
</script>

<Modal {showModal} on:click={toggleModal}>
	<AddPersonForm on:add_person={addPerson}/>
</Modal>

<main>
	<button on:click={toggleModal}>open modal</button>
	{#each people as person (person.id)}
	<div>
		<h4>{person.name}</h4>
		{#if person.beltColor === 'black'}
			<p><strong>Master</strong> Ninja</p>
		{/if}
		<p>{person.age} years old, {person.beltColor} belt</p>
		{#if person.skills}
			{#each person.skills as skill}
				<p>{skill}</p>
				{:else}
				<p>No skill is mentioned</p>
			{/each}
		{/if}
		<button on:click={() => handelClick(person.id)} >Delete</button>
	</div>
	{:else}
		<p>There is no value inside people array</p>
	{/each}
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}
	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>