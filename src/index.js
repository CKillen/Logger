
class logger42 {
  constructor(api, flag, { headers, logColors = {}, sendInterval, storageName, storageSize }) {
    this.api = api || 'http://localhost:5000';
    this.flag = flag || 'dev';
    this.sendInterval = sendInterval || 60000;
    this.storageName = storageName || 'logger-42_logs';
    this.storageSize = storageSize || 150000;
    this.apiInterval = null;
    this.headers = { 
      ...headers,
      'Content-Type': 'application/json'
    } || { 
      'Content-Type': 'application/json'
    };
    this.logColors = {
      log: logColors.log || '#9DAB86',
      warn: logColors.warn ||'#FFE45E',
      error: logColors.error ||'#FF686B',
      info: logColors.info ||'#95B8D1',
      debug: logColors.debug ||'#B4846C',
    };
    this.configureConsole(this);
    if(flag === 'production' || flag === 'test') {
      this.apiInterval = setInterval(this.sendToApi, this.sendInterval);
      this.sendOversizedLogs();
    }
  }

  configureConsole = (log42) => {
    let console = (function(oldCons) {
      return {
        log: function(...text) {
          log42.handleLogs(oldCons, 'log', ...text);
        },
        warn: function(...text) {
          log42.handleLogs(oldCons, 'warn', ...text);
        },
        error: function(...text) {
          log42.handleLogs(oldCons, 'error', ...text);
        },
        info: function(...text) {
          log42.handleLogs(oldCons, 'info', ...text);
        },
        debug: function(...text) {
          log42.handleLogs(oldCons, 'debug', ...text)
        }
      }
    }(window.console))

    window.console = console;
    return;
  }

  prettyLog = (type) => {
    return `background-color: ${this.logColors[type]}; padding: 2px 7px; border-radius: 10px;`;
  }

  handleLogs = (oldCons, type, ...text) => {
    if(this.flag === "test") {
      this.customLog(oldCons, type, ...text);
      this.handleExternalLogging(type, ...text)
    }
    else if(this.flag === "dev") {
      this.customLog(oldCons, type, ...text);
    } 
    else if(this.flag === "production") {
      this.handleExternalLogging(type, ...text)
    } else {
      oldCons[type](...text)
    }
  }

  handleExternalLogging = (type, ...text) => {
    let logs = this.log(type, ...text);
    this.appendToLocalStorage(logs)
    this.sendOversizedLogs();
  }

  getLastLineNumber = (stack) => {
    const end = stack.lastIndexOf(":"); 
    const start = stack.lastIndexOf(":", end - 1) + 1;
    return stack.substring(start, end);
  }

  getLastFilename = (stack) => {
    const end = stack.lastIndexOf(":", stack.lastIndexOf(":") - 1);
    const start = stack.lastIndexOf("/", end) + 1;
    return stack.substring(start, end);
  }

  customLog = (oldCons, type, ...text) => {
    let lineInfo = new Error().stack;
    let file = `File: ${this.getLastFilename(lineInfo)}`;
    let lineNumber = `Line: ${this.getLastLineNumber(lineInfo)}`;
    oldCons.log(`%c${type.toUpperCase()} | ${file} | ${lineNumber} \n`, this.prettyLog(type), ...text)

  }

  sendOversizedLogs = () => {
    if(this.checkLogSize()) {
      clearInterval(this.apiInterval);
      this.apiInterval = setInterval(this.sendToApi, this.sendInterval);
      this.sendToApi();
    }
  }

  checkLogSize = () => {
    let storageItem = localStorage.getItem(this.storageName)
    let itemSize = new Blob([storageItem]).size;
    return itemSize > this.storageSize;
  }

  sendToApi = () => {
    let storageItem = localStorage.getItem(this.storageName);
    if(storageItem !== null) {
      fetch(this.api, {
        method: 'POST',
        body: storageItem,
        headers: this.headers,
      })
      .catch(error => console.error(error))
      //AJAX goes here, if no url set error out
      localStorage.removeItem(this.storageName);
    }
  }

  appendToLocalStorage = (logs) => {
    let oldLogs = localStorage.getItem(this.storageName);
    let storageLogs = this.formatLogsForLocalStorage(oldLogs, logs); 
    localStorage.setItem(this.storageName, JSON.stringify(storageLogs));
  }

  formatLogsForLocalStorage = (oldLogs, newLogs) => {
    let storageLogs = [];
    if(oldLogs !== null) {
      let parsedLogs = JSON.parse(oldLogs);
      storageLogs = [
        ...parsedLogs,
        newLogs 
      ]
    } else {
      storageLogs = [ newLogs ]
    }
    return storageLogs;
  }

  log = (type, ...text) => {
    let information = {
      time: Date.now(),
      type: type,
      log: [],
    }

    for(let i = 0; i < text.length; i++) {
      information.log.push(this.formatLogData(text[i]));
    }

    return information;
  }

  formatLogData = (text) => {
    let logs = [];
    if(this.isError(text)) {
      logs.push(convertErrorToObject(text));
    } else if(typeof text === "function") {
      logs.push(`Function named ${text.name}`)
    } else if(typeof text === "symbol") {
      logs.push(`Symbol: ${text.description}`)
    } else {
      logs.push(text)
    } 
    return logs;
  }

  isError = (e) => {
    return e && e.stack && e.message && typeof e.stack === 'string' 
      && typeof e.message === 'string';
  }

  convertErrorToObject = (error) => {
    let errorParts = {
      name: error.name,
      columnName: error.columnName,
      fileName: error.fileName,
      lineNumber: error.lineNumber,
      message: error.message,
      stack: error.stack,
    }
    return errorParts;
  }
}
