const asyncHandler=require("express-async-handler")
const jwt=require("jsonwebtoken")
const User=require("../models/userModel")


// generating token
const generateToken=(id)=>{
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "1d"})
 }

const registerUser = asyncHandler(async (req, res) => {
    const {name, email, password, pic}=req.body
    if( !name || !email || !password){
        res.status(400)
        throw new Error("You must fill")
    }
    if(password<6){
        res.status(400)
        throw new Error("Password must be upto 6 characters")
    }
    const userExist=await  User.findOne({email})
    if(userExist){
        res.status(400)
        throw new Error("This email already exists ")
    }

    const user= await User.create({
        name,
        email,
        password,
        pic
    }) 


    if(user){
        const {_id,name,email,pic}=user
        res.status(201)
        res.json({
            _id,name,email,pic,token:generateToken(user._id)
        })
    }
    else{
        res.status(400)
    throw new Error("Invalid user data")
    }

})
// LogIn User
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
  
    // Validate Request
    if (!email || !password) {
      res.status(400);
      throw new Error("Please add email and password");
    }
  
    // Check if user exists
    const user = await User.findOne({email});

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id:user._id,
        name:user.name,
        email:user.email,
        pic:user.pic,
        token:generateToken(user._id),
      });
    } else {
      res.status(400);
      console.log(user);
      throw new Error("Invalid email or password");
    }
  });

  const allUsers=asyncHandler(async (req, res)=>{
    const keyword = req.query.search ? {
      $or:[
        {name: { $regex: req.query.search, $options: 'i' }},
        {email: { $regex: req.query.search, $options: 'i' }}
      ]
    } : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } })
    res.send(users)
    console.log(req.user);
  })

module.exports={registerUser, loginUser, allUsers}