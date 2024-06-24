const express = require('express');
const basicAuth = require('express-basic-auth');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(
	cors({
		origin: `https://metacritic-top-100-api.netlify.app/`,
		methods: ['GET', 'POST'],
		allowedHeaders: ['Content-Type'],
	})
);

app.use(express.json());

const uri = `process.env.MONGODB_URI`;

mongoose.connect(uri);

const filmSchema = new mongoose.Schema(
	{
		title: String,
		year: Number,
		seen: Boolean,
	},
	{ collection: 'top_films' }
);

const Film = mongoose.model('Film', filmSchema, 'top_films');

app.get('/films', async (req, res) => {
	const films = await Film.find().sort({ rank: 1 });
	res.json(films);
});

app.post(
	'/films/:id/toggle',
	basicAuth({
		users: { yourUsername: process.env.BASIC_AUTH_PASSWORD },
		challenge: true,
		unauthorizedResponse: (req) => 'Unauthorized',
	}),
	async (req, res) => {
		const film = await Film.findById(req.params.id);
		film.seen = !film.seen;
		await film.save();
		res.json(film);
	}
);

app.get('/films/:title', async (req, res) => {
	try {
		const film = await Film.findOne({ title: req.params.title });
		if (film) {
			console.log(film);
			res.json(film);
		} else {
			res.status(404).json({ message: 'Film not found' });
		}
	} catch (error) {
		res.status(500).json({ message: 'Error retrieving film', error });
	}
});

const port = process.env.PORT || 5001;
app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
