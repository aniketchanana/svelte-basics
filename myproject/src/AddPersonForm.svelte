<script>
    import {createEventDispatcher} from 'svelte';
    let dispatch = createEventDispatcher();
    let name;
    let beltColor;
    let age;
    let skills = [];

    const handelSubmit = () => {
        console.log(name,age,beltColor,skills);
        const person = {
            name,
            beltColor,
            age,
            skills,
            id: Math.random()
        };
        dispatch('add_person',person);
    }
</script>

<form on:submit|preventDefault={handelSubmit}>
    <input type="text" placeholder="name" bind:value={name}>
    <br>
    <input type="text" placeholder="beltcolor" bind:value={beltColor} disabled> <br>
    <input type="number" placeholder="age" bind:value={age}> 
    <br>
    <!-- <label for="skills">skills</label> <br>
    <input type="checkbox" bind:checked={fighting}> fighting <br>
    <input type="checkbox" bind:checked={sneaking}> sneaking <br>
    <input type="checkbox" bind:checked={running}> running <br> -->
    <label for="skills">skills</label> <br>
    <input type="checkbox" bind:group={skills} value="fighting"> fighting <br>
    <input type="checkbox" bind:group={skills} value="sneaking"> sneaking <br>
    <input type="checkbox" bind:group={skills} value="running"> running <br>
    <br>
    <input type="submit" placeholder="add person">
    <label for="beltColor">Belt Color</label>
    <select bind:value={beltColor}>
        <option value="black">Black</option>
        <option value="orange">Orange</option>
        <option value="white">White</option>
    </select>
</form>

<style>

</style>