import { consoleManager } from '../index.js';
import { ensureDir } from 'fs-extra';
import ffmpeg from 'fluent-ffmpeg';
import { parse } from 'path';

export default class FfmpegManager {
	async convertFile(
		file: string,
		format: 'mp4' | 'webm' | 'avi' | 'mp3'
	): Promise<string> {
		const outputName = file
			.replace(`/input/`, `/output/`)
			.replace(parse(file).ext, '.');

		await ensureDir(parse(outputName).dir);

		return new Promise((resolve, reject) => {
			ffmpeg(file)
				.outputOptions(['-crf 18', '-q:a 100'])
				.output(outputName + format)
				.on('error', (err) => {
					consoleManager.printSoftError(err.message);
					globalThis.canProceed = false;
					reject(err);
				})
				.on('end', () => resolve(outputName))
				.run();
		});
	}
}
