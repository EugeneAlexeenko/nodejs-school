import EventEmitter from 'events';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);

/**
 * DirWatcher class.
 *
 * Provide ability to watch for a file changes in a given directory with given interval.
 * When file change detected, DirWatcher fired event 'dirwatcher:changed'.
 * This event can be used by another modules.
 *
 * [by requirement] Every file in directory should be processed only once
 */
class DirWatcher extends EventEmitter{
	constructor () {
		super();
		console.log('Dirwatcher module');

		this.processedFiles = [];

		this.on('dirwatcher:changed', file => {
			this.processedFiles.push(file)
		});
	}

	/**
	 * Run watch cycle for a given directory with given interval
	 * Fire 'dirwatcher:changed' event for a new files (files, that has not been processed)
	 * @param {String} pathToWatch Path to the watched directory
	 * @param {Number} delay Interval between watch cycles (in milliseconds)
	 */
	watch(pathToWatch, delay) {
		const timer = setInterval(() => {
			const files = readdir(pathToWatch)
				.then(files => {
					// console.log(`DirWatcher: processed files [ ${this.processedFiles} ]`);

					files.forEach(file => {
						if (!this.processedFiles.includes(file))
						this.emit('dirwatcher:changed', file)
					});
				});
		}, delay);
	}
}

export default new DirWatcher();
