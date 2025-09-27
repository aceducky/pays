const bgRed = "\x1b[41m";
const bgGreen = "\x1b[42m";
const bgYellow = "\x1b[43m";
const fgWhite = "\x1b[37m";
const bold = "\x1b[1m";
const reset = "\x1b[0m";

const info = (context, ...args) => {
  console.log(`${bold}${bgGreen}${fgWhite}[INFO] [${context}]${reset}`, ...args);
};

const warn = (context, ...args) => {
  console.log(`${bold}${bgYellow}${fgWhite}[WARN] [${context}]${reset}`, ...args);
};

const error = (context, ...args) => {
  console.log(`${bold}${bgRed}${fgWhite}[ERROR] [${context}]${reset}`, ...args);
};

const logger = {
  info,
  warn,
  error,
};

export default logger;