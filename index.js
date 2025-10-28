const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const dotenv = require('dotenv');
const ejs = require('ejs');
dotenv.config();
app.set('view engine', 'ejs');
const mongoose = require('mongoose');
app.use(express.urlencoded({extended:true}))
// app.use(express.json());




const URI = process.env.MONGO_URI 
mongoose.connect(URI)
    .then(() => {console.log('MongoDB connected')})
    .catch(err => {console.log(err)});

    const UserSchema = new mongoose.Schema({
        firstname:{type:String, required:[true, "Firstname is required"],match:[/^[A-Za-z]*$/, "Firstname must contain only letters"],trim:true},
        lastname:{type:String, required:[true, "Lastname is required"],match:[/^[A-Za-z]*$/, "Lastname must contain only letters"],trim:true},
        email:{type:String, required:[true, "Email is required"], unique:[true],match:[/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email must be a valid email address"],lowercase:true},
        password:{type:String, required:[true, "Password is required"],match:[/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/, "Password must be at least 6 characters long and contain at least one letter and one number"],minlength:[6, "Password must be at least 6 characters long"],trim:true},

        isAdmin:{type:Boolean, required:[true, "isAdmin is required"], default:false},
        date_created:{type:String, required:[true], default:Date.now()}
    });
    const UserModel = mongoose.model('User', UserSchema);



let recentUsers = [
        {name: "Bob", joined: "2024-06-10"},
        {name: "Charlie", joined: "2024-06-12"},
        {name: "Diana", joined: "2024-06-14"}
    ];

app.get('/', (req, res) => {
    res.send(' Welcome to Node Js!');
});


app.get('/song',(req,res)=>{
    res.sendFile(__dirname+"/index.html")
})

app.get("/signup", (req,res)=>{
    message = "";
    res.render("signup",{message});
})
// app.post('/signup',async (req,res)=>{
//     const {firstname, lastname, email, password} = req.body;
//     try{
//         await UserModel.create({firstname, lastname, email, password});
//         message = "User created successfully. Please sign in.";
//         res.render("signin", {message});
//     }catch(err){
//         console.log(err)
//         message = "Error creating user. Please try again.";
//         if(err.code === 11000){
//             message = "User already exists";
//             res.render('signup',{message});
//         }else{
//             message = "Error creating user. Please try again.";
//             res.render('signup',{message} );
//         }
//     }
// })

app.post("/signup",(req,res)=>{
    const {firstname, lastname, email, password} = req.body;
    let newUser = new UserModel(req.body);
    newUser.save()
    .then(()=>{
        message = "User created successfully. Please sign in.";
        res.redirect("/signin");
    })
    .catch(err=>{
        console.log(err);
        message = "Error creating user. Please try again.";
        if(err.code === 11000){
            message = "User already exists";
            res.render('signup',{message});
        }else{
            message = "Error creating user. Please try again.";
            res.render('signup',{message} );
        }
    });
});


app.get("/signin", (req,res)=>{
    message = "";
    res.render("signin", {message});
});
app.post('/signin', async (req,res)=>{
    const {email, password} = req.body;
    try{
        const user = await UserModel.findOne({email, password});
        if(user){
            message = "Sign in successful!";
            res.render("dashboard", {message, user});
        }else{
            message = "Invalid email or password.";
            res.render("signin", {message});
        }
    }catch(err){
        message = "Error signing in. Please try again.";
        res.render("signin", {message});
    }
});
app.get("/dashboard", (req,res)=>{
    res.render("dashboard", { user: {name: "Alice", gender: "Female"},
    chartLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    chartValues: [10, 15, 8, 12, 20, 18, 25],
    recentUsers: recentUsers
});
});

// app.get("/dashboard", (req,res)=>{
//     res.render("dashboard", {name: "John", gender: "Male"});
// });


app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
})