# Logger42
A way to help developer get logs directly from their user in production 
environments, without changing their code flow. It also makes console commands
prettier in development.

# How it works
Logger42 overwrites the console window object, allowing your code to work 
without changes. To use Logger42, you simply include it in a script tag ABOVE 
your other scripts. Then at the top of your first js script decalre the logger42 
class

Logger42 stores the logs in local storage. If the logs get to big, 1.5mb by
default, or if a certain amount of time passes, 60 seconds by default, logger42
send the logs over to the specified link as json.

## Example
```javascript
new logger42(yourAPI, flag, options);
```

### Arguments

yourAPI is simply where you want the JSON sent, it defaults to 
'http://localhost:5000'
flag 
* "dev" = disable sending to api, the custom logs
* "production" = cancel all logs to console, send logs to provided link
* "test" = allow custom logs and send logs to provided link
* "none" = Use default logs and don't send logs to link
flag defaults to dev

### Default option object 
* sendInterval: 60000  //milliseconds
* storageName: 'logger-42_logs' //unique name for local storage
* storageSize 1.5 * 1000 * 1000 //bytes
* headers: { 'Content-Type': 'application/json' } //Will always append this
* logColors {   //This is an object with the following values
    *   log: '#9DAB86'
    *   warn: '#FFE45E'
    *   error: 'FF686B'
    *   info: '#95B8D1'
    *   debug: '#B4846C'
* }


# Logger42 Goals

---------------------------Version 0.5.0----------------------------------------

- [x] allow for basic console actions 
- [x] log basic levels (log, debug, warn, error, etc)
- [x] send logs to specified url at specified interval (default 60 seconds)
- [x] send logs if logs grow to over 1.5mb, including on startup
- [x] allow for flags dev, production, test (only console in dev, only send 
    in prod, both in test)
- [] plan for which user blocks localStorage
- [] dump logs to api when an error occurs (set onerror of window) 

---------------------------Version 0.8.0----------------------------------------

- [] like to add custom levels
- [] like to allow option for compressing sent files (Doesn't seem to 
    be needed, most cases will be below 200kb)
- [] like to allow all console actions
- [] like to dump snapshot (mousepos, keystrokes, etc) 
    -Would have to to block username/pass can easily look at text inputs 
- [x] like to make console have more info & look nicer (can't do as module)
- [] like to add pretty log stuff to prototypes


------------------------------ISSUES------------------------------------------
[] Occasionally line number and file is off (when function is through global
    scope it shows file declared from instead of correct file)
