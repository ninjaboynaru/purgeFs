#!/usr/bin/env node
const readline = require('readline');
const program = require('commander');
const path = require('path');
const deleteRecursive = require('./deleteRecursive.js');

program
.version('1.0,0')
.option('-p --path <path>', 'Path to start recursive dealtion')
.option('-n --name <name>', 'Name of folder to delete')
.option('-m --max <max>', 'Max depth for recursion', parseInt)
.parse(process.argv);

if(program.path == undefined || program.path == false) {
	console.error(' error: path argument is required "-p --path <path>"');
	process.exit(1);
}
if(program.name == undefined || program.name.trim().length == 0) {
	console.error(' error: name argument is required "-n --name <name>"');
	process.exit(1);
}


console.log('Stand by. Scanning...');
const deleteOptions = {maxDepth:program.max || 100};
const deleteHandle = deleteRecursive(path.join(process.cwd(), program.path), program.name, deleteOptions);

console.log('Scan Complete');
console.log(`Total deletes: ${deleteHandle.totalCount}`);
console.log(`  Files: ${deleteHandle.fileCount}`);
console.log(`  Directories: ${deleteHandle.directoryCount}`);

const rl = readline.createInterface(process.stdin, process.stdout);
(function authorizeDeleation() {
	rl.question('\nPress enter to start deleation (type anything other character to cancle) > ', function(answer){
		if(answer.trim().length == 0) {
			console.log('Deleting...');
			deleteHandle.deleteAll();
			console.log('Deleation complete');
		}
		else {
			console.log('Deleation cancled');
		}

		process.exit(0);
	});
})();
