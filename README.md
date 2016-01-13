# Socket.io Proxy Boilerplate
An example of using `http-proxy` to proxy WebSocket requests to a separate server.


## Usage
- `npm install`
- `npm start`  
(or `npm run start:dev` to use nodemon & show debug messages)
- Open http://localhost:4000 in the browser and check the console

To show debug messages in the browser use:
```js
localStorage.setItem( 'debug', 'socket.io-client:*,-socket.io-client:socket' );
```


## Testing
To verify that sockets are being used instead of polling, open the dev tools `Network` tab and find the request using the `websocket` protocol.  
It should have a status code of `101 Switching Protocols` and it's `frames` tab should show all the incoming `ping` messages from the server.


## Notes
- Socket.io will still do some (~3) initial polling requests before `upgrade`ing to a WebSocket connection.  
If you change the clientside `transports` to `transports : ['websocket']` these initial polling requests will stop but you lose the polling fallback.
