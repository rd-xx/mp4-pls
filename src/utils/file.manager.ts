import fsExtra, { Dirent } from 'fs-extra';
import { join, parse } from 'path';

const { pathExists, ensureDir, move, readdir } = fsExtra; // it throws an error if I don't do this

export default class FileManager {
	firstTime!: boolean;
	inputFiles: Array<{ name: string; extension: string | null; path: string }> =
		[];

	constructor() {
		this.ensureDirectories();
	}

	async ensureDirectories() {
		this.firstTime = !(await pathExists(globalThis.paths.input));

		await ensureDir(globalThis.paths.input);
		await ensureDir(globalThis.paths.output);
	}

	async checkInputFiles() {
		const files = await readdir(globalThis.paths.input, {
			withFileTypes: true
		});

		for (const file of files)
			this.inputFiles.push(this.parseDirent(file, 'input'));
	}

	parseDirent(
		file: Dirent,
		path: 'input' | 'output',
		dir?: string
	): typeof this['inputFiles'][0] {
		return {
			name: file.name.replace(parse(file.name).ext, ''),
			extension: parse(file.name).ext || null,
			path: join(globalThis.paths[path], dir || file.name, dir ? file.name : '')
		};
	}

	async moveFile(inputFileName: string, outputFileName: string) {
		await move(
			join(globalThis.paths.input, inputFileName),
			join(globalThis.paths.output, outputFileName)
		);
	}
}
