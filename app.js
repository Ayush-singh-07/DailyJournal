//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const  lodash  = require("lodash");
const multer  = require('multer')
const mongoose = require('mongoose');
const path = require('path')
const date = require(__dirname+'/date')

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const storage = multer.memoryStorage()  //using memorystorage to store whole file on DB
const upload = multer({ storage: storage })


//DB Conn
mongoose.connect(""+process.env.DB_URL)
.then(()=>console.log('DBConnected'))

//Schema
const BlogPostSchema = new mongoose.Schema({
      title: {
        type: String,
        required: true,
      },
      post: {
        type: String,
        required: true,
      },
      image: {
        data: Buffer,   //data sent by multer as buffer 
        contentType: String
      },
      postdate: String,
})

//model
const BlogPost = new mongoose.model('BlogPost' , BlogPostSchema);


app.get('/', (req, res) =>{
  BlogPost.find({})
  .then((result) =>{
    // console.log(result)
    res.render('home', {posts: result}); //ejs uses render
  })
  .catch((error) => {"Error : "+error})
})


app.get('/about', (req,res)=>{
  res.render('about')
})


app.get('/contact', (req,res)=>{
  res.render('contact')
})

app.get('/compose' , (req, res) =>{
  // res.render('compose')
  res.redirect('/login')
})

app.get('/login', (req, res)=>{
  res.render('login')
})

app.post('/login', (req, res)=>{
    const email = req.body.userEmail
    const psw = req.body.userPsw

    const user_mail = ""+process.env.userMail
    const user_pass = ""+process.env.userPass
  
      
    if(email === user_mail  && psw === user_pass ){
      res.render('compose');
    }
    else{
      res.redirect('/');
    }
})


app.post('/compose',upload.single('composedImage'), (req,res)=>{

    const newPost = new BlogPost({
        title: req.body.composedTitle,
        post: req.body.postContent,
        image: {
          data: req.file.buffer, 
          contentType : req.file.mimetype,
        },
        postdate: date.getdate()
    })

    newPost.save()
    .then(()=>{res.redirect('/')})
    .catch((err)=>{console.log("Error: "+err)})
})


app.get("/posts/:id", (req, res)=>{

    const _id = req.params.id;

    BlogPost.findOne({_id: _id})
    .then((result)=>{
      res.render('post', {post: result})
    })
    .catch(()=>res.redirect('/'))

})




app.listen(3000, function() {
  console.log("Server started on port 3000");
});
