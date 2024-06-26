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
		_id: mongoose.Schema.Types.ObjectId,
		title: String,
		year: Number,
		description: String,
		metascore: Number,
		seen: Boolean,
		rank: Number,
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
	Dan: bcrypt.hashSync(process.env.DAN_PASSWORD, 10),
	User2: bcrypt.hashSync(process.env.USER2_PASSWORD, 10),
	User3: bcrypt.hashSync(process.env.USER3_PASSWORD, 10),
};

const authorizer = async (username, password) => {
	console.log('Received username:', username);
	console.log('Received password:', password);

	const expectedPassword = users[username];
	if (!expectedPassword) {
		console.log('Username not found');
		return false;
	}

	const passwordMatches = await bcrypt.compare(password, expectedPassword);

	console.log(`Password match: ${passwordMatches}`);
	return passwordMatches;
};

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	message: 'Too many requests, please try again later.',
});

app.use(limiter);

router.post(
	'/login',
	basicAuth({
		authorizer,
		authorizeAsync: true,
		challenge: true,
		unauthorizedResponse: (req) => {
			console.log('Unauthorized access attempt');
			return 'Unauthorized';
		},
	}),
	(req, res) => {
		console.log('Login successful');
		res.json({ message: 'Login successful' });
	}
);

router.get('/films', async (req, res) => {
	const films = await Film.find().sort({ rank: 1 });
	res.json(films);
});

router.post(
	'/films/:id/toggle',
	basicAuth({
		authorizer: (username, password) => {
			const userMatches = basicAuth.safeCompare(
				username,
				process.env.BASIC_AUTH_USERNAME
			);
			const passwordMatches = basicAuth.safeCompare(
				password,
				process.env.BASIC_AUTH_PASSWORD
			);
			return userMatches & passwordMatches;
		},
		challenge: true,
		unauthorizedResponse: (req) => 'Unauthorized',
	}),
	async (req, res) => {
		try {
			console.log(`Toggling seen status for film ID: ${req.params.id}`);
			const film = await Film.findById(req.params.id);
			if (!film) {
				console.log('Film not found');
				return res.status(404).json({ message: 'Film not found' });
			}
			film.seen = !film.seen;
			await film.save();
			console.log('Film seen status toggled successfully');
			res.json(film);
		} catch (error) {
			console.error('Error toggling film status:', error);
			res.status(500).json({ message: 'Error toggling film status', error });
		}
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
