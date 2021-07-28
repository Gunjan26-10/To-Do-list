//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Admin-Me:gunjan2610@cluster0.7lo9d.mongodb.net/todolistDB" , {useNewUrlParser: true});

const itemsSchema = {
  name: String
};
const listSchema = {
  name: String,
  items: [itemsSchema]
}
const Item = mongoose.model("Item" , itemsSchema);
const List = mongoose.model("List" , listSchema);

const item1 = new Item ({
  name: "Welcome!"
});


const item2 = new Item ({
  name: "Hit the + button to add a new item!"
});

const item3 = new Item ({
  name: "Hit the -- button to delete an item"
});

const defaultItems = [item1, item2, item3];


app.get("/", function(req, res) {



  Item.find({}, function(err , foundItems){

    if (foundItems.length === 0){
      Item.insertMany(defaultItems , function(err){
        if(err){
          console.log(err);
        }else{
           console.log("success!");
        }
      });
      res.redirect("/");
    }else{

      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item ({
     name: itemName
  });

  if(listName === "today"){

    item.save();
    res.redirect("/");

  }else{
    List.findOne({name:listName} , function(err , foundList){
      if(!err){
        if(!foundList){
          foundList.items.push(item);
          foundList.save();
          res.redirect("/" + listName);
        }
      }
    })
  }

});
app.post("/delete" , function(req , res){
  const checkedItemId = req.body.checkBox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        res.redirect("/");
      }
    });
      }else{
        List.findOneAndUpdate({name: listName} , {$pull: {items: {_id: checkedItemId}}} , function(err, foundList){
          if(!err){
                  res.redirect("/" + listName);
          }
        });
      }
    })

app.get("/:customListName" , function(req , res){
  const customListName = req.params.customListName;

  List.findOne({name: customListName}, function(err , foundList){
    if(!err){
      if(!foundList){
        const list = new List ({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }else{
        res.render("list" , {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })


})
app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port === null || port ===""){
  port = 3000;
}

app.listen( port , function() {
  console.log("Server has started");
});
