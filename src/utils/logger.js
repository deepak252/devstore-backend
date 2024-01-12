export default class Logger {
  constructor(name) {
    this.name = name; //module / file
  }

  info = (inf, tag) => {
    console.info(`INFO: ${this.name ?? ''}->${tag ?? ''}: `, inf);
  };
  log = (msg, tag) => {
    console.log(`LOG: ${this.name ?? ''}->${tag ?? ''}: `, msg);
  };
  error = (err, tag) => {
    console.error(`ERROR: ${this.name ?? ''}->${tag ?? ''}: `, err);
  };
}
