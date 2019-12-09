const express = require('express');
const request = require('request');
const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var promise = require('promise');
var app = express();

 mongoose.connect("mongodb://localhost/hapiens",{ useNewUrlParser: true });
// var db = mongoose.createConnection('mongodb://localhost/hapiens');

var db = mongoose.connection;
 
db.on('error', console.error.bind(console, 'connection error:'));

// ========================================================
var referalSchema = new mongoose.Schema({
	insta_id			:{type :String,unique:true},
	insta_user			:{type :String,required:true},
	by_intern			:{type :String,required:true},
	date				:{type :Date,default: new Date()},
	internname			:String
});

referalSchema.plugin(uniqueValidator);
var Follower = mongoose.model("followers",referalSchema);


// =======================================================
var internSchema = new mongoose.Schema({
	internid : String,
	internname : String,
	referal 	: [{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'followers'
			}]
  });


  // compile schema to model
var Intern = mongoose.model('interns', internSchema);
// =======================================================

 // define Schema
 var oldSchema = mongoose.Schema({
	id : String,
	currentUsername : String,
  });

  // compile schema to model
  var Old= mongoose.model('olddatas', oldSchema);

//   ==================================================

app.get('/',(req,res)=>{
	res.send("working")
})

app.get('/:id/l',(req,res)=>{
	var intern = req.params.id;
	res.redirect("/"+intern+"/get_insta")
})

app.get('/:id/get_insta',(req,res)=>{
	res.render("getid.ejs",{name:req.params.id});
})

app.get('/:id/results',(req,res)=>{
	var query=req.query.search;
	var internid= req.params.id;
	console.log(internid + "'s referal is used by " +query);
	var url="https://www.instagram.com/"+query+"/?__a=1";



	request(url,function(error,response,body){
		if(!error&& response.statusCode==200)
		{	
			var results= JSON.parse(body);
			// res.render("results.ejs",{results:results,query:query});
			var insta_user = {
				"id"	:results.graphql.user.id,
				"user"	:query
			}
			if(results.graphql.user.id)
			{
				

				Intern.findOne({internid : internid},function(err,found){
					if(err || !found)
					{
						res.render("error.ejs",{err : "Error in entering data"})
					}
					else
					{	
						follower = {
							insta_id			:insta_user.id,
							insta_user			:insta_user.user,
							by_intern			:internid,
							internname			:found.internname,
							date				:Date()
						}
						
						Old.findOne({id : insta_user.id }).then((docs)=>{
									
							if(err)
							{
								res.render("error.ejs",{err : "Error in validating username!"})
							}
							else if(!docs)
							{	

								Follower.create(follower,function(err,data){
									if(err)
									{	
										res.render("error.ejs",{err : "Username already registered!"})
									}
									else
									{	
										found.referal.push(data)
										found.save()
										res.redirect("http://instagram.com/hapiens_tribe/")
										
									}
								})

								
							}
							else{
								res.render("error.ejs",{err : "Username already registered!"})
							}
						})
	
					}
				})
			}
			else
			{
				// res.send("unable to fetch data please try again")
				res.render("error.ejs",{err : "unable to fetch data please try again"})
			}
			
		}
		else
		{
			res.render("error.ejs",{err : "Unable to find insta user!"})
		}
		
	});
	
})

app.get("/admin",(req,res)=>{
	Follower.find({}).sort({"by_intern":1,"Date":1}).then((followers)=>{
		res.render("show.ejs",{"followers":followers})
		
	})
	
})



app.get("/admin/sortbydate",(req,res)=>{
	// find value from MongoDB
	Follower.find({}).sort({ 'date' : -1 }).exec((err,collection)=>{
		// looping through followers
		res.render("show.ejs",{"followers":collection})
		
	})
	
})

app.get("/admin/sortbyname",(req,res)=>{
	// find value from MongoDB
	Follower.find({}).sort({"internname":1}).then((collection)=>{
		// looping through followers
		res.render("show.ejs",{"followers":collection})
		
	})
	
})




app.get("/interns",(req,res)=>{
	
	  Intern.find({}).populate('referal').exec((err,docs)=>{
		//   console.log(docs)
		res.render("interns.ejs",{interns:docs})
	  })
		
	  
})

app.listen(3000);