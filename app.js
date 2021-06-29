//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-Ali:todoLearning@todoapplearining.4kocm.mongodb.net/todoListDb?retryWrites=true', {useNewUrlParser: true, useUnifiedTopology: true});

const itemSchema =
  {
    name: String
  };

const listSchema = {
  name: String,
  items: [itemSchema]
};

const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);

const item1 = new Item({name: "Welcome to your todo list"});

const item2 = new Item({name: "Add some stuff"});

const item3 = new Item({name: "Exit this page"});

itemsDefault = [item1, item2, item3];

app.get("/", function(req, res) {
  const day = date.getDate();

  Item.find({}, function(err, foundItems){
    if (foundItems.length === 0){
      Item.insertMany(itemsDefault, function(err){
        if (err){
          console.log(err);
        }
        else{
          console.log("Success");
        }
      });    
    }
    res.render("list", {listTitle: day, newListItems: foundItems});
  });


});

app.get("/:customListName", function(req, res){
  
  const listName = req.params.customListName;

  List.findOne({name: listName}, function(err, foundList){
    if (!err){
      if(!foundList){
        const list = new List({
          name: listName,
          items: itemsDefault 
        });

        list.save();
        res.redirect("/" + listName);
      }else{
      //console.log(foundList.name);
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }else{
      console.log(err);
    }
  });

});

app.post("/", function(req, res){
  
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({name: itemName});


  if (req.body.listTitle == date.getDate()){
    item.save();
    res.redirect("/");
  }else{

  List.findOne({name: listName}, function(err, foundList){
    if(!err){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    }
  });
}
  });


app.get("/about", function(req, res){
  res.render("about");
});


app.post("/delete", function(req, res){

  const itemIdToBeDeleted = req.body.checkbox;
  const listName = req.body.listName;

  if (listName == date.getDate()){

    Item.findByIdAndRemove(itemIdToBeDeleted, function(err){

      if (err){
        console.log(err);
      }else{
        console.log("Success!");
      }
      res.redirect("/");

    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemIdToBeDeleted}}}, function (err, foundList){
      if(!err){
        console.log("successfullt deleted");
        res.redirect("/" + listName);
      }
    });
  }


});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
