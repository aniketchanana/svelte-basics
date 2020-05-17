<script>
	import Header from './components/Header.svelte';
	import Footer from './components/Footer.svelte';
	import PollForm from './components/PollForm.svelte';
	import PollList from './components/PollList.svelte';
	import Tabs from './shared/Tabs.svelte';

	let polls = [
		{
			id:1,
			question:'Python or javascript',
			answerA:'Python',
			answerB:'Javascript',
			voteA:0,
			voteB:0
		},
	]
	//tabs
	let items = ['current polls','add new poll'];
	let activeItem = 'current polls';
	const tabChange = (e) => {
		activeItem = e.detail;
	}
	const handelAdd = (e) => {
		const poll = e.detail;
		polls = [poll,...polls];
		activeItem = 'current polls';
	}
	const handelVote = (e) => {
		const {id,option} = e.detail;
		let copiedPolls = [...polls];
		let upVotedPoll = copiedPolls.find((poll) => poll.id === id);
		if(option === 'a') {
			upVotedPoll.voteA++;
		}
		if(option === 'b') {
			upVotedPoll.voteB++;
		}

		polls = copiedPolls;
	}	
</script>


<Header/>
<main>
	<Tabs {activeItem} {items} on:tab_change={tabChange}/>
	{#if activeItem === 'current polls'}
		<PollList {polls} on:vote={handelVote}/>
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