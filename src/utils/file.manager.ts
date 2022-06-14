import { consoleManager } from '../index.js';
import fsExtra from 'fs-extra';
import { join } from 'path';
import glob from 'glob';

const { pathExists, ensureDir, move, readdir } = fsExtra; // it throws an error if I don't do this

export default class FileManager {
	firstTime!: boolean;
	inputFiles: string[] = [];

	constructor() {}

	async ensureDirectories() {
		this.firstTime = !(await pathExists(globalThis.paths.input));

		await ensureDir(globalThis.paths.input);
		await ensureDir(globalThis.paths.output);
	}

	async ensureSetup() {
		const inputFiles = await readdir(globalThis.paths.input),
			outputFiles = await readdir(globalThis.paths.output);

		if (!inputFiles.length && globalThis.canProceed)
			consoleManager.printSoftError('\nNo files in the input folder.');
		else if (outputFiles.length && globalThis.canProceed)
			consoleManager.printSoftError(
				'\nYour have to empty your output folder before continuing.'
			);
	}

	getInputFiles() {
		this.inputFiles = glob.sync(join(globalThis.paths.input, '**/*.*'));
	}

	async moveFile(inputFileName: string, outputFileName: string) {
		await move(
			join(globalThis.paths.input, inputFileName),
			join(globalThis.paths.output, outputFileName)
		);
	}
}
