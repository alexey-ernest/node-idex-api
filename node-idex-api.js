module.exports = function () {
    'use strict';
    const WebSocket = require('ws');
    const request = require('request');

    const api = (action, json = {}) => new Promise((resolve, reject) => {

        var url = 'https://api.idex.market/' + action;
        var options = {
          method: 'post',
          body: json,
          json: true,
          url: url
        }

        request(options, function (err, response, body) {
            if (err) {
                return reject(err);
            }

            if (response && response.statusCode !== 200) return reject(JSON.stringify(body));
            return resolve(body);
        });

    });

    return {
        returnTicker: async function returnTicker(ticker) {
            const json = { market: `${ticker}` }
            return await api(`returnTicker`, json)
        },
        returnTickers: async function returnTickers(ticker) {
            return await returnTicker()
        },
        return24Volume: async function return24Volume() {
            return await api(`return24Volume`)
        },
        returnOpenOrders: async function returnOpenOrders(market, address = null) {
            console.log({ market })
            return await api(`returnOpenOrders`, { market, address })
        },
        returnOrderBook: async function returnOrderBook(market) {
            return await api(`returnOrderBook`, { market })
        },
        returnTradeHistory: async function returnTradeHistory() {
            return await api(`returnTradeHistory`)
        },
        returnCurrencies: async function returnCurrencies() {
            return await api(`returnCurrencies`)
        },
        returnBalances: async function returnBalances() {
            return await api(`returnBalances`)
        },
        returnCompleteBalances: async function returnCompleteBalances() {
            return await api(`returnCompleteBalances`)
        },
        returnDepositsWithdrawals: async function returnDepositsWithdrawals() {
            return await api(`returnDepositsWithdrawals`)
        },
        returnOrderTrades: async function returnOrderTrades() {
            return await api(`returnOrderTrades`)
        },
        returnNextNonce: async function returnNextNonce(address) {
            return await api(`returnNextNonce`, { address })
        },
        returnContractAddress: async function returnContractAddress() {
            return await api(`returnContractAddress`)
        },
        order: async function order(payload) {
            return await api(`order`, payload)
        },
        trade: async function trade(payload) {
            return await api(`trade`, payload)
        },
        cancel: async function cancel(payload) {
            return await api(`cancel`, payload)
        },
        withdraw: async function withdraw(payload) {
            return await api(`withdraw`, payload)
        },
        
        // WebSocket live ticker updates
        subscribe: function subscribe(ticker) {
            const socket = new WebSocket('wss://api-cluster.idex.market');
            socket.on('message', message => console.log(message));

            //ws.on('pong', handleSocketHeartbeat); // Update timer & reconnect zombie sockets

            socket.on('error', error => {
                console.error('WebSocket error: ', error);
                socket.close();
            });

            socket.on('open', () => {
                setInterval(() => socket.ping(), 10000);
                socket.send(JSON.stringify({ subscribe: ticker }), error => {
                    if ( error ) {
                        console.error('WebSocket send error: ', error);
                        socket.close();
                    }
                });
            });
        },
      
        // Convert to sortable array. {"ETHBTC":{}} to [{symbol:"ETHBTC"}]
        obj_to_array: json => {
          let output = [];
          for ( let key in json ) {
            let obj = json[key];
            obj.symbol = key;
            output.push(obj);
          }
          return output;
        }
        
    }
}();
