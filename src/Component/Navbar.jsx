import React, {Component} from 'react'

class Navbar extends Component {


    render() {
        return (
            <React.Fragment>
                <nav className="bg-dark bg-black-alpha pt-2 pb-2 fixed-top">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-6 v-center">
                                <a className="nav-link text-white hover-warning"
                                   href="/"><strong>Ticker</strong></a>
                            </div>
                        </div>
                    </div>
                </nav>
            </React.Fragment>
        )
    }
}
export  default Navbar