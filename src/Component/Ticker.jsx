import React, {Component} from 'react'

import axios from 'axios';
import io from 'socket.io-client'

const CRYPTOCOMPARE_API = "https://streamer.cryptocompare.com/"
const COINMARKET_API = "https://api.coinmarketcap.com/v1/ticker/"

class Ticker extends Component {

    constructor(props) {
        super(props)
        this.state = {
            Coins: {}
        }
    }

    componentDidMount = () => {
        this.getAllCoins();
    }

    getAllCoins = () => {
        axios.get(COINMARKET_API).then(result => {

            if (result.status === 200) {
                let Coins = {}
                result.data.map((coin) => {
                    Coins[coin.symbol] = coin
                    return null

                })
                this.setState({Coins})
                this.subscribeCryptoStream();
            }

        })
            .catch(function (error) {
                console.log(error);
            });

    }


    subscribeCryptoStream = () => {
        let subs = []
        let cryptoIO = io.connect(CRYPTOCOMPARE_API)


        Object.keys(this.state.Coins).map((key) => {
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

        return (
            <React.Fragment>
                <div className="container-fluid">
                    <div className="row">
                        {Object.keys(this.state.Coins).map((key, index) => {

                            let coin = this.state.Coins[key]
                            return (
                                <div key={ index } className="col-4 col-sm-3 col-xl-2 p-0">
                                    <div className={"stock " + this.getTickStyle(coin) }>
                                        <p className="text-white m-0">{ coin.symbol }</p>
                                        <p className="text-white m-0">{ coin.price_usd }</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

export  default Ticker