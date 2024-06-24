<script>
	export let films = [];
	export let toggleSeen;

	const handleToggle = (id) => {
		toggleSeen(id);
	};
</script>

<div class="flex flex-wrap justify-center mt-10 gap-4">
	{#each films as film}
		<button
			on:click={() => handleToggle(film._id)}
			class="card transition ease-in-out
			{film.seen ? 'bg-green-100' : 'bg-slate-100'}"
		>
			<h2 class="font-bold text-xl">
				{film.title}, {film.year}
				<span class="text-3xl">{film.seen ? '✅' : '🔲'}</span>
			</h2>
			<h3 class="pb-4">
				Rank: {film.rank} <span class="text-gray-400"> |</span> Metascore: {film.metascore}
			</h3>
			<p class="text-justify">{film.description}</p>
		</button>
	{/each}
</div>

<style>
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
		border: none;
		padding: 0.5em 1em;
		border-radius: 5px;
	}
</style>
