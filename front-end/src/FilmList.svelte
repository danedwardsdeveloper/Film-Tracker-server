<script>
	export let films = [];
	export let toggleSeen;

	const handleToggle = (id) => {
		toggleSeen(id);
	};
</script>

<ul>
	{#each films as film (film._id)}
		<li>
			<h2>{film.title}</h2>
			<p>{film.rank}</p>
			<p>{film.year}</p>
			<p>{film.metascore}</p>
			<p>{film.description}</p>
			<p>Status: {film.seen ? 'Seen' : 'Unseen'}</p>
			<button on:click={() => handleToggle(film._id)}>
				{film.seen ? 'Unseen' : 'Seen'}
			</button>
		</li>
	{/each}
</ul>

<style>
	ul {
		list-style-type: none;
		padding: 0;
	}

	li {
		margin: 0.5em 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	button {
		cursor: pointer;
		background: #ff3e00;
		color: white;
		border: none;
		padding: 0.5em 1em;
		border-radius: 5px;
	}

	button:hover {
		background: #e33500;
	}
</style>
