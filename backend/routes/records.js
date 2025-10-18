    // API imports/information
    import { restClient } from '@polygon.io/client-js';

    const apiKey = "YOUR_API_KEY";
    const rest = restClient(apiKey, 'https://api.polygon.io');
    
    
    const express = require("express");

    // recordRoutes is an instance of the express router.
    // We use it to define our routes.
    // The router will be added as a middleware and will take control of requests starting with path /record.
    const recordRoutes = express.Router();

    // This will help us connect to the database
    const dbo = require("../db/conn");

    // This helps convert the id from string to ObjectId for the _id.
    const ObjectId = require("mongodb").ObjectId;

    // get a random date, at least 6 months into the sim to start at
    let currDate = Math.floor(Math.random() * 180) + 30;

    // track the number of days passed and the ticker
    let currTicker = "";
    let currDay = 0;

    // store the balance and amount of shares
    let balance = 0;
    let shares = 0;

    // get the value of the ticker at the given day
    recordRoutes.route("/stock/:ticker/:day").get(async (req, res) => {
        try{
            let db_connect = dbo.getDb("simulation");


            let myquery = { ticker: req.params.ticker, day: parseInt(req.params.day, 10) };
            const result = await db_connect.collection("stocks").findOne(myquery); 
        }
        catch(err){
            throw(err);
        }
    });

    // start a new simulation with the provided ticker
    recordRoutes.route("/start/:ticker").get((req, res) => {
        currTicker = req.params.ticker;
    
        // ensure the currDate is a week day
        while (currDate % 7 === 0 || currDate %7 === 6){
            currDate += 1;
        }
        // initialzie starting values
        currDay = 1;
        balance = 10000.00;
        shares = 0;

        res.json({ ticker: currTicker, day: currDay, date: currDate, balance: balance, shares: shares });
    });

    // get the next day in the simulation
    recordRoutes.route("/next").get((req, res) => {
        currDay += 1;
        currDate += 1;
        // ensure the currDate is a week day
        while (currDate % 7 === 0 || currDate %7 === 6){
            currDate += 1;
        }

        res.json({ ticker: currTicker, day: currDay, date: currDate, balance: balance, shares: shares });
    });

    // buy a given amount of shares at the current price, if the number of shares * price is less than balance
    recordRoutes.route("/buy/:amount/:price").get((req, res) => {
        const amount = parseInt(req.params.amount, 10);
        const price = parseFloat(req.params.price);
        const totalCost = amount * price;
        if (totalCost <= balance){
            shares += amount;
            balance -= totalCost;
            res.json({ success: true, ticker: currTicker, day: currDay, date: currDate, balance: balance, shares: shares });
        }
        else{
            res.json({ success: false, message: "Insufficient balance", ticker: currTicker, day: currDay, date: currDate, balance: balance, shares: shares });
        }
    });

    // sell a given amount of shares at the current price, if the number of shares to sell is less than owned
    recordRoutes.route("/sell/:amount/:price").get((req, res) => {
        const amount = parseInt(req.params.amount, 10);
        const price = parseFloat(req.params.price);
        if (amount <= shares){
            shares -= amount;
            balance += amount * price;
            res.json({ success: true, ticker: currTicker, day: currDay, date: currDate, balance: balance, shares: shares });
        }
        else{
            res.json({ success: false, message: "Insufficient shares", ticker: currTicker, day: currDay, date: currDate, balance: balance, shares: shares });
        }
    });

    // stops the simulation and gets the final results to display on the stat screen
    recordRoutes.route("/quit").get((req, res) => {
        res.json ({ ticker: currTicker, day: currDay, date: currDate, balance: balance, shares: shares });
    })


    module.exports = recordRoutes;