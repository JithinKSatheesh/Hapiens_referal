# Instgram Referal program

### A nodejs server side code to track people who visit instgram using given referal link

##### Project made for Hapiens digital to track their instgram referal links

###### dependencise used 

````
ejs
mongoose 
express
````


###### Instgram api used 📌

````
var url="https://www.instagram.com/"+query+"/?__a=1";
````

##### Schema

````
var referalSchema = new mongoose.Schema({
	insta_id			:{type :String,unique:true},
	insta_user			:{type :String,required:true},
	by_intern			:{type :String,required:true},
	date				:{type :Date,default: new Date()},
	internname			:String,
	status				:{type:Boolean,default:true}
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
````


##### Code for handling get request

````

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

````





