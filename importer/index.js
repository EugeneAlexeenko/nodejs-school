import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import config from '../config/config.json';
import DirWatcher from '../dirwatcher';

import csvjson from 'csvjson';

const readFile = promisify(fs.readFile);

/**
 * Importer class.
 *
 * Listen for the 'dirwatcher:changed' event and started import of the csv file
 */
class Importer {
	constructor () {
		console.log('Importer module');

		DirWatcher.on('dirwatcher:changed', file => {
			console.log(`Importer: Message from dirwatcher. New file detected: ${file}`);

			// get full path to the imported file
			const filePath = path.resolve(path.join(config.watchPath, file));

			this.import(filePath)
				.catch(error => console.log(error));

			// uncomment line below to use sync version of import
			// this.importSync(filePath);
		});
	}

	/**
	 * Performs import of .csv file (async implementation)
	 * @param {String} file Path to the imported file
	 * @returns {Promise(<Object>)} Promise with csv converted to object
	 */
	import(file) {
		if (!Importer.isCsv(file)) {
			return Promise.reject(`Importer: Cannot import ${file}. Only '.csv' supported.`);
		}

		return readFile(file, {encoding: 'utf-8'})
			.then(data => {
				const csvObject = csvjson.toObject(data);

				console.log(`Importer: File ${file} has been successfully imported.`)
				console.log(csvObject);

				return csvObject;
			})
			.catch(error => {
				console.log(error);
			});
	}

	/**
	 * Performs import of .csv file (sync implementation)
	 * @param {String} file Path to the imported file.
	 * @returns {Object} csv converted to object
	 */
	importSync(file) {
		if (!Importer.isCsv(file)) {
			console.log(`Importer: Cannot import ${file}. Only '.csv' supported.`);

			return;
		}

		const data = fs.readFileSync(file, {encoding: 'utf-8'});
		const csvObject = csvjson.toObject(data);

		console.log(`Importer: File ${file} has been successfully imported.`)
		console.log(csvObject);

		return csvObject;
	}

	/**
	 * Check if a given file has .csv extension.
	 * @param {String} file fileName to check
	 * @returns {Boolean} true if file extension is .csv, false for other file extensions
	 */
	static isCsv(file) {
		return (path.extname(file) === '.csv');
	}
}

export default new Importer();
