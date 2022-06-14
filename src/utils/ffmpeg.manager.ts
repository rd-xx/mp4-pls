import { fileManager } from '../index';
import ffmpeg from 'fluent-ffmpeg';
import { sep } from 'path';

export default class FfmpegManager {
	inputFiles: typeof fileManager['inputFiles'] = [];

	async convertFile(file: typeof this['inputFiles'][0]): Promise<string> {
		const outputName = file.path
			.replace(`${sep}input${sep}`, `${sep}output${sep}`)
			.replace(file.extension as string, '.');

		return new Promise((resolve, reject) => {
			ffmpeg(file.path)
				.outputOptions(['-crf 18', '-q:a 100'])
				.output(outputName + 'mp4')
				.output(outputName + 'mp3')
				.on('error', (err) => reject(err))
				.on('end', () => resolve(outputName))
				.run();
		});
	}
}
