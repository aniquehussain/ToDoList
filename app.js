const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");



mongoose.connect('mongodb+srv://admin-anique:anique1234@cluster0-yvcj0.mongodb.net/tdlistDB', { useNewUrlParser: true, useUnifiedTopology: true,useFindAndModify: false  });

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// Schema

const itemsSchema = {
  name: {
    type: String,
    required: [true, "No name specified!"]
  }
};
const Item = mongoose.model("Item", itemsSchema);

//Entries

const item1 = new Item({
  name: "Welcome to your To-Do List!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});
const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List",listSchema);
// Get

app.get("/", function (req, res) {

  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Succesfully Added!");
        }
      });
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    };
  });
});

// Post

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

// Delete

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndDelete(checkedItemId, function (err) {
      if(!err){
        console.log("Succesfully deleted checked item.");
      }
    })
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}},function(err,foundList){
      if(!err){
       res.redirect("/" + listName);
      }
    })
  }

});

//Work

app.get('/:customListName', function(req,res) {
  const customListName = _.capitalize(req.params.customListName);


 List.findOne({name: customListName}, function(err,foundList){
   if(!err){

     if (!foundList){
      // Create New Lists
       const list = new List({
        name: customListName,
        items: defaultItems
       });
       list.save();
       res.redirect("/" + customListName);
    } else {
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items });
    }
  }
 });
});
//Listen
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
  console.log("Server is started succesfully");
});
// process.env.PORT || 3000
