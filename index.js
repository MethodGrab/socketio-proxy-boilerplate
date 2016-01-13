'use strict';

var debug     = require( 'debug' )( 'spb:server' );
var http      = require( 'http' );
var httpProxy = require( 'http-proxy' );
var express   = require( 'express' );
var morgan    = require( 'morgan' );
var SocketIO  = require( 'socket.io' );



// ==================== OPTIONS ==================== //

var HOST        = 'localhost';
var API_PORT    = process.env.API_PORT || 4001;
var PROXY_PORT  = process.env.PROXY_PORT || 4000;
var SOCKET_PATH = 'ws';



// ==================== API SERVER ==================== //

var apiApp    = express();
var apiServer = new http.createServer( apiApp );
var io        = new SocketIO( apiServer, { path: `/${SOCKET_PATH}` } );

debug( `Socket.io path: ${io._path}` );

io.on( 'connection', function ( socket ) {
	debug( 'New socket connection (%s)', socket.conn.transport.name );

	socket.on( 'disconnect', function (  ) {
		debug( 'Socket disconnected' );
	});
});

apiApp.use( morgan( 'dev' ) );

apiApp.get( '/', function ( req, res ) {
	res.send( 'Hello from the API server' );
});

apiServer.listen( API_PORT, function (  ) {
	debug( `API server listening on http://${HOST}:${API_PORT}` );
});



// ==================== PROXY SERVER ==================== //

var proxyApp    = express();
var proxyServer = http.createServer( proxyApp );

var proxy = httpProxy.createProxyServer({
	target : `http://${HOST}:${API_PORT}`,
	// ws     : true,
});

proxyApp.use( morgan( 'dev' ) );

proxy.on( 'error', function ( err ) {
	// console.error( err.stack );
	debug( 'PROXY ERROR', err );
});

proxy.on( 'proxyReq', function ( proxyReq, req, res ) {
	debug( 'Proxy Request', proxyReq.path );
});

proxy.on( 'proxyReqWs', function ( proxyReqWs, req, res ) {
	debug( 'Proxy *WS* Request', proxyReqWs.path );
});


// serve the test page
proxyApp.get( '/', function ( req, res ) {
	res.sendFile( './index.html', { root: process.cwd() } );
});

// proxy non-socket requests
// * not required to proxy the socket.io connection *
// proxyApp.use( '/api', function ( req, res ) {
// 	proxy.web( req, res, { target: `http://${HOST}:${API_PORT}` } );
// });

// proxy the socket.io polling requests
proxyApp.use( `/${SOCKET_PATH}`, function ( req, res ) {
	proxy.web( req, res, { target: `http://${HOST}:${API_PORT}/${SOCKET_PATH}` } );
});

// proxy the socket.io WS requests
proxyServer.on( 'upgrade', function( req, socket, head ) {
	debug( '⚡️  ---------- SOCKET CONNECTION UPGRADING ---------- ⚡️ ' );
	proxy.ws( req, socket, head );
});

proxyServer.listen( PROXY_PORT, function (  ) {
	debug( `Proxy server listening on http://${HOST}:${PROXY_PORT}`, '\n' );
});
