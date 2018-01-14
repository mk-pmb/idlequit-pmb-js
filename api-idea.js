/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var idleQuit = require('idlequit-pmb'),
  idleWatcher = idleQuit({ idleLimitMinutes: 10,
    checkIntvMinutes: 5,    // default: idleLimitMinutes / 2
    hardkillSec: 10,        // default: false
    peerIdleMinutes: 5,     // default: false
    }),
  netLib = require('net'),
  streamServer = netLib.createServer(),
  peerSocket = netLib.connect({ host: 'localhost', port: 1234 });

idleWatcher.watchNetSocket(peerSocket);
// no 2nd arg = use this watcher's default options.
// returns function unwatch() {…} which also carries
// the current options as its properties.

idleWatcher.watchNetServer(streamServer, {
  closeOnIdle: true,        // default
  peerIdleMinutes: false,   // any connection
});

idleWatcher.on('beforeIdle', function (ev) {
  if (streamServer.waiting4peer) {
    ev.notIdle();   // once-per-event proxy to idleWatcher.buzzer();
  }
});

streamServer.on('almostDone', function () {
  idleWatcher.extendUntil(Date.now() + 5e3);
});
