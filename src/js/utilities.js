
//const Web3 = require('web3');
//const TruffleContract = require('truffle-contract');
////var web3;
//const ProvenanceArtifact = require('./build/contracts/Provenance.json');
//const TrackingArtifact = require('./build/contracts/Tracking.json');
//const ReputationArtifact = require('./build/contracts/Reputation.json');
//// transformer ce fichier en une classe afin de pouvoir l'exporter facilement
////const { ethers } = require("ethers");

utility = {

    web3Provider: null,
    contracts : {},
    producersAdd:{},


    connect: async function() {

      // Modern dapp browsers...
      if (window.ethereum) {
        utility.web3Provider = window.ethereum;
        try {
          // Request account access
          await ethereum.request({ method: "eth_requestAccounts" });
          const accounts = await ethereum.request({ method: "eth_accounts" });
          console.log(accounts);
          document.getElementById("connectButton").innerHTML = accounts[0];
        } catch (error) {
          console.log(error);
        }
        
      } 
      // Legacy dapp browser...
      else if(window.web3){
        utility.web3Provider = window.web3.currentProvider;
      }
      else {
        document.getElementById("connectButton").innerHTML =
          "Please install MetaMask";
      }
      web3 = new Web3(utility.web3Provider);
      
      $.getJSON('Provenance.json', function(data) {
        // Get the necessary contract artifact file and instantiate it with @truffle/contract
        var ProvenanceArtifact = data;
        utility.contracts.Provenance = TruffleContract(ProvenanceArtifact);

        // Set the provider for our contract
        utility.contracts.Provenance.setProvider(utility.web3Provider);
      });
      $.getJSON('Tracking.json', function(data) {
        // Get the necessary contract artifact file and instantiate it with @truffle/contract
        var TrackingArtifact = data;
        utility.contracts.Tracking = TruffleContract(TrackingArtifact);

        // Set the provider for our contract
        utility.contracts.Tracking.setProvider(utility.web3Provider);
      });
      $.getJSON('Reputation.json', function(data) {
        // Get the necessary contract artifact file and instantiate it with @truffle/contract
        var ReputationArtifact = data;
        utility.contracts.Reputation = TruffleContract(ReputationArtifact);

        // Set the provider for our contract
        utility.contracts.Reputation.setProvider(utility.web3Provider);
      });
    },
    
    // CONTRACT PROVENANCE

    addProducer: async function(name, phoneNo, cityState, country) {
      console.log(utility.contracts.Provenance)

        var ProvenanceInstance;
        web3.eth.getAccounts(function(error, accounts){
            if (error) {
              console.log(error);
            }
      
            var account = accounts[0];
      
            utility.contracts.Provenance.deployed().then(function(instance){
              ProvenanceInstance = instance;
      
              // Execute adopt as a transaction by sending account
              return ProvenanceInstance.addProducer(name, phoneNo, cityState, country ,{from: account});
            }).then(function(result){
              console.log(result);
              console.log("Producer successfull added to the blockchain");
              utility.allProducers();
            }).catch(function(err){
              console.log(err);
            });
        });
    },

    removeProducer: async function(address){
        var ProvenanceInstance;
        web3.eth.getAccounts(function(error, accounts){
            if (error) {
              console.log(error);
            }
      
            var account = accounts[0];
      
            utility.contracts.Provenance.deployed().then(function(instance){
              ProvenanceInstance = instance;
      
              // Execute adopt as a transaction by sending account
              return ProvenanceInstance.removeProducer(address, {from: account});
            }).then(function(result){
              console.log(result)
              utility.allProducers();
              console.log("Producer successfull removed to the blockchain");
            }).catch(function(err){
              console.log(err.message)
            });
        });
    },

    findProducer: async function(address){

        var ProvenanceInstance;
        accounts = web3.eth.getAccounts()
    
          
        ProvenanceInstance = await utility.contracts.Provenance.deployed();
        result = await ProvenanceInstance.findProducer(address);
        console.log("voici le producteur")
        console.log(result)
        console.log("voici l'addresse")
        console.log('producer');
        result[2] = result[2].toNumber()
        console.log(result);
        utility.producersAdd[result[0]] = result[0]
        
        // récupère une référence vers l'élément body
        var tablebody = document.getElementById("tbodyProducer");
        // création des cellules
        

        // création d'un élément <tr>
        row = document.createElement("tr");
        row.classList.add("tr-shadow");
        td1 = document.createElement("td");
        // création d'un nœud texte
        texte = document.createTextNode(result[1]);
        // ajoute le nœud texte créé à la cellule <td>
        td1.appendChild(texte);
        // ajoute la cellule <td> à la ligne <tr>
        row.appendChild(td1);
            
        // création d'un élément <td> 2
        td2 = document.createElement("td");
        span1 = document.createElement("span")
        span1.classList.add("block-email");
        // création d'un nœud texte
        texte = document.createTextNode(result[2]);
        // ajoute le nœud texte créé au span <span>
        span1.appendChild(texte);
        // ajouter le span au td
        td2.appendChild(span1);
        // ajoute la cellule <td> à la ligne <tr>
        row.appendChild(td2);

            // création d'un élément <td> 3
        td3 = document.createElement("td");
        td3.classList.add("desc");
        // création d'un nœud texte
        texte = document.createTextNode(result[4]);
        // ajoute le nœud texte créé à la cellule <td>
        td3.appendChild(texte);
        // ajoute la cellule <td> à la ligne <tr>
        row.appendChild(td3);

        // création d'un élément <td> 4
        td4 = document.createElement("td");
        // création d'un nœud texte
        //texte = document.createTextNode(new Date().toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"}),);
        texte = document.createTextNode(result[3]);
        // ajoute le nœud texte créé à la cellule <td>
        td4.appendChild(texte);
        // ajoute la cellule <td> à la ligne <tr>
        row.appendChild(td4);

        // création d'un élément <td> 5
        td5 = document.createElement("td");
        span2 = document.createElement("span");
        if (result[5]){
          span2.classList.add("status--process");
          texte = document.createTextNode("confirmed");
        }else{
          span2.classList.add("status--denied");
          texte = document.createTextNode("not confirmed");
        }
        // ajoute le nœud texte créé au span <span>
        span2.appendChild(texte);
        // ajouter le span au td
        td5.appendChild(span2);
        // ajoute la cellule <td> à la ligne <tr>
        row.appendChild(td5);

        //// création d'un élément <td> 6
        //td6 = document.createElement("td");
        //// création d'un nœud texte
        //texte = document.createTextNode(address);
        //// ajoute le nœud texte créé à la cellule <td>
        //td6.appendChild(texte);
        //// ajoute la cellule <td> à la ligne <tr>
        //row.appendChild(td6);

        // création d'un élément <td> 7
        td7 = document.createElement("td");
        div1 = document.createElement("div");
        div1.classList.add("table-data-feature");
        button1 = document.createElement("button");
        button1.setAttribute('title', "Certify");
        button1.setAttribute('class', "item");
        button1.setAttribute('onclick', 'certifyProd(result[0]);')
        i1 = document.createElement("i");
        i1.classList.add("zmdi", "zmdi-edit");
        button2 = document.createElement("button");
        button2.setAttribute('title', "Delete");
        button2.setAttribute('class', "item");
        button2.setAttribute('onclick', 'utility.removeProducer(result[0]);')
        i2 = document.createElement("i");
        i2.classList.add("zmdi", "zmdi-delete");
        button1.appendChild(i1); 
        button2.appendChild(i2);
        div1.appendChild(button1);
        div1.appendChild(button2);
        // ajouter le span au td
        td7.appendChild(div1);
        // ajoute la cellule <td> à la ligne <tr>
        row.appendChild(td7);
        // ajoute la ligne <tr> à l'élément <tbody>
        tablebody.appendChild(row);
        row2 = document.createElement("tr");
        row2.classList.add("spacer")
        tablebody.appendChild(row2);
        //var tbody = $('#tbodyProducer');
        //var trTemplate = $('#trTemplate');
        //          
        //trTemplate.find('.name').text(result[0]);
        //trTemplate.find('.block-email').text(result["1"])
        //trTemplate.find('.desc').text(result["2"])
        //trTemplate.find('.date').text(new Date().toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"}))
        //if (result[4]){
        //  trTemplate.find('.status--process').text('confirmed');
        //  trTemplate.find('.status--process').attr('class', 'status--process');
        //}else{
        //  trTemplate.find('.status--process').text('not confirmed')
        //  trTemplate.find('.status--process').attr('class', 'status--denied');
        //}              
        //trTemplate.find('.country').text(result[3])
        //tbody.append(trTemplate.html());

        //web3.eth.getAccounts(function(error, accounts){
        //    if (error) {
        //      console.log(error);
        //    }
        //    
        //    utility.contracts.Provenance.deployed().then(function(instance){
        //      ProvenanceInstance = instance;
      //
        //      // Execute adopt as a transaction by sending account
        //      return ProvenanceInstance.findProducer(address);
        //    }).then(function(result){

        //    }).catch(function(err){
        //      console.log(err.message);
        //    });
        //});
    },

    allProducers: async function(){

      var ProvenanceInstance;
      web3.eth.getAccounts(function(error, accounts){
          if (error) {
            console.log(error);
          }
          
          var account = accounts[0];
          utility.contracts.Provenance.deployed().then(function(instance){
            ProvenanceInstance = instance;
    
            // Execute adopt as a transaction by sending account
            return ProvenanceInstance.allProducers.call();
          }).then(function(result){
            console.log("list of all producer");
            console.log(result);

            $('#producer').attr('style', 'color:blue');
            $('#latestAdd').attr('style', 'display:none');
            $('#producerDiv').attr('style', 'display:block');
            $('#productDiv').attr('style', 'display:none');
            $('#supplierDiv').attr('style', 'display:none');
            $('#shipmentDiv').attr('style', 'display:none');

            $('#last').attr('style', 'color:DarkSlateGrey');
            $('#product').attr('style', 'color:DarkSlateGrey');
            $('#supplier').attr('style', 'color:DarkSlateGrey');
            $('#shipment').attr('style', 'color:DarkSlateGrey');

            var tablebody = document.getElementById("tbodyProducer");
            tablebody.innerHTML = " ";
            for(i=0; i<result.length; i++){
              if(result[i] !== '0x0000000000000000000000000000000000000000')
                utility.findProducer(result[i])
              
            }
            console.log(utility.producersAdd)
          }).catch(function(err){
            console.log(err.message);
          });
      });
    },

    certifyProducer: async function(address){
        var ProvenanceInstance;
        web3.eth.getAccounts(function(error, accounts){
            if (error) {
              console.log(error);
            }

            var account = accounts[0];
            utility.contracts.Provenance.deployed().then(function(instance){
              ProvenanceInstance = instance;
      
              // Execute adopt as a transaction by sending account
              return ProvenanceInstance.certifyProducer(address, {from: account});
            }).then(function(result){
              console.log("producer certified");
              utility.allProducers();
              console.log(result);
            }).catch(function(err){
              console.log(err.message);
            });
        });  
    },

    addProduct : async function(seriaNo, locationData, callback){
        var ProvenanceInstance;
        this.web3.eth.getAccounts(function(error, accounts){
            if (error) {
              console.log(error);
            }

            var account = accounts[0];
            utility.contracts.Provenance.deployed().then(function(instance){
              ProvenanceInstance = instance;
      
              // Execute adopt as a transaction by sending account
              return ProvenanceInstance.addProduct(seriaNo, locationData, {from: account});
            }).then(function(result){
              console.log("product added");
              console.log(result);
              callback(result);
            }).catch(function(err){
              console.log(err.message);
              callback("ERROR 404")
            });
        });    
    },

    removeProduct : function(seriaNo, callback){
        var ProvenanceInstance;
        this.web3.eth.getAccounts(function(error, accounts){
            if (error) {
              console.log(error);
            }

            var account = accounts[0];
            utility.contracts.Provenance.deployed().then(function(instance){
              ProvenanceInstance = instance;
      
              // Execute adopt as a transaction by sending account
              return ProvenanceInstance.removeProduct(seriaNo, {from: account});
            }).then(function(result){
              console.log("product removed");
              console.log(result);
              callback(result);
            }).catch(function(err){
              console.log(err.message);
              callback("ERROR 404")
            });
        });    
    }, 

    findProduct: function(seriaNo, callback){
        var ProvenanceInstance;
        this.web3.eth.getAccounts(function(error, accounts){
            if (error) {
              console.log(error);
            }

            var account = accounts[0];
            utility.contracts.Provenance.deployed().then(function(instance){
              ProvenanceInstance = instance;
      
              // Execute adopt as a transaction by sending account
              return ProvenanceInstance.findProduct(seriaNo);
            }).then(function(result){
              console.log("product");
              result[1][0]=result[1][0].toNumber();
              result[1][1]=result[1][1].toNumber();
              result[2]=result[2].toNumber()
              console.log(result);
              callback(result);
            }).catch(function(err){
              console.log(err.message);
              callback("ERROR 404")
            });
        });   
    },

    allProducts: async function(callback){
      var ProvenanceInstance;
      this.web3.eth.getAccounts(function(error, accounts){
          if (error) {
            console.log(error);
          }
          
          utility.contracts.Provenance.deployed().then(function(instance){
            ProvenanceInstance = instance;
    
            // Execute adopt as a transaction by sending account
            return ProvenanceInstance.allProducts();
          }).then(function(result){
            console.log("all products");
            console.log(result);
            callback(result);
          }).catch(function(err){
            console.log(err.message);
            callback("ERROR 404")
          });
      });
    },

    // CONTRACT TRACKING

    sendToken: function(address, amount, callback){
      var TrakingInstance;
      this.web3.eth.getAccounts(function(error, accounts){
          if (error) {
            console.log(error);
          }

          var account = accounts[0];
          utility.contracts.Tracking.deployed().then(function(instance){
            TrakingInstance = instance;
    
            // Execute adopt as a transaction by sending account
            return TrakingInstance.sendToken(address, amount, {from: account});
          }).then(function(result){
            console.log("Token send");
            console.log(result);
            callback(result);
          }).catch(function(err){
            console.log(err.message);
            callback("ERROR 404")
          });
      }); 
    },

    getBalance: function(address, callback){
      var TrakingInstance;
      this.web3.eth.getAccounts(function(error, accounts){
          if (error) {
            console.log(error);
          }

          var account = accounts[0];
          utility.contracts.Tracking.deployed().then(function(instance){
            TrakingInstance = instance;
    
            // Execute adopt as a transaction by sending account
            return TrakingInstance.getBalance(address);
          }).then(function(result){
            console.log("balance");
            console.log(result);
            callback(result);
          }).catch(function(err){
            console.log(err.message);
            callback("ERROR 404")
          });
      }); 
    },


    recoverToken: function(address, amount, callback){
      var TrakingInstance;
      this.web3.eth.getAccounts(function(error, accounts){
          if (error) {
            console.log(error);
          }

          var account = accounts[0];
          utility.contracts.Tracking.deployed().then(function(instance){
            TrakingInstance = instance;
    
            // Execute adopt as a transaction by sending account
            return TrakingInstance.recoverToken(address, amount, {from: account});
          }).then(function(result){
            console.log("token recovered");
            console.log(result);
            callback(result);
          }).catch(function(err){
            console.log(err.message);
            callback("ERROR 404")
          });
      });
    },

    setContractParameters: function(location1, location2, leadTime, payment, callback){
      var location = [location1, location2];
      var TrakingInstance;
      this.web3.eth.getAccounts(function(error, accounts){
          if (error) {
            console.log(error);
          }

          var account = accounts[0];
          utility.contracts.Tracking.deployed().then(function(instance){
            TrakingInstance = instance;
    
            // Execute adopt as a transaction by sending account
            return TrakingInstance.setContractParameters(location, leadTime, payment, {from: account});
          }).then(function(result){
            console.log("parameters setted");
            console.log(result);
            callback(result);
          }).catch(function(err){
            console.log(err.message);
            callback("ERROR 404")
          });
      });
    },

    sendShipment: function(trackinNo, item, quantity, location1, location2){
      var TrakingInstance;
      var location = [location1, location2];
      this.web3.eth.getAccounts(function(error, accounts){
          if (error) {
            console.log(error);
          }

          var account = accounts[0];
          utility.contracts.Tracking.deployed().then(function(instance){
            TrakingInstance = instance;
    
            // Execute adopt as a transaction by sending account
            return TrakingInstance.sendShipment(trackinNo, item, quantity, location, {from: account});
          }).then(function(result){
            console.log("shipment send");
            console.log(result);
            callback(result);
          }).catch(function(err){
            console.log(err.message);
            callback("ERROR 404")
          });
      });
    }, 

    recieveShipment: function(trackinNo, item, quantity, location1, location2){
      var TrakingInstance;
      var location = [location1, location2];
      this.web3.eth.getAccounts(function(error, accounts){
          if (error) {
            console.log(error);
          }

          var account = accounts[0];
          utility.contracts.Tracking.deployed().then(function(instance){
            TrakingInstance = instance;
    
            // Execute adopt as a transaction by sending account
            return TrakingInstance.receiveShipment(trackinNo, item, quantity, location, {from: account});
          }).then(function(result){
            console.log("recive shipment");
            console.log(result);
            callback(result);
          }).catch(function(err){
            console.log(err.message);
            callback("ERROR 404")
          });
      });
    },

    deleteShipment: function(trackinNo){
      var TrakingInstance;
      this.web3.eth.getAccounts(function(error, accounts){
          if (error) {
            console.log(error);
          }

          var account = accounts[0];
          utility.contracts.Tracking.deployed().then(function(instance){
            TrakingInstance = instance;
    
            // Execute adopt as a transaction by sending account
            return TrakingInstance.deleteShipment(trackinNo, {from: account});
          }).then(function(result){
            console.log("all products");
            console.log(result);
            callback(result);
          }).catch(function(err){
            console.log(err.message);
            callback("ERROR 404")
          });
      });
    },

    checkShipment: function(trackingNo, callback){
      var ProvenanceInstance;
      this.web3.eth.getAccounts(function(error, accounts){
          if (error) {
            console.log(error);
          }

          var account = accounts[0];
          utility.contracts.Provenance.deployed().then(function(instance){
            ProvenanceInstance = instance;
    
            // Execute adopt as a transaction by sending account
            return ProvenanceInstance.checkShipment(trackingNo);
          }).then(function(result){
            console.log("shipment");
            console.log(result);
            callback(result);
          }).catch(function(err){
            console.log(err.message);
            callback("ERROR 404")
          });
      });   
    },

    checkSuccess: function(address, callback){
      var ProvenanceInstance;
      this.web3.eth.getAccounts(function(error, accounts){
          if (error) {
            console.log(error);
          }

          var account = accounts[0];
          utility.contracts.Provenance.deployed().then(function(instance){
            ProvenanceInstance = instance;
          
            // Execute adopt as a transaction by sending account
            return ProvenanceInstance.checkSuccess(address);
          }).then(function(result){
            console.log("shipment");
            console.log(result);
            callback(result);
          }).catch(function(err){
            console.log(err.message);
            callback("ERROR 404")
          });
      });   
    },

    allShipment: async function(callback){
      var ProvenanceInstance;
      this.web3.eth.getAccounts(function(error, accounts){
          if (error) {
            console.log(error);
          }

          utility.contracts.Provenance.deployed().then(function(instance){
            ProvenanceInstance = instance;
          
            // Execute adopt as a transaction by sending account
            return ProvenanceInstance.allShipment();
          }).then(function(result){
            console.log("all shipment");
            console.log(result);
            callback(result);
          }).catch(function(err){
            console.log(err.message);
            callback("ERROR 404")
          });
      });
    },

    calculateReputation: function(address, callback){
      var TrakingInstance;
      this.web3.eth.getAccounts(function(error, accounts){
          if (error) {
            console.log(error);
          }

          var account = accounts[0];
          utility.contracts.Tracking.deployed().then(function(instance){
            TrakingInstance = instance;
    
            // Execute adopt as a transaction by sending account
            return TrakingInstance.calculateReputation(address, {from: account});
          }).then(function(result){
            console.log("calcul reputation");
            console.log(result);
            callback(result);
          }).catch(function(err){
            console.log(err.message);
            callback("ERROR 404")
          });
      });
    },
   

    // CONTRACT REPUTATION
    addSupplier: function(name, phoneNo, cityState, country, goodsType, callback){
      var ReputationInstance;
      this.web3.eth.getAccounts(function(error, accounts){
          if (error) {
            console.log(error);
          }

          var account = accounts[0];
          utility.contracts.Reputation.deployed().then(function(instance){
            ReputationInstance = instance;
    
            // Execute adopt as a transaction by sending account
            return ReputationInstance.addSupplier(name, phoneNo, cityState, country, goodsType, {from: account});
          }).then(function(result){
            console.log("supplier added");
            console.log(result);
            callback(result);
          }).catch(function(err){
            console.log(err.message);
            callback("ERROR 404")
          });
      });
    },

    removeSupplier: function(address, callback){
      var ReputationInstance;
      this.web3.eth.getAccounts(function(error, accounts){
          if (error) {
            console.log(error);
          }

          var account = accounts[0];
          utility.contracts.Reputation.deployed().then(function(instance){
            ReputationInstance = instance;
    
            // Execute adopt as a transaction by sending account
            return ReputationInstance.removeSupplier(address, {from: account});
          }).then(function(result){
            console.log("supplier removed");
            console.log(result);
            callback(result);
          }).catch(function(err){
            console.log(err.message);
            callback("ERROR 404")
          });
      });
    }, 

    findSupplier: function(address, callback){
      var ReputationInstance;
      this.web3.eth.getAccounts(function(error, accounts){
          if (error) {
            console.log(error);
          }

          var account = accounts[0];
          utility.contracts.Reputation.deployed().then(function(instance){
            ReputationInstance = instance;
    
            // Execute adopt as a transaction by sending account
            return ReputationInstance.findSupplier(address);
          }).then(function(result){
            console.log("supplier");
            console.log(result);
            callback(result);
          }).catch(function(err){
            console.log(err.message);
            callback("ERROR 404")
          });
      });
    }, 
    
    allSuppliers: function(callback){
      var ReputationInstance;
      this.web3.eth.getAccounts(function(error, accounts){
          if (error) {
            console.log(error);
          }

          var account = accounts[0];
          utility.contracts.Reputation.deployed().then(function(instance){
            ReputationInstance = instance;
    
            // Execute adopt as a transaction by sending account
            return ReputationInstance.allSuppliers();
          }).then(function(result){
            console.log("all suppliers");
            console.log(result);
            callback(result);
          }).catch(function(err){
            console.log(err.message);
            callback("ERROR 404")
          });
      });
    },

    filterByGoodsType: function(goodsType, callback){
      var ReputationInstance;
      this.web3.eth.getAccounts(function(error, accounts){
          if (error) {
            console.log(error);
          }

          var account = accounts[0];
          utility.contracts.Reputation.deployed().then(function(instance){
            ReputationInstance = instance;
    
            // Execute adopt as a transaction by sending account
            return ReputationInstance.filterByGoodsType(goodsType);
          }).then(function(result){
            console.log("filter by good type");
            console.log(result);
            callback(result);
          }).catch(function(err){
            console.log(err.message);
            callback("ERROR 404")
          });
      });
    }, 

    filterByReputation: function(reputation, callback){
      var ReputationInstance;
      this.web3.eth.getAccounts(function(error, accounts){
          if (error) {
            console.log(error);
          }

          var account = accounts[0];
          utility.contracts.Reputation.deployed().then(function(instance){
            ReputationInstance = instance;
    
            // Execute adopt as a transaction by sending account
            return ReputationInstance.filterByReputation(reputation);
          }).then(function(result){
            console.log("filter by reputation");
            console.log(result);
            callback(result);
          }).catch(function(err){
            console.log(err.message);
            callback("ERROR 404")
          });
      });
    },

    checkReputation: function(address, callback){
      var ReputationInstance;
      this.web3.eth.getAccounts(function(error, accounts){
          if (error) {
            console.log(error);
          }

          var account = accounts[0];
          utility.contracts.Reputation.deployed().then(function(instance){
            ReputationInstance = instance;
    
            // Execute adopt as a transaction by sending account
            return ReputationInstance.checkReputation(address);
          }).then(function(result){
            console.log("reputation");
            console.log(result);
            callback(result);
          }).catch(function(err){
            console.log(err.message);
            callback("ERROR 404")
          });
      });
    },

    updateReputation: function(callback){
      var ReputationInstance;
      this.web3.eth.getAccounts(function(error, accounts){
          if (error) {
            console.log(error);
          }

          var account = accounts[0];
          utility.contracts.Reputation.deployed().then(function(instance){
            ReputationInstance = instance;
    
            // Execute adopt as a transaction by sending account
            return ReputationInstance.updateReputation({from : account});
          }).then(function(result){
            console.log("Reputation updated");
            console.log(result);
            callback(result);
          }).catch(function(err){
            console.log(err.message);
            callback("ERROR 404")
          });
      });
    }

}
















