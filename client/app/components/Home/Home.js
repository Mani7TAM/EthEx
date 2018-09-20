import React, { Component } from 'react';
import 'whatwg-fetch';

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      counters: [],
      tx: [],
      ethAddress: '',
      balance: '',
      loadingBalance: false,
      loadingTx: false
    };

    this.newCounter = this.newCounter.bind(this);
    this.incrementCounter = this.incrementCounter.bind(this);
    this.decrementCounter = this.decrementCounter.bind(this);
    this.deleteCounter = this.deleteCounter.bind(this);

    this._modifyCounter = this._modifyCounter.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    fetch('/api/counters')
      .then(res => res.json())
      .then(json => {
        this.setState({
          counters: json
        });
      });
  }

  newCounter() {
    fetch('/api/counters', { method: 'POST' })
      .then(res => res.json())
      .then(json => {
        let data = this.state.counters;
        data.push(json);

        this.setState({
          counters: data
        });
      });
  }

  incrementCounter(index) {
    const id = this.state.counters[index]._id;

    fetch(`/api/counters/${id}/increment`, { method: 'PUT' })
      .then(res => res.json())
      .then(json => {
        this._modifyCounter(index, json);
      });
  }

  decrementCounter(index) {
    const id = this.state.counters[index]._id;

    fetch(`/api/counters/${id}/decrement`, { method: 'PUT' })
      .then(res => res.json())
      .then(json => {
        this._modifyCounter(index, json);
      });
  }

  deleteCounter(index) {
    const id = this.state.counters[index]._id;

    fetch(`/api/counters/${id}`, { method: 'DELETE' })
      .then(_ => {
        this._modifyCounter(index, null);
      });
  }

  _modifyCounter(index, data) {
    let prevData = this.state.counters;

    if (data) {
      prevData[index] = data;
    } else {
      prevData.splice(index, 1);
    }

    this.setState({
      counters: prevData
    });
  }

  handleChange(event) {
    this.setState({
      ethAddress: event.target.value,
      balance:'',
      tx:[]
    });
  }

  handleSubmit(event) {
    //alert('A name was submitted: ' + this.state.ethAddress);
    this.setState({
      balance:'',
      tx:[],
      loadingBalance: true ,
      loadingTx: true 
    });
    var url = 'https://api.etherscan.io/api?module=account&action=balance&address='+this.state.ethAddress+'&tag=latest&apikey=VK752U6MZCJH691RNJ1C2EA1VTDTNTAWJW';
    fetch(url,{}).then(res => res.json())
    .then(json => {
      console.log('json',json);
      this.setState({
        balance: json.result,
        loadingBalance:false
      });

      fetch('/api/address', { 
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({
            'address': this.state.ethAddress,
            'balance': json.result
          }) 
        })
        .then(res => res.json())
        .then(json => {
          console.log(json);
          // this.setState({
          //   addresses: json
          // });
        });
      //if(res.status);
    }, error =>{
      console.log('err',error);
    });

    var url = 'https://api.etherscan.io/api?module=account&action=txlist&address='+this.state.ethAddress+'&startblock=0&endblock=99999999&sort=asc&apikey=VK752U6MZCJH691RNJ1C2EA1VTDTNTAWJW';
    //var url = 'http://api-ropsten.etherscan.io/api?module=account&action=txlistinternal&address=0x48B0f9ad2bC924255608dbADb948d91c6Bbb805f&sort=asc&apikey=VK752U6MZCJH691RNJ1C2EA1VTDTNTAWJW';
    fetch(url,{}).then(res => res.json())
    .then(json => {
      console.log('json',json);
      fetch('/api/addressTransaction', { 
           method: 'POST',
           headers: {'Content-Type':'application/json'},
           body: JSON.stringify({
              'address': this.state.ethAddress,
              'data': json.result
           }) 
         })
         .then(res => res.json())
         .then(json => {
           console.log(json);
           this.setState({
             tx: json,
             loadingTx:false
           });
         });
    }, error =>{
      console.log('err',error);
    });

    // fetch('/api/address', { 
    //     method: 'POST',
    //     headers: {'Content-Type':'application/json'},
    //     body: JSON.stringify({
    //       'address': this.state.ethAddress
    //     }) 
    //   });
      // .then(res => res.json())
      // .then(json => {
      //   console.log(json);
      //   let data = this.state.ethAddress;
      //   data.push(json);

      //   this.setState({
      //     addresses: data
      //   });
      // });
    event.preventDefault();  
  }

  render() {
    return (
      <>
        {/* <p>Counters:</p>

        <ul>
          { this.state.counters.map((counter, i) => (
            <li key={i}>
              <span>{counter.count} </span>
              <button onClick={() => this.incrementCounter(i)}>+</button>
              <button onClick={() => this.decrementCounter(i)}>-</button>
              <button onClick={() => this.deleteCounter(i)}>x</button>
            </li>
          )) }
        </ul>

        <button onClick={this.newCounter}>New counter</button> */}
      <div className="container">
        <div className="row">
          <div className="col-md-6 col-md-offset-3">
            <div className="searchForm">
              <form onSubmit={this.handleSubmit}>
              <div className="form-group">
                <input className="form-control" type="text" value={this.state.ethAddress} onChange={this.handleChange} />
              </div>
              <div className="text-center">
                <button type="submit" className="btn btn-success">Submit</button>
              </div>  
              {/* <input className="btn btn-lg btn-success" type="submit" value="Submit" /> */}
              </form>    
            </div>
          </div>
        </div>

        <h2>Balance:</h2>
        {this.state.loadingBalance && <div className="loadingDiv"><img className="loadingImage" src="/assets/img/loading.gif" /></div> }
        {this.state.balance == '' && !this.state.loadingBalance && 
        <div className="noResultDiv"> No result! </div>}
        {this.state.balance != '' &&
        <div className="col-md-12">
          <div className="resultDiv">
            <table className="table table-responsive">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Address</th>
                  <th>Balance</th>
                </tr>  
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>{this.state.ethAddress}</td>
                  <td>{this.state.balance/10**18} Ether</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        }

         

      <h2>Transactions:</h2>
      { this.state.loadingTx && <div className="loadingDiv"><img className="loadingImage" src="/assets/img/loading.gif" /></div> }
      { this.state.tx && this.state.tx.length == 0 && !this.state.loadingTx && 
        <div className="noResultDiv"> No result! </div>}
      { this.state.tx && this.state.tx.length > 0 &&
      <div className="col-md-12">
        <div className="resultTxDiv">
        <table className="table table-responsive">
          <thead>
            <tr>
              <th>Block Number</th>
              <th>Timestamp</th>
              <th>Hash</th>
              <th>Nonce</th>
              <th>Block Hash</th>
              <th>Transaction Index</th>
              <th>From</th>
              <th>To</th>
              <th>Value</th>
              <th>Gas</th>
              <th>Gas Price</th>
              <th>Is Error</th>
              <th>Tx Receipt Status</th>
              <th>Input</th>
              <th>Contract Address</th>
              <th>Cumulative Gas Used</th>
              <th>Confirmations</th>
            </tr>
          </thead>
          <tbody>
          { this.state.tx[0].data.map((txSingle, i) => (
            <tr key={i}>
              <td>{txSingle.blockNumber}</td>
              <td>{txSingle.timeStamp}</td>
              <td>{txSingle.hash}</td>
              <td>{txSingle.nonce}</td>
              <td>{txSingle.blockHash}</td>
              <td>{txSingle.transactionIndex}</td>
              <td>{txSingle.from}</td>
              <td>{txSingle.to}</td>
              <td>{txSingle.value}</td>
              <td>{txSingle.gas}</td>
              <td>{txSingle.gasPrice}</td>
              <td>{txSingle.isError}</td>
              <td>{txSingle.txreceipt_status}</td>
              <td>{txSingle.input}</td>
              <td>{txSingle.contractAddress}</td>
              <td>{txSingle.cumulativeGasUsed}</td>
              <td>{txSingle.confirmations}</td>
            </tr>
          )) }
          </tbody>
        </table>
        </div>
      </div>
      }
    </div>
      {/* {JSON.stringify(this.state.tx)} */}
      </>
    );
  }
}

export default Home;
