//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const _ = require("lodash")
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', false);
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", { useNewUrlParser: true,});

const itemsSchema = new mongoose.Schema({
  name: String
})

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
})

const item3 = new Item({
  name: "<--- Hit this to delete an item."
})

const defaultItems = [item1,item2,item3];

const listSchema =  new mongoose.Schema({
  name:String,
  items: [itemsSchema]
})
 
const List = mongoose.model("List",listSchema)


app.get("/", function(req, res) {

// const day = date.getDate();



Item.find({},function(err , foundItems){
 if(foundItems.length === 0){
  Item.insertMany(defaultItems, function(err){
    if(err){
      console.log("err");
    }else{console.log("default item done")}
  })
  res.redirect("/")
 }
 else{
  res.render("list", {listTitle: "Today", newListItems: foundItems});
 }
})

app.get("/:custom",function(req,res){
  const customName =  _.capitalize(req.params.custom);

List.findOne({name: customName},function(err, result){
  if(!err){
  if(!result){
    const list = new List({
      name: customName,
      items: defaultItems
    });
    res.redirect("/" + customName)
    list.save();
  }else{
    res.render("list",{listTitle: result.name, newListItems: result.items})
  }
}
 
})

 
})

  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
 
  const item = new Item({
    name: itemName
  })
  

   if(listName === "Today"){
      item.save();
          res.redirect("/")
   }
   else{
    List.findOne({name: listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)
    })
    
   }
   
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete",(req,res)=>{
  const deleteID = req.body.checkbox;
  const listName = req.body.listName
  
   if(listName === "Today"){
    Item.findByIdAndRemove(deleteID, function(err){
      if(!err){
        res.redirect("/")
      }
    })
   }
   
   

   else{
    List.findOneAndUpdate({name: listName},{$pull:{items: {_id: deleteID}}}, function(err,getId){
      if(!err){
        res.redirect("/"+ listName)
      }
    })
   }

  // i can also use findIdandremoveit()
  
})




// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
