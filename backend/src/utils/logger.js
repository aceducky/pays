const red = "\x1b[31m";
const green = "\x1b[32m";
const yellow = "\x1b[33m";
const reset = "\x1b[0m";

const info = (context, ...args) => {
  console.log(`${green}[INFO] [${context}]${reset}`, ...args);
};
const warn = (context, ...args) => {
  console.log(`${yellow}[WARN] [${context}]${reset}`, ...args);
};
const error = (context, ...args) => {
  console.log(`${red}[ERROR] [${context}]${reset}`, ...args);
};

const logger = {
  info,
  warn,
  error,
  infodb,
  infoexpress,
};

export default logger;
