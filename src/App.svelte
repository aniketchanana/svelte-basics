<script>
	import Header from './components/Header.svelte';
	import Footer from './components/Footer.svelte';
	import PollForm from './components/PollForm.svelte';
	import PollList from './components/PollList.svelte';
	import Tabs from './shared/Tabs.svelte';
	//tabs
	let items = ['current polls','add new poll'];
	let activeItem = 'current polls';
	const tabChange = (e) => {
		activeItem = e.detail;
	}
	const handelAdd = (e) => {
		const poll = e.detail;
		activeItem = 'current polls';
	}	
</script>

<Header/>
<main>
	<Tabs {activeItem} {items} on:tab_change={tabChange}/>
	{#if activeItem === 'current polls'}
		<PollList/>
	{:else if activeItem === 'add new poll'}
	 	<PollForm on:add_poll={handelAdd}/>
	{/if}
</main>
<Footer/>

<style>
	main {
		max-width: 960px;
		margin: 40px auto;
	}
</style>