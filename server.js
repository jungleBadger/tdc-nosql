(function () {
    "use strict";

    "use strict";
    const appPort = 6010;
    const express = require("express");
    const app = express();
    const server = require("http").createServer(app);
    const compress = require("compression");
    const engines = require("consolidate");
    const bodyParser = require("body-parser");
    const Database = require("./helpers/Database")({
        "url": "http://localhost:5984",
        "username": "admin",
        "password": "123"
    });

    app.use(compress());
    app.engine("html", engines.ejs);
    app.set("view engine", "ejs");
    app.set("views", __dirname + "/client");
    app.use(express.static(__dirname + "/client"));
    app.use(bodyParser.json({"limit": "50mb"}));
    app.use(bodyParser.urlencoded({
            "extended": true,
            "limit": "10mb"
        })
    );

    app.get("/", function(req, res) {
        return res.status(200).send("./index.html");
    });
    
    app.get("/getItems", function (req, res) {
        Database.queryDocument({
            "collection": "items",
            "query": {
                "selector": {
                    "_id": {
                        "$gt": null
                    }
                }
            }
        }).then((data) => {
            res.status(200).send(data);
        }).catch((err) => {
            res.status(500).send(err);
        });
    });

    app.post("/addItem", function (req, res) {
        console.log(req.body.item);
        if (!req.body.item) {
            return res.status(403).send("Can not proceed without Item");
        }
        Database.insertDocument({
            "collection": "items",
            "modelObject": req.body.item
        }).then((data) => {
            res.status(200).send(data);
        }).catch((err) => {
            res.status(500).send(err);
        });
    });

    server.listen(appPort, function () {
        process.stdout.write(["Server running on port:", appPort].join(" "));
    });
}());