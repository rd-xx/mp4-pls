import ConsoleManager from './utils/console.manager.js';
import FileManager from './utils/file.manager.js';
import ffmpeg from 'fluent-ffmpeg';
import fsExtra, { pathExists } from 'fs-extra';
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

const ffmpegExists = await pathExists(globalThis.paths.ffmpeg);
if (!ffmpegExists)
	throw new Error('You have to download ffmpeg first in order to use this.');
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

await fileManager.checkInputFolder();

export { fileManager, consoleManager };
