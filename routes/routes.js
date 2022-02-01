var mysql = require('mysql2');

require('dotenv').config();

var connection = mysql.createConnection({
    user     : 'lowbid',
    password : 'Jesuspeace93!',
    database : 'lowbid'
  });

const sys_actions = {
    login:'access_account_login',
    access_account:{
        create:'created_access_account',
        update:'updated_access_account',
        delete:'deleted_access_account',
        get:'get_access_accounts'

    },
    products:{
        create:'product created',
        updated:'product updated',
        deleted:'product deleted',
        get:'get products'
    },
    bids:{
        create:'bid created',
        updated:'bid updated',
        deleted:'bid deleted',
        get:'get bids'
    },
    logs:{
        create:'log created',
        updated:'log updated',
        deleted:'log deleted',
        get:'get logs'
    },
    mpesa:{
        success:'payment successful',
        failed:'payment failed'
    },
    winners:{
        created:'winner created',
        get:'get winners'
    },
    outcome:{
        success:'success',
        failed:'failed'
    }
}

// SYSTEM LOG
class log{
    constructor(action, outcome, result, ip, device) {
        this.OUTCOME = outcome
        this.ERROR = result
        this.SYS_ACTION = action;
        this.TIME = new Date().toISOString().slice(0, 19).replace('T', ' ');
        this.IP_SRC= ip;
        this.DEVICE = device
    }
}


module.exports = function(app){

    //CLIENT SIDE URL
    app.get('/app/products', (req, res) => {

        res.header("Access-Control-Allow-Origin", "https://lowbids.co.ke");
        res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type,Accept, x-client-key, x-client-token, x-client-secret, Authorization");

        connection.connect();
        //Express Validator

        if(req.headers['auth'] === process.env.AUTH_CODE){

            // Save Account To Database

            connection.query('SELECT * FROM PRODUCTS WHERE END_DATE > ? ORDER BY TOTAL_BIDS DESC',[new Date(Date.now())], function (error, products) {
                if(products === null){

                    res.json({message:"No Products Found"});

                }
                if (error){

                    //LOG ERROR 
                const log_ = new log(sys_actions.products.get,sys_actions.outcome.failed, error, req.headers["x-real-ip"],req.headers['user-agent']);
                connection.query('INSERT INTO SYS_LOGS SET ?', [log_], function (error) {
                    if (error){
                        res.json({message:"Server Error"});
                    }
                });

                }else{
                    // Neat!
                    // log action
                    const log_ = new log(sys_actions.products.get,sys_actions.outcome.success,null,req.headers["x-real-ip"],req.headers['user-agent']);

                    connection.query('INSERT INTO SYS_LOGS SET ?', [log_], function (error, results) {
                        if (error){
                            console.log(error);
                        }else{
                            // Neat!
                            
                            res.json({products:products});
                        }
                      });
                }
              });
        }else{
            res.json({message:"Server Error"});
        }
    
    });
}