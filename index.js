const express = require('express')
var combyne = require("combyne");
const fs = require('fs');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
var bodyParser = require('body-parser');
var passwordHasher = require('password-hash-and-salt');
var findMatching = require('bipartite-matching');

const app = express();
const adapter = new FileSync('db.json');
const db = low(adapter);
app.use(bodyParser.urlencoded({extended: false}));

db.defaults({
	people: [
		{id: 0, name: "Tom", submitted: false, hash: '', possible: [], target: ''},
		/*{id: 1, name: "Nicola", submitted: false, hash: '', possible: [], target: ''},
		{id: 2, name: "Inigo", submitted: false, hash: '', possible: [], target: ''},
		{id: 3, name: "Pratt", submitted: false, hash: '', possible: [], target: ''},
		{id: 4, name: "Massimo", submitted: false, hash: '', possible: [], target: ''},
		{id: 5, name: "Ollie C", submitted: false, hash: '', possible: [], target: ''},
		{id: 6, name: "Ollie M", submitted: false, hash: '', possible: [], target: ''},
		{id: 7, name: "Anisha", submitted: false, hash: '', possible: [], target: ''},*/
		{id: 1, name: "Amrik", submitted: false, hash: '', possible: [], target: ''},
		{id: 2, name: "Dan", submitted: false, hash: '', possible: [], target: ''}
	],
	all_submitted: false
}).write();

const port = 80;

function checkIfDone() {
	done = true;
	var db_data = db.get('people').value();
	db_data.forEach( person => {
		done = done && person.submitted;
	});
	db.set('all_submitted', done).write();
	if(done) {
		console.log('We are done');
		computeMatching();
	} else {
		console.log('Still not done :(');
	}
}

function computeMatching() {
	var edges = [];
	var num_people = 0;
	var db_data = db.get('people').value();
	db_data.forEach( giver => {
		num_people = num_people + 1;
		giver.possible.forEach( recipient => {
			edges.push([parseInt(giver.id), parseInt(recipient)]);
		})
	});
	var matching = findMatching(num_people,num_people,edges);
	console.log(matching);
	matching.forEach( pair => {
		db.get('people').find({id: pair[0]})
			.assign({
				target: pair[1]
			}).write();
	});
}

app.get('/', (req, res) => {
	console.log(req.path);
	done = db.get('all_submitted').value();
	console.log(done);
	if(!db.get('all_submitted').value()) {
		fs.readFile("views/name-list.tmpl","utf8", (err,tmpl_file) => {
			var tmpl = combyne(tmpl_file);
			var db_data = db.get('people').value();
			var output = tmpl.render(db_data);
			res.send(output);
		});
	} else {
		fs.readFile("views/name-list-2.tmpl","utf8", (err,tmpl_file) => {
			var tmpl = combyne(tmpl_file);
			var db_data = db.get('people').value();
			var output = tmpl.render(db_data);
			res.send(output);
		});
	}
})

app.get('/form/:id', (req, res) => {
	console.log(req.path);
	fs.readFile("views/form.tmpl", "utf8", (err, tmpl_file) => {
		var tmpl = combyne(tmpl_file);
		var db_data = db.get('people').value();
		var people = [];
		db_data.forEach( person => {
			if(parseInt(person.id) !== parseInt(req.params.id)) {
				people.push(person);
			}
		})
		var name = db_data[parseInt(req.params.id)].name;
		var output = tmpl.render({id:req.params.id, name: name, people: people});
		res.send(output);
	});
});

app.post('/form/:id', (req, res) => {
	console.log("POST")
	var body = Object.entries(req.body);
	var possible = [];
	var password;
	body.forEach(row => {
		if(row[0] === "password") {
			password = row[1]
		} else {
			possible.push(parseInt(row[0]));
		}
	})
	passwordHasher(password).hash( (err, hash) => {
		db.get('people').find({ id: parseInt(req.params.id)})
			.assign({
				submitted: true,
				possible: possible,
		 		hash: hash
			}).write();
		checkIfDone();
		res.redirect('/success');
	});
});

app.get('/success', (req, res) => {
	fs.readFile("views/success.tmpl","utf8", (err,tmpl_file) => {
		var tmpl = combyne(tmpl_file);
		var output = tmpl.render({});
		res.send(output);
	});
});

app.listen(port, () => {
	console.log(`Listening on ${port}`);
})
