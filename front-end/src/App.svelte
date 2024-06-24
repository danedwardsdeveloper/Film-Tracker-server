<script>
	import { onMount } from 'svelte';
	import axios from 'axios';
	import FilmList from './FilmList.svelte';

	let films = [];

	const fetchFilms = async () => {
		try {
			const response = await axios.get('http://localhost:5001/films');
			films = response.data;
			console.log(films);
		} catch (error) {
			console.error('Error fetching films:', error);
		}
	};

	onMount(() => {
		fetchFilms();
	});

	const toggleSeen = async (id) => {
		try {
			const response = await axios.post(
				`http://localhost:5000/films/${id}/toggle`
			);
			films = films.map((film) => (film._id === id ? response.data : film));
		} catch (error) {
			console.error('Error toggling seen status:', error);
		}
	};
</script>

<main>
	<h1>Metacritic's Top 100 Films</h1>
	<FilmList {films} {toggleSeen} />
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 800px;
		margin: 0 auto;
	}
</style>
