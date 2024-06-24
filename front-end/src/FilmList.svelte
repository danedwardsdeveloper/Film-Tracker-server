<script>
	export let films = [];
	export let toggleSeen;

	const handleToggle = (id) => {
		toggleSeen(id);
	};
</script>

<div class="container">
	{#each films as film}
		<div class="card {film.seen ? 'bg-green-100' : 'bg-slate-100'}">
			<h2>{film.title}, {film.year}</h2>
			<h3>
				Rank: {film.rank}<br />
				Metascore: {film.metascore}
			</h3>
			<p>{film.description}</p>
			<p>Status: {film.seen ? 'Seen' : 'Unseen'}</p>
			<button on:click={() => handleToggle(film._id)}>
				{film.seen ? 'Unseen' : 'Seen'}
			</button>
		</div>
	{/each}
</div>

<style>
	.container {
		display: flex;
		flex-wrap: wrap;
		gap: 20px;
		justify-content: center;
	}

	.card {
		display: flex;
		flex-direction: column;
		text-align: left;
		justify-content: space-between;
		width: 300px;
		height: min-content;
		padding: 20px;
		border: 1px solid #ddd;
		border-radius: 10px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		transition:
			transform 0.3s,
			box-shadow 0.3s;
	}

	.card:hover {
		transform: translateY(-10px);
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
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
