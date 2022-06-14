import kleur from 'kleur';
import tree from 'tree-node-cli';

const { gray, cyan, yellow } = kleur; // it throws an error if I don't do this

export default class ConsoleManager {
	#canPrint: boolean;
	#firstTime: boolean;

	constructor(firstTime: boolean) {
		this.#firstTime = firstTime;
		this.#canPrint = true;

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
		if (this.#canPrint) {
			const fileTree = tree(globalThis.paths.input);
			console.log(fileTree);
		}
	}

	stopPrinting() {
		this.#canPrint = false;

		process.stdout.destroy();
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
