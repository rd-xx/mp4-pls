import ConsoleManager from './utils/console.manager.js';
import FileManager from './utils/file.manager.js';
import fsExtra, { pathExists } from 'fs-extra';
import ffmpeg from 'fluent-ffmpeg';
// import prompts from 'prompts';
import { join } from 'path';

const { readJson } = fsExtra, // it throws an error if I don't do this
	rootPath = process.cwd();

globalThis.paths = {
	root: rootPath,
	input: join(rootPath, 'input'),
	output: join(rootPath, 'output'),
	ffmpeg: join(rootPath, 'ffmpeg', 'bin', 'ffmpeg.exe')
};
globalThis.version = (await readJson(join(rootPath, 'package.json'))).version;
globalThis.canProceed = true;
globalThis.printedLinesLength = [];
globalThis.loaders = [];

console.log = function (message: unknown) {
	if (message === undefined) {
		process.stdout.write('\n');
		globalThis.printedLinesLength.push('\n'.length);
	} else {
		const msg = String(message);
		process.stdout.write(msg + '\n');
		for (const line of msg.split('\n'))
			globalThis.printedLinesLength.push(line.length);
	}
};

async function until(conditionFunction: () => boolean): Promise<void> {
	function poll(resolve: () => void): void {
		if (conditionFunction()) resolve();
		else setTimeout(() => poll(resolve), 100);
	}

	return new Promise(poll);
}

const fileManager = new FileManager();
await fileManager.ensureDirectories();

const consoleManager = new ConsoleManager(fileManager.firstTime);
await fileManager.ensureSetup();
await until(() => globalThis.canProceed === true);

const ffmpegExists = await pathExists(globalThis.paths.ffmpeg);
if (!ffmpegExists)
	consoleManager.printSoftError(
		'You have to download ffmpeg first in order to use this.'
	);
else ffmpeg.setFfmpegPath(globalThis.paths.ffmpeg);
await until(() => globalThis.canProceed === true);

// const response = await prompts({
// 	name: 'formats',
// 	type: 'multiselect',
// 	message: 'Which formats do you want to convert your files to?',
// 	choices: [
// 		{ title: 'mp4', value: 'mp4', selected: true },
// 		{ title: 'mp3', value: 'mp3', selected: true },
// 		{ title: 'webm', value: 'webm' },
// 		{ title: 'avi', value: 'avi' }
// 	]
// });

consoleManager.printInputFolder();
fileManager.getInputFiles();

// for (const file of fileManager.inputFiles)
// 	for (const format of response.formats) {
// 		const outputFileName = `${file.split('.')[0]}.${format}`;
// 		consoleManager.printConverting(file, outputFileName);
// 		await ffmpeg(join(globalThis.paths.input, file))
// 			.output(join(globalThis.paths.output, outputFileName))
// 			.on('error', (err: Error) => {
// 				consoleManager.printSoftError(err.message);
// 				globalThis.canProceed = false;
// 			})
// 			.on('end', () => {
// 				consoleManager.printConverted(file, outputFileName);
// 				fileManager.moveFile(file, outputFileName);
// 			})
// 			.run();
// 	}

export { fileManager, consoleManager };
