import tree from 'tree-node-cli';
import readline from 'readline';
import kleur from 'kleur';

const { gray, cyan, yellow, red, bgGreen, white, bold } = kleur; // it throws an error if I don't do this

export default class ConsoleManager {
	#firstTime: boolean;

	constructor(firstTime: boolean) {
		this.#firstTime = firstTime;
		this.welcome();
	}

	welcome() {
		console.clear();
		console.log(gray(`mp4-pls » ${globalThis.version}\n`));

		if (this.#firstTime) {
			console.log(
				"Seems like it's the first time you use " +
					cyan('mp4-pls') +
					'. Two folders have been created, ' +
					yellow('input') +
					' and ' +
					yellow('output') +
					'.'
			);

			console.log(
				'Just put the videos you want to convert in the ' +
					yellow('input') +
					' folder and let me do the rest.'
			);

			this.exit();
		}
	}

	printInputFolder() {
		const fileTree = tree(globalThis.paths.input);
		console.log('\n' + fileTree);
	}

	printSoftError(message: string) {
		if (globalThis.canProceed) console.log(red(message));
		this.exit();
	}

	printConverting(file: string): number {
		const loaderIndex = globalThis.loaders.length, // usually we'd do loaderIndex = globalThis.loaders.length - 1, but we add a new loader at the end of the array
			message = `Converting : ${cyan(file)}`;

		globalThis.loaders.push({
			loading: true,
			endX: this.#getMostRightColumn(message) - 9, // we have to substract 10 because of kleur and then add 1 because of the space between the message and the animation
			startY: this.#getNextLine() + 1,
			endY: this.#getNextLine() + this.#countLines(message)
		});

		console.log(message);
		this.#loadingAnimation(loaderIndex);
		return loaderIndex;
	}

	printConverted(file: string, loaderIndex: number) {
		const message = `Converted : ${cyan(file)}`,
			loader = globalThis.loaders[loaderIndex];

		globalThis.loaders[loaderIndex].loading = false;
		globalThis.loaders[loaderIndex].endX = loader.endX - 1;

		for (let i = loader.startY; i <= loader.endY; i++) {
			readline.cursorTo(process.stdout, 0, i);
			readline.clearLine(process.stdout, 0);
		}

		readline.cursorTo(process.stdout, 0, loader.startY);
		process.stdout.write(message);
		this.#loadingAnimation(loaderIndex);
	}

	#loadingAnimation(
		loaderIndex: number,
		chars = ['\\', '|', '/', '-'],
		delay = 200
	) {
		let x = 0;

		const intervalId = setInterval(function () {
			const loader = globalThis.loaders[loaderIndex];

			readline.cursorTo(process.stdout, loader.endX, loader.endY);
			if (loader.loading) {
				process.stdout.write(chars[x++]);
				x = x % chars.length;
			} else {
				process.stdout.write(bgGreen(white(bold(' OK '))));
				clearInterval(intervalId.ref());
			}
		}, delay);
	}

	#getNextLine() {
		let currentLines = 0;

		for (const lineLength of globalThis.printedLinesLength)
			currentLines += Math.floor(lineLength / process.stdout.columns) + 1; // could be 0, that's why we add 1

		return currentLines;
	}

	#countLines(str: string) {
		return Math.floor(str.length / process.stdout.columns) + 1;
	}

	#getMostRightColumn(str: string) {
		const lines = this.#countLines(str);

		str = str.replace(
			str.substring(0, process.stdout.columns * (lines - 1)),
			''
		);
		return str.length;
	}

	stopPrinting() {
		globalThis.canProceed = false;

		// process.stdout.destroy();
		process.stdin.setRawMode(true);
		process.stdin.resume();
	}

	async exit() {
		this.stopPrinting();
		console.log('\nPress any key to exit...');

		async function keypress(): Promise<void> {
			process.stdin.setRawMode(true);
			return new Promise((resolve) =>
				process.stdin.once('data', () => {
					process.stdin.setRawMode(false);
					resolve();
				})
			);
		}

		await keypress();
		process.stdin.once('data', process.exit(0));
	}
}
