const fs = require('fs');
const path = require('path');

const lx = function(){};

function DeleteHandle() {
	this.totalCount = 0;
	this.fileCount = 0;
	this.directoryCount = 0;
	this._files = [];
	this._directories = [];
}
DeleteHandle.prototype.addFile = function addFile(filePath) {
	this._files.push(filePath);
	this.fileCount++;
	this.totalCount++;
}
DeleteHandle.prototype.addDirectory = function addDirectory(directoryPath) {
	this._directories.push(directoryPath);
	this.directoryCount++;
	this.totalCount++;
}
DeleteHandle.prototype.deleteAll = function deleteAll(){
	for(let f = 0; f < this._files.length; f++) {
		const filePath = this._files[f];
		fs.unlinkSync(filePath);
	}
	for(let d = 0; d < this._directories.length; d++) {
		const directoryPath = this._directories[d];
		fs.rmdirSync(directoryPath);
	}
}

module.exports = function deleteRecursive(startPath, match, options={}, deleteHandle) {
	const defaultOptions = {
		maxDepth: 10,
		filesOnly: false,
		directoriesOnly:false
	}

	const opts = Object.assign({}, defaultOptions, options);
	if(opts.maxDepth != null && opts.maxDepth <= 0) {
		return 0;
	}

	if((deleteHandle instanceof DeleteHandle) == false) {
		deleteHandle = new DeleteHandle();
	}

	const matchRegex = RegExp(match);
	const files = fs.readdirSync(startPath);

	files.forEach(function(fileName){
		const filePath = path.join(startPath, fileName);
		const fileStats = fs.lstatSync(filePath);

		const fileMatches = matchRegex.test(fileName);

		if(fileStats.isDirectory() == true) {
			if(fileMatches == true && opts.filesOnly == false) {
				deleteRecursive(filePath, /[\s\S]+/, {maxDepth:null}, deleteHandle);
				deleteHandle.addDirectory(filePath);
			}
			else {
				const nextOptions = Object.assign(opts, {maxDepth:opts.maxDepth-1});
				deleteRecursive(filePath, match, nextOptions, deleteHandle);
			}
		}
		else if(fileMatches == true && opts.directoriesOnly == false) {
			deleteHandle.addFile(filePath);
		}
	});

	return deleteHandle;
}
