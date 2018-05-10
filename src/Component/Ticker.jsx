import React from 'react'
import axios from 'axios'
import io from 'socket.io-client'


const CRYPTOCOMPARE_API = "https://streamer.cryptocompare.com/"

// const COINMARKET_API = "https://api.coinmarketcap.com/v1/ticker/"
const COINMARKET_API = "https://koinex.in/api/ticker"


class Ticker extends React.Component {

    constructor() {
        super()
        this.state = {
            coins: []

        }
    }

    componentWillMount() {
        this.getAllCoins()
    }

    getAllCoins = () => {
        // Get all available coins from CoinMarketCap API.
        axios.get(COINMARKET_API).then((response) => {
            if (response.status === 200) {

                const myObject = response.data.stats.inr

                var arr = [];

                for (var key in myObject) {
                    arr.push(myObject[key]);
                }

                // console.log(arr)

                let coins = {}
                arr.map((coin) => {
                    coins[coin.currency_short_form] = coin
                    return null
                })

                this.setState({"coins": coins})
                this.subscribeCryptoStream()
            }
        })
    }

    subscribeCryptoStream = () => {
        // Subscribe to CryptoCompare websocket API.

        let subs = []
        let cryptoIO = io.connect(CRYPTOCOMPARE_API)

        Object.keys(this.state.coins).map((key) => {
            subs.push("5~CCCAGG~" + key + "~USD")
            return null
        })

        cryptoIO.emit("SubAdd", {"subs": subs})
        cryptoIO.on("m", (message) => {
            this.updateCoin(message)
        })
    }

    updateCoin = (message) => {
        // Update coin with recent data from CryptoCompare websocket API.

        message = message.split("~")
        let coins = Object.assign({}, this.state.coins)

        if ((message[4] === "1") || (message[4] === "2")) {

            if (message[4] === "1") {
                coins[message[2]].goUp = true
                coins[message[2]].goDown = false
            }
            else if (message[4] === "2") {
                coins[message[2]].goUp = false
                coins[message[2]].goDown = true
            }
            else {
                coins[message[2]].goUp = false
                coins[message[2]].goDown = false
            }

            coins[message[2]].price_usd = message[5]
            this.setState({"coins": coins})

            /*
             Reset coin status after short interval. This is needed to reset
             css class of tick animation when coin's value goes up or down again.
             */
            setTimeout(() => {
                coins = Object.assign({}, this.state.coins)
                coins[message[2]].goUp = false
                coins[message[2]].goDown = false
                this.setState({"coins": coins})
            }, 500)

        }
    }

    getTickStyle = (coin) => {
        // Return css style based on coin status.
        if (coin.goUp) {
            return " tickGreen "
        } else if (coin.goDown) {
            return " tickRed "
        } else {
            return " "
        }
    }


    render() {
        // console.log(this.state)
        return (
            <div>
                <div className="container-fluid">
                    <div className="row mt-5">


                        <table className="table table-bordered table-hover mt-5">
                            <thead>
                            <tr>
                                <th>ASSETS</th>
                                <th>LAST PRICE (INR)</th>
                                <th>LOWEST ASK (INR)</th>
                                <th>HIGHEST BID(INR)</th>
                                <th>CHANGE (24 H)</th>
                                <th>VOLUME (24 H)</th>
                            </tr>
                            </thead>

                            <tbody>

                            {
                                Object.keys(this.state.coins).map((key, index) => {
                                    let coin = this.state.coins[key]

                                    // console.log(coin.max_24hrs - coin.max_24hrs)

                                    const a = parseInt(coin.max_24hrs)
                                    const b = parseInt(coin.min_24hrs)
                                    const total = ( a - b) / 100
                                    console.log(a, '+', b, '+', total)


                                    return (
                                        <tr key={ index }>
                                            <td>{ coin.currency_full_form }</td>
                                            <td className={"stock " + this.getTickStyle(coin) }>{coin.last_traded_price}</td>
                                            <td>{coin.lowest_ask}</td>
                                            <td>{coin.highest_bid}</td>
                                            <td></td>
                                            <td>{coin.vol_24hrs}</td>
                                        </tr>

                                    )
                                })
                            }


                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }
}


export default Ticker
