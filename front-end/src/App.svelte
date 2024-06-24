<script>
	import { onMount } from 'svelte';
	import axios from 'axios';
	import FilmList from './FilmList.svelte';

	let films = [];
	let filmsSeen = 0;

	const fetchFilms = async () => {
		try {
			const response = await axios.get('http://localhost:5001/films');
			films = response.data;
			calculateFilmsSeen();
		} catch (error) {
			console.error('Error fetching films:', error);
		}
	};

	const calculateFilmsSeen = () => {
		filmsSeen = films.filter((film) => film.seen).length;
	};

	onMount(() => {
		fetchFilms();
	});

	const toggleSeen = async (id) => {
		try {
			const response = await axios.post(
				`http://localhost:5001/films/${id}/toggle`
			);
			films = films.map((film) => (film._id === id ? response.data : film));
			calculateFilmsSeen();
		} catch (error) {
			console.error('Error toggling seen status:', error);
		}
	};
</script>

<main class="bg-gradient-to-bl from-blue-100 to-pink-100">
	<h1 class="font-bold text-4xl">Metacritic's Top 100 Films</h1>
	<p class="py-4">
		A full-stack web app that only Dan can interact with. <span
			class="font-bold">Flims seen: {filmsSeen} / 100</span
		>
	</p>
	<FilmList {films} {toggleSeen} />
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		margin: 0 auto;
	}
</style>
