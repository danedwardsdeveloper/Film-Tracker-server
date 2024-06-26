const express = require('express');
const cors = require('cors');
const basicAuth = require('express-basic-auth');
const mongoose = require('mongoose');
const router = express.Router();
const serverless = require('serverless-http');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());

const MONGODB_URI = process.env.MONGODB_URI;
const NODE_ENV = process.env.NODE_ENV;
const PORT = process.env.PORT || 5001;

// console.log(`MongoDB URI: ${MONGODB_URI}`);
// console.log(`Environment: ${NODE_ENV}`);

mongoose.connect(MONGODB_URI);

const filmSchema = new mongoose.Schema(
	{
		title: String,
		year: Number,
		seen: Boolean,
	},
	{ collection: 'top_films' }
);

const Film = mongoose.model('Film', filmSchema, 'top_films');

router.get('/', (req, res) => {
	res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Server Status</title>
      </head>
      <body>
        <h1>The server is running!</h1>
        <p>The database connection is ${MONGODB_URI}</p>
      </body>
      </html>
    `);
});

const users = {
	Dan: bcrypt.hashSync(process.env.USER_PASSWORD, 10),
};

// Rate limiting middleware
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	message: 'Too many requests, please try again later.',
});

app.use(limiter);

router.post('/login', async (req, res) => {
	console.log(`Request received.`);
	const { username, password } = req.body;

	if (users[username] && (await bcrypt.compare(password, users[username]))) {
		res.json({ message: 'Login successful' });
	} else {
		res.status(401).json({ message: 'Invalid credentials' });
	}
});

router.get('/films', async (req, res) => {
	const films = await Film.find().sort({ rank: 1 });
	res.json(films);
});

router.post(
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

router.get('/films/:title', async (req, res) => {
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

if (NODE_ENV === 'development') {
	app.use('/', router);
	app.listen(PORT, () => {
		console.log(`Server running locally on port ${PORT}`);
	});
} else {
	app.use('/.netlify/functions/server', router);
	module.exports.handler = serverless(app);
}
