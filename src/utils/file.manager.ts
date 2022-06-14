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

	async checkInputFolder() {
		const inputFiles = await readdir(globalThis.paths.input, {
				withFileTypes: true
			}),
			outputFiles = await readdir(globalThis.paths.output),
			parsedInputFiles = inputFiles.map((file) =>
				this.parseDirent(file, 'input')
			);

		for (const file of parsedInputFiles) {
			let outputName = file.name;

			while (outputFiles.some((value) => value === outputName)) {
				const lastCharacter = outputName.slice(-1);

				// if string is a number
				if (/^-?\d+(\d+)*$/.test(lastCharacter))
					outputName =
						outputName.substring(0, outputName.length - 1) +
						(Number(lastCharacter) + 1);
				else outputName = file.name + ' 2';
			}

			if (file.extension) this.inputFiles.push(file);
			else {
				const folderFiles = await readdir(file.path, { withFileTypes: true });
				for (const folderFile of folderFiles)
					this.inputFiles.push(
						this.parseDirent(folderFile, 'input', file.name)
					);
			}
		}
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
