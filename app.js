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

const storage  = multer.diskStorage({
    destination: (req, file, cb)=>{
      cb(null, './public/uploads')
    },
    filename: (req, file, cb)=>{
      const filename_suffix = (Date.now()+path.extname(file.originalname))
        cb(null,  filename_suffix)
    }
})
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
      image: String,
      postdate: String,
})

//model
const BlogPost = new mongoose.model('BlogPost' , BlogPostSchema);


app.get('/', (req, res) =>{
  BlogPost.find({})
  .then((result) =>{
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

    if(email === process.env.userMail  && psw === process.env.userPass ){
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
        image: req.file.filename,
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
