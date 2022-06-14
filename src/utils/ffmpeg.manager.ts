import ffmpeg from 'fluent-ffmpeg';
import { parse, sep } from 'path';

export default class FfmpegManager {
	inputFiles: string[] = [];

	async convertFile(
		file: string,
		format: 'mp4' | 'webm' | 'avi' | 'mp3'
	): Promise<string> {
		const outputName = file
			.replace(`${sep}input${sep}`, `${sep}output${sep}`)
			.replace(parse(file).ext, '.');

		return new Promise((resolve, reject) => {
			ffmpeg(file)
				.outputOptions(['-crf 18', '-q:a 100'])
				.output(outputName + format)
				.on('error', (err) => {
					globalThis.canProceed = false;
					reject(err);
				})
				.on('end', () => resolve(outputName))
				.run();
		});
	}
}
