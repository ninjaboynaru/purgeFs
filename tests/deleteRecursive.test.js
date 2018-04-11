const chai = require('chai');
const mock = require('mock-fs');
const fs = require('fs');
const path = require('path');
const deleteRecursive = require('../deleteRecursive');
const expect = chai.expect;


before('Pollyfill array methods', function(){
	Array.prototype.remove = function remove(regex) {
		const matchRegex = new RegExp(regex);
		const newArray = this.filter(function(element){
			return matchRegex.test(element) == false;
		});

		return newArray;
	}
});
function expectFilesMatch(path, mockStructure, regexToDelete) {
	const actualFiles = fs.readdirSync(path);
	const expectedFiles = Object.keys(mockStructure).remove(regexToDelete);

	expect(actualFiles).to.have.members(expectedFiles);
}
function expectDeleteHandleCounts(deleteHandle, totalCount, fileCount, directoryCount) {
	expect(deleteHandle.totalCount).to.equal(totalCount);
	expect(deleteHandle.fileCount).to.equal(fileCount);
	expect(deleteHandle.directoryCount).to.equal(directoryCount);
}

describe('Recursively delete files', function(){
	const mockStructure = {
		'dir-a': {
			'mock-file.txt': '',
			'mock-file.png': '',
			'mock-file.jpg': '',
			'dir-b': {
				'mock-file.txt': '',
				'mock-file.png': '',
				'mock-file.jpg': '',
				'mock-file-2.txt': '',
			}

		}
	}
	beforeEach(function(){
		mock(mockStructure);
	});

	afterEach(function(){
		mock.restore();
	});

	it('Can delete recursively based on file name', function(){
		const fileToDelete = 'mock-file.txt'
		const startPath = 'dir-a';
		const subPath = 'dir-b'
		const deleteHandle = deleteRecursive(startPath, fileToDelete);

		expectDeleteHandleCounts(deleteHandle, 2, 2, 0)
		deleteHandle.deleteAll();
		expectFilesMatch(startPath, mockStructure[startPath], fileToDelete);
		expectFilesMatch(`${startPath}/${subPath}`, mockStructure[startPath][subPath], fileToDelete);
	});

	it('Can delete recursiely based on file type', function(){
		const regexToDelete = /\.(txt)\b/;
		const startPath = 'dir-a';
		const subPath = 'dir-b';
		const deleteHandle = deleteRecursive(startPath, regexToDelete);

		expectDeleteHandleCounts(deleteHandle, 3, 3, 0);
		deleteHandle.deleteAll();
		expectFilesMatch(startPath, mockStructure[startPath], regexToDelete);
		expectFilesMatch(`${startPath}/${subPath}`, mockStructure[startPath][subPath], regexToDelete);

	});
});


describe('Recursively delete folders', function(){
	const mockStructure = {
		'folder-a': {
			'mock-file.txt': '',
			'mock-file.png': '',
			'mock-file.jpg': '',
			'folder-b': {
				'mock-file.txt': '',
				'mock-file.png': '',
				'folder-d': {
					'mock-file.jpg': '',
					'mock-file-2.txt': '',
					'deep-folder': {
						'deep-file.txt': '',
						'deep-file.png': ''
					}
				}
			},
			'folder-c': {}
		},
		'folder-b': {
			'mock-file.txt': '',
			'mock-file.png': '',
			'folder-c': {
				'mock-file.txt': '',
				'mock-file.png': '',
			}
		},
	}
	beforeEach(function(){
		mock(mockStructure);
	});

	afterEach(function(){
		mock.restore();
	});

	it('Can delete an empty folder', function(){
		const folderToDelete = 'folder-c';
		const startPath = 'folder-a';
		const deleteHandle = deleteRecursive(startPath, folderToDelete);

		expectDeleteHandleCounts(deleteHandle, 1, 0, 1);
		deleteHandle.deleteAll();
		expectFilesMatch(startPath, mockStructure[startPath], folderToDelete);
	});

	it('Can delete a folder with contents', function(){
		const folderToDelete = 'folder-b';
		const startPath = 'folder-a';
		const deleteHandle = deleteRecursive(startPath, folderToDelete);

		expectDeleteHandleCounts(deleteHandle, 9, 6, 3);
		deleteHandle.deleteAll();
		expectFilesMatch(startPath, mockStructure[startPath], folderToDelete);
	});

	it('Can recursively delete multiple folders with contents', function(){
		const folderToDelete = 'folder-b';
		const deleteHandle = deleteRecursive('', folderToDelete);

		expectDeleteHandleCounts(deleteHandle, 15, 10, 5);
		deleteHandle.deleteAll();
		expectFilesMatch('', mockStructure, folderToDelete);
		expectFilesMatch('folder-a', mockStructure['folder-a'], folderToDelete);
	});

	it('Can delete a deep folder', function(){
		const folderToDelete = 'deep-folder';
		const deleteHandle = deleteRecursive('folder-a', folderToDelete);

		expectDeleteHandleCounts(deleteHandle, 3, 2, 1);
		deleteHandle.deleteAll();
		const expectedStructure = mockStructure['folder-a']['folder-b']['folder-d'];
		expectFilesMatch('folder-a/folder-b/folder-d', expectedStructure, folderToDelete);
	});

	it('Can not delete a deep folder due to to maxDepth option', function(){
		const folderToDelete = 'deep-folder';
		const deleteHandle = deleteRecursive('folder-a', folderToDelete, {maxDepth:1});

		expectDeleteHandleCounts(deleteHandle, 0, 0, 0);
		deleteHandle.deleteAll();
		const expectedStructure = mockStructure['folder-a']['folder-b']['folder-d'];
		expectFilesMatch('folder-a/folder-b/folder-d', expectedStructure, null);
	});
});
