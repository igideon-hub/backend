const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const dotenv = require('dotenv');
const ejs = require('ejs');
dotenv.config();
const mongoose = require('mongoose');
const URI = process.env.MONGO_URI
app.set('view engine', 'ejs');
const bcrypt = require('bcryptjs');
const saltRounds = 10;



app.use(express.urlencoded({extended:true}))
app.use(express.json());


mongoose.connect(URI)
    .then(() => {console.log('MongoDB connected')})
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    });

    // const UserSchema = new mongoose.Schema({
    //     firstname:{type:String, required:[true, "Firstname is required"],match:[/^[A-Za-z]*$/, "Firstname must contain only letters"],trim:true},
    //     lastname:{type:String, required:[true, "Lastname is required"],match:[/^[A-Za-z]*$/, "Lastname must contain only letters"],trim:true},
    //     email:{type:String, required:[true, "Email is required"], unique:[true],match:[/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email must be a valid email address"],lowercase:true},
    //     password:{type:String, required:[true, "Password is required"],match:[/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Password must be at least 8 characters long and contain at least one letter and one number"],minlength:[8, "Password must be at least 8 characters long"],trim:true},
    // });
    let userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "First name is required"],
        match: [/^[A-Za-z]+$/, "First name must contain only letters"],
        trim: true,
    },

    lastName: {
        type: String,
        required: [true, "Last name is required"],
        match: [/^[A-Za-z]+$/, "Last name must contain only letters"],
        trim: true,
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email has been taken, please choose another one"],
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            "Please provide a valid email address",
        ],
        lowercase: true,
    },

    password: {
        type: String,
        required: [true, "Password is required"],
        // match: [
        //     /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        //     "Password must be at least 8 characters long, contain uppercase, lowercase, a number, and a special character",
        // ],
    },
})
    const UserModel = mongoose.model('User', userSchema);



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
});

// app.post("/signup",(req,res)=>{
//     const {firstname, lastname, email, password} = req.body;
//     let newUser = new UserModel(req.body);


//     newUser.save()
//     .then(()=>{
//         message = "User created successfully. Please sign in";
//         res.redirect("/signin");
//     })
//     .catch(err=>{
//         console.log(err);
//         message = "Error creating user. Please try again.";
//         if(err.code === 11000){
//             message = "User already exists";
//             res.render('signup',{message});
//         }else{
//             message = "Error creating user. Please try again.";
//             res.render('signup',{message} );
//         }
//     });
// });


app.post("/signup", (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    console.log(req.body);

    // Step 1 is to Validate strong password
    const strongPasswordRegex =/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(password)) {
        return res.status(400).send(
            "Weak password: must include uppercase, lowercase, number, and special character."
        );
    }

    // Step 2 is to Check if user already exists to prevent more than one registrations
    UserModel.findOne({ email })
        .then((existingUser) => {
            if (existingUser) {
                res.status(400).send("Email already exists!");
                return Promise.reject("User already exists"); // Stop the chain - completion of  an async operation
            }

            // Step 3 is to Hash password
            return bcrypt.hash(password, saltRounds);
        })
        .then((hashedPassword) => {
            if (!hashedPassword) return; // If user exists, skip this step, it is optional
            // Step 4 is to Save new user
            const newUser = new UserModel({
                firstName,
                lastName,
                email,
                password: hashedPassword, // Store hashed password not the plain text password
            });

            return newUser.save();
        })
        .then((savedUser) => {
            if (!savedUser) return; // If user exists, skip this step, it is also optional
            console.log("User registered successfully");
            res.redirect("/signin");
        })
        .catch((err) => {
            if (err !== "User already exists") {
                console.error("Error saving user:", err);
                res.status(500).send("Internal Server Error");
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