const express = require('express');
const cors = require('cors');
const knex = require('knex')
const bcrypt = require('bcryptjs');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const db = knex({
  client: 'pg',
  connection: {
    host : process.env.DATABASE_URL,
    ssl: true,
  }
});

db.withSchema('faculty').select('*').from('users').then(data => {
	console.log(data);
});

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
	res.json("This is working.");
});

app.post('/signin/student', (req, res) => {
	const {email, password}= req.body;
	if(!email || !password)
	{
		return res.status(400).json('Incorrect Submission');
	}
	db.withSchema('student').select('email', 'hash').from('login')
	.where('email', '=', email)
	.then(data => {
		const isValid = bcrypt.compareSync(password, data[0].hash);
		if(isValid)
		{
			return db.withSchema('student').select('*').from('users')
			.where('email', '=', email)
			.then(user => {
				res.json(user[0])
			})
			.catch(err => res.status(400).json('Unable to get User.'))
		}
		else
		{
			res.status(400).json('Wrong Credentials')
		}
	})
	.catch(err => res.status(400).json('Wrong Credentials'))
});

app.post('/signin/faculty', (req, res) => {
	const {email, password}= req.body;
	if(!email || !password)
	{
		return res.status(400).json('Incorrect Submission');
	}
	db.withSchema('faculty').select('email', 'hash').from('login')
	.where('email', '=', email)
	.then(data => {
		const isValid = bcrypt.compareSync(password, data[0].hash);
		if(isValid)
		{
			return db.withSchema('faculty').select('*').from('users')
			.where('email', '=', email)
			.then(user => {
				res.json(user[0])
			})
			.catch(err => res.status(400).json('Unable to get User.'))
		}
		else
		{
			res.status(400).json('Wrong Credentials')
		}
	})
	.catch(err => res.status(400).json('Wrong Credentials'))	
});

app.post('/register/student', (req, res) => {
	const {name, year, branch, div, prn, email, password} = req.body;
	const salt = bcrypt.genSaltSync(10);
	const hash = bcrypt.hashSync(password, salt);
	db.transaction(trx => {
		trx.insert({
			hash: hash,
			email: email
		})
		.into('student.login')
		.returning('email')
		.then(loginEmail => {
			return trx('student.users')
				.returning('*')
				.insert({
					name: name,
					year: year,
					branch: branch,
					div: div,
					prn: prn,
					email: loginEmail[0],
					joined: new Date()
				})
				.then(user => {
					res.json(user[0]);
				})
			})
		.then(trx.commit)
		.catch(trx.rollback)
	})
	.catch(err => res.status(400).json('Unable to register'));
})

app.post('/register/faculty', (req, res) => {
	const {name, employeeid, year, branch, prn, email, password} = req.body;
	const salt = bcrypt.genSaltSync(10);
	const hash = bcrypt.hashSync(password, salt);
	db.transaction(trx => {
		trx.insert({
			hash: hash,
			email: email
		})
		.into('faculty.login')
		.returning('email')
		.then(loginEmail => {
			return trx('faculty.users')
				.returning('*')
				.insert({
					name: name,
					year: year,
					branch: branch,
					prn: prn,
					email: loginEmail[0],
					joined: new Date()
				})
				.then(user => {
					res.json(user[0]);
				})
			})
		.then(trx.commit)
		.catch(trx.rollback)
	})
	.catch(err => res.status(400).json(err));
})

app.listen(process.env.PORT || 3001, () => {
	console.log(`App running on port ${process.env.PORT}`);
})