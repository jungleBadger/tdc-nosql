(function () {
    "use strict";

    let app = {
        "elements": {
            "idInput": document.querySelector("#itemId"),
            "infoInput": document.querySelector("#itemInfo"),
            "itemsList": document.querySelector("#itemsList")
        },
        "props": {
            "fetchItemsURL": "/getItems",
            "addItemURL": "/addItem"
        },
        "model": {
            "Item": function Constructor(item) {
                if (!item || (!item.id && !item._id)) {
                    throw new Error("Invalid item data");
                }
                return {
                    "id": item.id || item._id,
                    "meta": item.meta || "default info"
                }
            },
            "ItemRow": function (itemObj) {
                let outerDiv = document.createElement("div");
                let itemId = document.createElement("div");
                let itemInfo = document.createElement("div");

                outerDiv.classList.add("item-tile");
                outerDiv.classList.add("animated");
                outerDiv.classList.add("bounceInRight");
                itemId.classList.add("item-id");
                itemInfo.classList.add("item-info");
                itemId.appendChild(document.createTextNode(itemObj.id));
                itemInfo.appendChild(document.createTextNode(itemObj.meta));
                outerDiv.appendChild(itemId);
                outerDiv.appendChild(itemInfo);
                return outerDiv;
            }
        },
        "methods": {
            "getItems": function () {
                return new Promise((resolve, reject) => {
                    fetch(app.props.fetchItemsURL).then(function (data) {
                        if (data.status === 200 || data.status === 201) {
                            data.json().then(items => resolve(items.docs));
                        } else {
                            reject(data)
                        }
                    }).catch(function (err) {
                        reject(err);
                    });
                })
            },
            "addItem": function (item) {
                return new Promise((resolve, reject) => {
                    fetch(app.props.addItemURL, {
                        "method": "POST",
                        "headers": {
                            "Content-Type": "application/json"
                        },
                        "body": JSON.stringify({
                            "item": item
                        })
                    }).then(function () {
                        resolve("item added");
                    }).catch(function (err) {
                        reject(err);
                    });
                });
            },
            "buildItemRow": function (item) {
                return app.elements.itemsList.appendChild(new app.model.ItemRow(item));
            }
        },
        "data": {
            "items": []
        },
        "init": function () {
            this.methods.getItems().then(items => {
                this.data.items = items.map(item => {
                    app.methods.buildItemRow(item);
                    return new this.model.Item(item);
                });

                document.querySelector("#addItem").addEventListener("click", function () {
                    let newItem = new app.model.Item({
                        "id": app.elements.idInput.value,
                        "meta": app.elements.infoInput.value
                    });
                    app.methods.addItem(newItem).then(function () {
                        app.methods.buildItemRow(newItem);
                        console.log("item added");
                    });
                });
            }).catch(err => {
                console.log(err);
            });
        }
    };

    window.onload = function () {
        app.init();
    };

}());