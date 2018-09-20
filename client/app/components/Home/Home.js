import React, { Component } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import 'whatwg-fetch';
var ethereum_address_module = require('ethereum-address');

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      key: 1,
      counters: [],
      tx: [],
      int_tx:[],
      token_tx:[],
      contractData:[],
      address: '',
      ethAddress: '',
      balance: '',
      loadingBalance: false,
      loadingTx: false,
      loadingIntTx:false,
      loadingTokenTx:false,
      loadingContractData:false,
      errMsg:'',
      submitted:false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  componentDidMount() {
    // fetch('/api/counters')
    //   .then(res => res.json())
    //   .then(json => {
    //     this.setState({
    //       counters: json
    //     });
    //   });
  }

  handleChange(event) {
    this.setState({
      ethAddress: event.target.value,
      balance:'',
      //tx:[],
      //int_tx:[],
      //token_tx:[],
      errMsg:''
    });
  }

  handleSubmit(event) {
    event.preventDefault();  
    this.setState({errMsg:'',key:1});
    if(!ethereum_address_module.isAddress(this.state.ethAddress)) {
      this.setState({
        errMsg:'Not a valid ethereum address!'
      });
      return false;
    }
    //alert('A name was submitted: ' + this.state.ethAddress);
    this.setState({
      balance:'',
      tx:[],
      int_tx:[],
      token_tx:[],
      contractData:[],
      loadingBalance: true ,
      loadingTx: true,
      submitted:true 
    });
    var url = 'https://api.etherscan.io/api?module=account&action=balance&address='+this.state.ethAddress+'&tag=latest&apikey=6Q4J4FZZRCHPRB4JPES8N7SY1IS4HRGEET';
    fetch(url,{}).then(res => res.json())
    .then(json => {
      console.log('json',json);
      this.setState({
        address: this.state.ethAddress,
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

    var url = 'https://api.etherscan.io/api?module=account&action=txlist&address='+this.state.ethAddress+'&startblock=0&endblock=99999999&sort=asc&apikey=6Q4J4FZZRCHPRB4JPES8N7SY1IS4HRGEET';
    fetch(url,{}).then(res => res.json())
    .then(json => {
      for(var i = 0; i < json.result.length; i++) {
        delete json.result[i]['input'];
      }
      this.setState({
        tx: json.result,
        loadingTx:false
      });
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
          //  this.setState({
          //    tx: json,
          //    loadingTx:false
          //  });
         });
    }, error =>{
      console.log('err',error);
    });
  
  }

  handleSelect(key) {
    if(!ethereum_address_module.isAddress(this.state.ethAddress)) {
      this.setState({
        errMsg:'Not a valid ethereum address!'
      });
      return false;
    }
    this.setState({
      key: key
    });
    console.log(key);
    if(key == 2 && this.state.int_tx.length == 0 && this.state.ethAddress != '' && this.state.submitted ){
      this.setState({
        loadingIntTx: true,
      });
      var url = 'https://api.etherscan.io/api?module=account&action=txlistinternal&address='+this.state.ethAddress+'&sort=asc&apikey=6Q4J4FZZRCHPRB4JPES8N7SY1IS4HRGEET';
      fetch(url,{}).then(res => res.json())
      .then(json => {
        console.log(json);
        for(var i = 0; i < json.result.length; i++) {
          delete json.result[i]['input'];
        }
        this.setState({
          int_tx: json.result,
          loadingIntTx:false
        });
        fetch('/api/addressInternalTransaction', { 
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
            // this.setState({
            //   int_tx: json,
            //   loadingTx:false
            // });
          });
      }, error =>{
        console.log('err',error);
      });
    }
    else if(key == 3 && this.state.token_tx.length == 0 && this.state.ethAddress != '' && this.state.submitted){
      this.setState({
        loadingTokenTx: true,
      });
      var url = 'https://api.etherscan.io/api?module=account&action=tokentx&address='+this.state.ethAddress+'&startblock=0&endblock=999999999&sort=asc&apikey=6Q4J4FZZRCHPRB4JPES8N7SY1IS4HRGEET';
      fetch(url,{}).then(res => res.json())
      .then(json => {
        //console.log('json',json);
        for(var i = 0; i < json.result.length; i++) {
          delete json.result[i]['input'];
        }
        //console.log('json',json);
        this.setState({
          token_tx: json.result,
          loadingTokenTx:false
        });
        fetch('/api/addressTokenTransaction', { 
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
            // this.setState({
            //   token_tx: json,
            //   loadingTx:false
            // });
          });
      }, error =>{
        console.log('err',error);
      });
    }
    else if(key == 4 && this.state.contractData.length == 0 && this.state.ethAddress != '' && this.state.submitted){
      this.setState({
        loadingContractData: true,
      });
      var url = 'https://api.etherscan.io/api?module=contract&action=getsourcecode&address='+this.state.ethAddress+'&apikey=6Q4J4FZZRCHPRB4JPES8N7SY1IS4HRGEET';
      //var url = 'https://api.etherscan.io/api?module=contract&action=getabi&address='+this.state.ethAddress+'&apikey=6Q4J4FZZRCHPRB4JPES8N7SY1IS4HRGEET';
      fetch(url,{}).then(res => res.json())
      .then(json => {
        this.setState({
          contractData: json.result,
          loadingContractData:false
        });
        var contractAddress = false;
          for(var i = 0; i < json.result.length; i++) {
            if(json.result[i].ContractName != ''){
              contractAddress = true;    
            }
          }
        if(!contractAddress){
          return false;
        }
        fetch('/api/contractData', { 
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
            // this.setState({
            //   token_tx: json,
            //   loadingTx:false
            // });
          });
      }, error =>{
        console.log('err',error);
      });
    }
  }
  
  render() {
    return (
      <>
      <div className="container">
        <div className="row">
          <div className="col-md-6 col-md-offset-3">
            <div className="searchForm">
              <form onSubmit={this.handleSubmit}>
              <div className="form-group">
                <input required className="form-control" type="text" value={this.state.ethAddress} onChange={this.handleChange} />
                {this.state.errMsg != '' && <p className="text-center text-danger bg-warning">Error: {this.state.errMsg}</p>}
              </div>
              <div className="text-center">
                <button type="submit" className="btn btn-success">Submit</button>
              </div>  
              {/* <input className="btn btn-lg btn-success" type="submit" value="Submit" /> */}
              </form>    
            </div>
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-6 tableDiv">
            <table className="table table-responsive overview-table">
              <tbody>
                <tr><td className="p-0">Address</td><td  className="p-0">
                {this.state.loadingBalance && <img className="loadingImageSmall" src="/assets/img/loading.gif" /> }
                {this.state.balance != '' && <span>{this.state.address}</span>}
                {this.state.balance == '' && !this.state.loadingBalance && <span>-</span>} </td></tr>
                <tr><td className="p-0">Balance</td><td  className="p-0">
                  {this.state.loadingBalance && <img className="loadingImageSmall" src="/assets/img/loading.gif" /> }
                  {this.state.balance != '' && <span>{this.state.balance/10**18} Ether</span>} 
                  {this.state.balance == '' && !this.state.loadingBalance && <span>-</span>}  </td></tr>
              </tbody>  
            </table>
          </div>
        </div>
      
         
      <Tabs
        activeKey={this.state.key}
        onSelect={this.handleSelect}
        id="controlled-tab-example"
      >
        <Tab eventKey={1} title="Transactions">
        { this.state.loadingTx && <div className="loadingDiv"><img className="loadingImage" src="/assets/img/loading.gif" /></div> }
        { this.state.tx && this.state.tx.length == 0 && !this.state.loadingTx && 
          <div className="noResultDiv"> No result! </div>}
        { this.state.tx && this.state.tx.length > 0 &&
          <div className="resultTxDiv">
          <table className="table table-responsive">
            <thead>
              <tr>
                <th>Block Number</th>
                <th>From</th>
                <th>To</th>
                <th>Value</th>
                <th>Gas</th>
                <th>Gas Price</th>
                <th>Is Error</th>
                <th>Tx Receipt Status</th>
                {/* <th>Input</th> */}
                <th>Contract Address</th>
                <th>Cumulative Gas Used</th>
                <th>Confirmations</th>
                <th>Timestamp</th>
                <th>Hash</th>
                <th>Nonce</th>
                <th>Block Hash</th>
                <th>Transaction Index</th>
              </tr>
            </thead>
            <tbody>
            { this.state.tx.map((txSingle, i) => (
              <tr key={i}>
                <td>{txSingle.blockNumber}</td>
                <td>{txSingle.from}</td>
                <td>{txSingle.to}</td>
                <td>{txSingle.value/10**18} Ether</td>
                <td>{txSingle.gas}</td>
                <td>{txSingle.gasPrice}</td>
                <td>{txSingle.isError}</td>
                <td>{txSingle.txreceipt_status}</td>
                {/* <td>{txSingle.input}</td> */}
                <td>{txSingle.contractAddress}</td>
                <td>{txSingle.cumulativeGasUsed}</td>
                <td>{txSingle.confirmations}</td>
                <td>{txSingle.timeStamp}</td>
                <td>{txSingle.hash}</td>
                <td>{txSingle.nonce}</td>
                <td>{txSingle.blockHash}</td>
                <td>{txSingle.transactionIndex}</td>
              </tr>
            )) }
            </tbody>
          </table>
        </div>
        }
        </Tab>
        <Tab eventKey={2} title="Internal Txns">
        { this.state.loadingIntTx && <div className="loadingDiv"><img className="loadingImage" src="/assets/img/loading.gif" /></div> }
        { this.state.int_tx && this.state.int_tx.length == 0 && !this.state.loadingIntTx && 
          <div className="noResultDiv"> No result! </div>}
        { this.state.int_tx && this.state.int_tx.length > 0 &&
          <div className="resultTxDiv">
            <table className="table table-responsive">
              <thead>
                <tr>
                    <th>Block Number</th>
                    <th>Contract Address</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Value</th>
                    <th>Hash</th>
                    <th>Timestamp</th>
                    <th>Gas</th>
                    <th>Gas Used</th>
                    <th>Err Code</th>
                    <th>Is Error</th>
                    <th>Trace ID</th>
                    <th>Type</th>
                </tr>
              </thead>
              <tbody>
              { this.state.int_tx.map((txSingle, i) => (
                <tr key={i}>
                  <td>{txSingle.blockNumber}</td>
                  <td>{txSingle.contractAddress}</td>
                  <td>{txSingle.from}</td>
                  <td>{txSingle.to}</td>
                  <td>{txSingle.value/10**18} Ether</td>
                  <td>{txSingle.hash}</td>
                  <td>{txSingle.timeStamp}</td>
                  <td>{txSingle.gas}</td>
                  <td>{txSingle.gasUsed}</td>
                  <td>{txSingle.errCode}</td>
                  <td>{txSingle.isError}</td>
                  <td>{txSingle.traceId}</td>
                  <td>{txSingle.type}</td>
                </tr>
              )) }
              </tbody>
            </table>
          </div>
        }
        </Tab>
        <Tab eventKey={3} title="Token Txns">
        { this.state.loadingTokenTx && <div className="loadingDiv"><img className="loadingImage" src="/assets/img/loading.gif" /></div> }
        { this.state.token_tx && this.state.token_tx.length == 0 && !this.state.loadingTokenTx && 
          <div className="noResultDiv"> No result! </div>}
        { this.state.token_tx && this.state.token_tx.length > 0 &&
          <div className="resultTxDiv">
            <table className="table table-responsive">
              <thead>
                <tr>
                    <th>Block Number</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Value</th>
                    <th>Gas</th>
                    <th>Gas Price</th>
                    <th>Gas Used</th>
                    <th>Token Decimal</th>
                    <th>Token Name</th>
                    <th>Token Symbol</th>
                    <th>Contract Address</th>
                    <th>Cumulative Gas Used</th>
                    <th>Confirmations</th>
                    <th>Timestamp</th>
                    <th>Hash</th>
                    <th>Nonce</th>
                    <th>Block Hash</th>
                    <th>Transaction Index</th>
                </tr>
              </thead>
              <tbody>
              { this.state.token_tx.map((txSingle, i) => (
                <tr key={i}>
                  <td>{txSingle.blockNumber}</td>
                  <td>{txSingle.from}</td>
                  <td>{txSingle.to}</td>
                  <td>{txSingle.value/10**18} Ether</td>
                  <td>{txSingle.gas}</td>
                  <td>{txSingle.gasPrice}</td>
                  <td>{txSingle.gasUsed}</td>
                  <td>{txSingle.tokenDecimal}</td>
                  <td>{txSingle.tokenName}</td>
                  <td>{txSingle.tokenSymbol}</td>
                  <td>{txSingle.contractAddress}</td>
                  <td>{txSingle.cumulativeGasUsed}</td>
                  <td>{txSingle.confirmations}</td>
                  <td>{txSingle.timeStamp}</td>
                  <td>{txSingle.hash}</td>
                  <td>{txSingle.nonce}</td>
                  <td>{txSingle.blockHash}</td>
                  <td>{txSingle.transactionIndex}</td>
                </tr>
              )) }
              </tbody>
            </table>
          </div>
        }
        </Tab>

        <Tab eventKey={4} title="Code">
          <div className="resultTxDiv">
            
            { this.state.loadingContractData && <div className="loadingDiv"><img className="loadingImage" src="/assets/img/loading.gif" /></div> }
            { this.state.contractData && this.state.contractData.length == 0 && !this.state.loadingContractData && <div className="noResultDiv"> No result! </div>}
            { this.state.contractData && this.state.contractData.length > 0 &&
              <div>
                { this.state.contractData.map((data, i) => (
                <div key={i}>
                  { data.ContractName != '' &&  
                    <div>              
                      <div className="overview-div col-md-12">
                        <div className="col-md-6">
                        <table className="overview-table table table-responsive">
                        <tbody>
                          <tr> 
                            <td className="p-0">Contract Name</td>
                            <td className="p-0">{data.ContractName}</td>
                          </tr>
                          <tr>  
                            <td className="p-0">Compiler Version</td>
                            <td className="p-0">{data.CompilerVersion}</td>
                          </tr>
                          
                        </tbody>
                        </table>
                        </div>  
                        <div className="col-md-6">
                        <table className="overview-table table table-responsive">
                        <tbody> 
                          <tr>  
                            <td className="p-0">Optimization Used</td>
                            <td className="p-0">{data.OptimizationUsed}</td>
                          </tr>  
                          <tr>
                            <td className="p-0">Runs (Optimizer)</td>
                            <td className="p-0">{data.Runs}</td>
                          </tr>   
                          {/* <tr>
                            <td className="p-0">Constructor Arguments</td>
                            <td className="p-0">{data.ConstructorArguments}</td>
                          </tr>  
                          <tr>
                            <td className="p-0">Library</td>
                            <td className="p-0">{data.Library}</td>
                          </tr>
                          <tr>  
                            <td className="p-0">SwarmSource</td>
                            <td className="p-0">{data.SwarmSource}</td>
                          </tr>   */}
                        </tbody>
                        </table>
                        </div>
                      </div>  
                    <h5>Contract SourceCode <i className="glyphicon glyphicon-pencil"></i></h5>
                    <pre className="abiCode">{data.SourceCode}</pre>
                    <br/>
                    <h5>Contract ABI <i className="glyphicon glyphicon-cog"></i></h5>
                    <pre className="abiCode">{data.ABI}</pre>
                    <br/>
                    {/* { data.ConstructorArguments != '' &&      
                      <div>
                      <h5>Contract Creation Code <i className="glyphicon glyphicon-file"></i></h5>
                      <pre className="abiCode">{data.ConstructorArguments}</pre>
                      <br/>
                      </div>
                    } */}
                    <h5>Swarm Source <i className="glyphicon glyphicon-tasks"></i></h5>
                    <pre>{data.SwarmSource}</pre>
                  </div>
                }
                { data.ContractName == '' && 
                  <h3 className="text-center">Not a contract address!</h3>
                }
                </div>
                ))}
              </div>
            }

          </div>
        
        </Tab>

      </Tabs>
    </div>
      

      
      </>
    );
  }
}

export default Home;
