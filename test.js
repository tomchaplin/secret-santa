const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);

var people = db.get('people').value();
var targets = [];
people.forEach( person => {
	targets.push(parseInt(person.target));
})
targets.sort();
console.log(targets);
