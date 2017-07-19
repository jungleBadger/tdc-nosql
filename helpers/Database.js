/**
 * Created by danielabrao on 31/05/17.
 */
(function () {
    "use strict";

    const nano = require("nano");
    const uuid = require("uuid/v1");
    module.exports = function (configs) {
        /*
             configs - {} Object
             configs.url - "" string - required
             configs.username - "" string - required
             configs.password - "" string - required
         */
        const props = {
            "authorized": false,
            "cookie": "",
            "basicAuth": "",
            "dbInstance": {}
        };

        new Promise(function (resolve, reject) {
            if (!configs.url || !configs.username || !configs.password) {
                throw new Error("Can not proceed without proper configs");
            }
            props.dbInstance = nano({"url": configs.url});
            props.dbInstance.auth(configs.username, configs.password, function (err, body, headers) {
                if (err) {
                    props.authorized = false;
                    reject(err);
                } else {
                    var cookie = (headers && headers["set-cookie"]) || null;
                    if (cookie) {
                        props.cookie = cookie[0];
                    }
                    props.basicAuth = "Basic " + new Buffer("admin:123").toString("base64");
                    props.authorized = true;
                    resolve(body);
                }
            });
        }).then(function (status) {
            console.log(["Connection with", configs.url, "success - Methods available"].join(" "));
        }).catch(function (exception) {
            throw new Error(exception);
        });

        return {
            "db": props.dbInstance,
            "insertDocument": function (options) {
                /*
                     options - {} Object
                     options.collection - "" string - required
                     options.modelObject - {} object - required
                 */
                if (typeof options !== "object" || !options.collection || !options.modelObject || !props.authorized) {
                    throw new Error("Error inserting document on db");
                }
                return new Promise(function (resolve, reject) {
                    options.modelObject._id = uuid();
                    props.dbInstance.dinosaur({
                        "db": options.collection,
                        "path": options.modelObject._id,
                        "method": "PUT",
                        "body": options.modelObject,
                        "headers": {
                            "Cookie": props.cookie,
                            "Authorization": props.basicAuth
                        }
                    }, function (err, response) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(response);
                        }
                    });
                });
            },
            "queryDocument": function (options) {
                /*
                     options - {} Object
                     options.collection - "" string - required
                     options.query - {} object
                 */
                if (typeof options !== "object"  || !options.collection || !props.authorized) {
                    console.log(options);
                    console.log(props.authorized);
                    throw new Error("Error querying couch db");
                }
                return new Promise(function (resolve, reject) {
                    props.dbInstance.dinosaur({
                        "db": options.collection,
                        "path": "_find",
                        "method": "POST",
                        "body": options.query || {},
                        "headers": {
                            "Cookie": props.cookie,
                            "Authorization": props.basicAuth
                        }
                    }, function (err, response) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(response);
                        }
                    });
                });
            }
        };
    };

}());