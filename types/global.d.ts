/* eslint-disable no-var */
declare global {
	var paths: {
			root: string;
			input: string;
			output: string;
			ffmpeg: string;
		},
		version: number,
		canProceed: boolean,
		printedLinesLength: number[],
		loaders: {
			loading: boolean;
			// startX: number; // always 0
			endX: number;
			startY: number; // we have start and end because the messages could have more than 1 line
			endY: number;
		}[]; // loading === true means it is currently loading
}

export {};
