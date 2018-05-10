import React, {Component} from 'react';
import './App.css';

import Ticker from './Component/Ticker'
import Navbar from './Component/Navbar'

class App extends Component {
    render() {
        return (
            <div className="App">
                <Ticker/>
                <Navbar/>
            </div>
        );
    }
}

export default App;
