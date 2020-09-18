const express = require('express');
const cors = require('cors');

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
	if(email===students[0].email && password===students[0].password)
	{
		return res.json(students[0]);
	}
	else
	{
		return res.status(400).json('Wrong Credentials');
	}
});

app.post('/signin/faculty', (req, res) => {
	const {email, password}= req.body;
	if(!email || !password)
	{
		return res.status(400).json('Incorrect Submission');
	}
	if(email===faculty[0].email && password===faculty[0].password)
	{
		return res.json(faculty[0]);
	}
	else
	{
		return res.status(400).json('Wrong Credentials');
	}
});

app.post('/register/student', (req, res) => {
	const new_user = req.body;
	const new_student = {...new_user, joined: new Date};
	students.push(new_student);
	res.json(students[students.length-1]);
})

app.post('/register/faculty', (req, res) => {
	const new_user = req.body;
	const new_faculty = {...new_user, joined: new Date};
	faculty.push(new_faculty);
	res.json(faculty[faculty.length-1]);
})

app.listen(3001, () => {
	console.log('App running on port 3001');
})