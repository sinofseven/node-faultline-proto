# node-faultline-proto 

> [faultline](https://github.com/faultline/faultline) exception and error notifier for JavaScript.

## About
unofficial faultline library for nodejs.  
I made this becase I want this.

## Installation

Using npm:

```sh
npm install node-faultline-proto
```

## Usage

```js
var faultlineJs = require('node-faultline-proto');
var faultline = faultlineJs.createClient({
                  project: 'faultline-js', 
                  apiKey: 'xxxxXXXXXxXxXXxxXXXXXXXxxxxXXXXXX',
                  endpoint: 'https://xxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/v0',
                  notifications: [
                    {
                      type: 'slack',
                      endpoint: 'https://hooks.slack.com/services/XXXXXXXXXX/B2RAD9423/WC2uTs3MyGldZvieAtAA7gQq',
                      channel: '#random',
                      username: 'faultline-notify',
                      notifyInterval: 1,
                      threshold: 1,
                      timezone: 'Asia/Tokyo'
                    }
                  ]
                });
faultline.notify(new Error("test"));
```

## Integration

### handle excptions

The common use case for this module is to catch all 'uncaughtException' events on the process object and send them to Faultline.

```js
var faultlineJs = require('node-faultline-proto');
var faultline = faultlineJs.createClient({
                  project: 'faultline-js', 
                  apiKey: 'xxxxXXXXXxXxXXxxXXXXXXXxxxxXXXXXX',
                  endpoint: 'https://xxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/v0',
                  notifications: [
                    {
                      type: 'slack',
                      endpoint: 'https://hooks.slack.com/services/XXXXXXXXXX/B2RAD9423/WC2uTs3MyGldZvieAtAA7gQq',
                      channel: '#random',
                      username: 'faultline-notify',
                      notifyInterval: 1,
                      threshold: 1,
                      timezone: 'Asia/Tokyo'
                    }
                  ]
                });
faultline.handleExceptions();
throw new Error("test");
```

## References

- faultline-js is based on [airbrake/node-airbrake](https://github.com/airbrake/node-airbrake)
    - Node Airbrake is licensed under [The MIT License (MIT)](https://github.com/airbrake/node-airbrake/blob/master/LICENSE.md).

## License

MIT © Yuta Natsume

