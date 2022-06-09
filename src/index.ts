import ConsoleManager from './utils/console.manager.js';
import FileManager from './utils/file.manager.js';
import ffmpeg from 'fluent-ffmpeg';
import fsExtra, { pathExists } from 'fs-extra';
import { join, sep } from 'path';

const { readJson, readdir, mkdir } = fsExtra, // it throws an error if I don't do this
	rootPath = process.cwd();

globalThis.paths = {
	root: rootPath,
	input: join(rootPath, 'input'),
	output: join(rootPath, 'output'),
	ffmpeg: join(rootPath, 'ffmpeg', 'bin', 'ffmpeg.exe')
};
globalThis.version = (await readJson(join(rootPath, 'package.json'))).version;

const ffmpegExists = await pathExists(globalThis.paths.ffmpeg);
if (!ffmpegExists)
	throw new Error('You have to ffmpeg first in order to use this.');
else ffmpeg.setFfmpegPath(globalThis.paths.ffmpeg);

async function until(conditionFunction: () => boolean): Promise<void> {
	function poll(resolve: () => void): void {
		if (conditionFunction()) resolve();
		else setTimeout(() => poll(resolve), 400);
	}

	return new Promise(poll);
}

const fileManager = new FileManager();
await until(() => fileManager.firstTime !== undefined);

const consoleManager = new ConsoleManager(fileManager.firstTime);
consoleManager.printInputFolder();

await fileManager.checkInputFiles();

const toConvert: typeof fileManager['inputFiles'] = [];
for (const file of fileManager.inputFiles) {
	const outputFiles = await readdir(globalThis.paths.output);
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

	await mkdir(join(globalThis.paths.output, outputName));

	if (file.extension) toConvert.push(file);
	else {
		const folderFiles = await readdir(file.path, { withFileTypes: true });
		for (const folderFile of folderFiles)
			toConvert.push(fileManager.parseDirent(folderFile, 'input', file.name));
	}
}

for (const file of toConvert) {
	const outputName = file.path
		.replace(`${sep}input${sep}`, `${sep}output${sep}`)
		.replace(file.extension as string, '.');

	ffmpeg(file.path)
		.outputOptions(['-crf 18', '-q:a 100'])
		.output(outputName + 'mp4')
		.output(outputName + 'mp3')
		.run();
}

export { fileManager, consoleManager };
