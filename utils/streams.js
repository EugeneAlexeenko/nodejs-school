const { Readable, Transform } = require('stream');
const fs = require('fs');
const { EOL } = require('os');
const pathModule = require('path');
const csvjson = require('csvjson');
const program = require('commander');
const chalk = require('chalk');

const { log } = console;

/**
 * Function to reverse string data
 * - from: process.stdin
 * - to:   process.stdout
 */
const reverse = (text) => {
  if (!text) {
    log(chalk.red('Nothing to process. Please provide text.'));
    process.exit();
  }

  const readStream = new Readable({
    read() {
      readStream.push(text);
      readStream.push(EOL);
      readStream.push(null);
    },
  });

  const reverseTransform = new Transform({
    transform(chunk, encoding, callback) {
      this.push(chunk.toString().split('').reverse().join(''));
      callback();
    },
  });

  readStream
    .pipe(reverseTransform)
    .pipe(process.stdout);
};

/**
 * Function to convert data from process.stdin
 * to upper-cased data on process.stdout
 */
const transform = (text) => {
  if (!text) {
    log(chalk.red('Nothing to process. Please provide text.'));
    process.exit();
  }

  const readStream = new Readable({
    read() {
      readStream.push(text);
      readStream.push(EOL);
      readStream.push(null);
    },
  });

  const upperCaseTransform = new Transform({
    transform(chunk, encoding, callback) {
      this.push(chunk.toString().toUpperCase());
      callback();
    },
  });

  readStream
    .pipe(upperCaseTransform)
    .pipe(process.stdout);
};

/**
 * Function that uses fs.createReadStream() to pipe the given file
 * provided by --file option to process.stdout.
 */
const outputFile = (file) => {
  if (!file) {
    log(chalk.red('No file provided'));
    log('Usage: \tstreams --action outputFile --file fileToOutput');
    process.exit();
  }

  log('File to read:', file);

  if (!fs.existsSync(file)) {
    log(chalk.red('Provided file doesn\'t exist'));
    process.exit();
  }

  const readStream = fs.createReadStream(file);

  readStream.pipe(process.stdout);
};

/**
 * Function to convert file provided by --file option
 * from csv to json and output data to process.stdout.
 * Function also checks that the passed file name is valid.
 */
const convertFromFile = (file) => {
  if (!file) {
    log(chalk.red('No file provided'));
    log('Usage: streams --action convertFromFile --file fileToConvert');
    process.exit();
  }

  if (!fs.existsSync(file)) {
    log(chalk.red('Provided file doesn\'t exist'));
    process.exit();
  }

  if (pathModule.extname(file) !== '.csv') {
    log(chalk.red('Wrong file format. Only csv is supported.'));
    process.exit();
  }

  log('File to be converted:', file);

  const readStream = fs.createReadStream(file);
  const writeStream = process.stdout;
  const toObject = csvjson.stream.toObject();
  const stringify = csvjson.stream.stringify();

  readStream
    .pipe(toObject)
    .pipe(stringify)
    .pipe(writeStream);
};

/**
 * Function that convert file provided by --file option
 * from csv to json and output data to a result file
 * with the same name but json extension.
 * Function check that the passed file name is valid
 * and use fs.createWriteStream additionally.
 */
const convertToFile = (file) => {
  if (!file) {
    log(chalk.red('No file provided'));
    log('Usage: streams --action convertFromFile --file fileToConvert');
    process.exit();
  }

  if (!fs.existsSync(file)) {
    log(chalk.red('Provided file doesn\'t exist'));
    process.exit();
  }

  if (pathModule.extname(file) !== '.csv') {
    log(chalk.red('Wrong file format. Only csv is supported.'));
    process.exit();
  }

  const fileDetails = pathModule.parse(file);
  const readStream = fs.createReadStream(file);
  const writeStream = fs.createWriteStream(`${fileDetails.dir}/${fileDetails.name}.json`);
  const toObject = csvjson.stream.toObject();
  const stringify = csvjson.stream.stringify();

  readStream
    .pipe(toObject)
    .pipe(stringify)
    .pipe(writeStream);
};

/**
 * Function uses extra parameter --path (-p as a shortcut).
 *
 * It does the following:
 * a. Grab all css files from the given path provided by --path option.
 * b. Concat them into one (big) css file.
 * c. Add contents of './nodejs-homework3.css' to the end of the result file.
 * d. Save the output in the file called bundle.css placed in the same provided path.
 */
const cssBundler = (path) => {
  if (!path) {
    log(chalk.red('\nPlease provide path'));
    log('Usage: streams --action cssBundler --path path');
    process.exit();
  }

  let files = fs.readdirSync(path);

  if (files.includes('bundle.css')) {
    log('Previous bundle.css detected. Deleting...');
    fs.unlinkSync(`${path}/bundle.css`);
    log('Done...');

    files = fs.readdirSync(path);
  }

  log(`Files to process: ${files}`);

  const writeStream = fs.createWriteStream(`${path}/bundle.css`, { flags: 'a' });

  files.forEach((file) => {
    const readStream = fs.createReadStream(`${path}/${file}`);

    readStream.pipe(writeStream);
  });

  // append 'nodejs-homework3.css' to bundle
  const readStream = fs.createReadStream('./nodejs-homework3.css');
  readStream.pipe(writeStream);

  log('Bundle has been created successfully.');
};

// Main
program
  .version('0.1.0')
  .option('-a, --action <action>', 'Provide action')
  .option('-f, --file <file>', 'Provide file to process')
  .option('-p, --path <file>', 'Provide path to process');

// custom help section
program.on('--help', () => {
  log(chalk.yellow('\nExample usage: '));
  log('\nTo reverse a string:');
  log(chalk.green('\tstreams --action reverse textToReverse'));
  log('To make string uppercase');
  log(chalk.green('\tstreams --action transform textToTransform'));
  log('To pipe file to stdout');
  log(chalk.green('\tstreams --action outputFile --file fileToOutput'));
  log('To pipe parsed csv to stdout');
  log(chalk.green('\tstreams --action convertFromFile --file fileToConvert'));
  log('To convert csv to json file');
  log(chalk.green('\tstreams --action convertToFile --file file'));
  log('To create a bundle of css files');
  log(chalk.green('\tstreams --action cssBundler --path path'));
});

program.parse(process.argv);

const { action, file, path } = program;
const text = program.args[0];

// define possible actions
const actions = {
  reverse: () => reverse(text),
  transform: () => transform(text),
  outputFile: () => outputFile(file),
  convertFromFile: () => convertFromFile(file),
  convertToFile: () => convertToFile(file),
  cssBundler: () => cssBundler(path),
};

// check if provided action is valid
if (!(action in actions)) {
  log(chalk.red('\nThe provided action is invalid. Please provide correct action. See usage below.\n'));
  program.help();
}

// call selected action
actions[action]();
