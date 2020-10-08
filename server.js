const express = require('express');
const cors = require('cors');
const knex = require('knex')
const bcrypt = require('bcryptjs');

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'tejas@db',
    database : 'mescoe'
  }
});

db.withSchema('faculty').select('*').from('users').then(data => {
	console.log(data);
});

const students = [
	{
		id: '1',
		name: 'Tejas Machkar',
		year: 'TE',
		branch: 'Computer',
		div: '-1',
		PRN: 'F18112025',
		email: 'tejas@gmail.com',
		password: 'apple',
		joined: new Date()
	},
	{
		id: '2',
		name: 'Tanmay Jagtap',
		year: 'TE',
		branch: 'Computer',
		div: '-1',
		PRN: 'F18112045',
		email: 'tanmay@gmail.com',
		password: 'mango',
		joined: new Date()
	},
	{
		id: '3',
		name: 'Dwight Shrute',
		year: 'TE',
		branch: 'Computer',
		div: '-1',
		PRN: 'F18112035',
		email: 'dwight@gmail.com',
		password: 'beet',
		joined: new Date()
	}
] 

const faculty = [
	{
		id: '1',
		name: 'Master Obiwan',
		employeeID: '23',
		year: 'TE',
		branch: 'Computer',
		PRN: 'P20020',
		email: 'obiwan@gmail.com',
		password: 'anakin_sucks'
	},
	{
		id: '2',
		name: 'Master Yoda',
		employeeID: '34',
		year: 'TE',
		branch: 'Computer',
		PRN: 'P20025',
		email: 'yoda@gmail.com',
		password: 'password_this_is'
	}	
]

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
	res.json(faculty);
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