const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();
const app = express();

//security packages

const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');

app.set('trust proxy', 1);
app.use(
	rateLimiter({
		windowMs: 15 * 60 * 1000, //15 minutes
		max: 100, //limit each IP to 100 requests per windowMs
	})
);
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', function (req, res) {
	res.status(200).sendFile(__dirname);
});

app.post('/signUp', function (req, res) {
	const { firstName, lastName, email, message } = req.body;

	const transporter = nodemailer.createTransport({
		service: 'Gmail',
		auth: {
			user: process.env.EMAIL_USERNAME,
			pass: process.env.EMAIL_PASSWORD,
		},
	});

	const mailOptions = {
		from: process.env.EMAIL_USERNAME,
		to: process.env.EMAIL_USERNAME,
		subject: 'Newsletter Signup',
		text: `Name: ${firstName} ${lastName}\nEmail: ${email}\nMessege: ${message}`,
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error(error);
			res.status(400).send('Error');
		} else {
			res.set('Content-Type', 'text/html');
			res.status(200).sendFile(
				path.join(__dirname, 'public', 'success.html')
			);
		}
	});
});

const port = process.env.port || 2000;

app.listen(port, function () {
	console.log(`Server is running on port ${port}`);
});
