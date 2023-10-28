const express=require("express")
const mongoose=require("mongoose")
const cors=require("cors")
const chats = require("./Data/data")
const dotev=require("dotenv").config()
const userRoute=require("./routes/userRoute")
const chatRoute=require("./routes/chatRoute")
const messageRoute=require("./routes/messageRoute")

const app=express()

// Middlewares
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(cors())


// Routes
app.use("/api/users", userRoute)
app.use("/api/chats", chatRoute)
app.use("/api/messages", messageRoute)
app.get("/",(req, res)=>{
   res.send("Home page...")
})

let server

const PORT= 5000
mongoose
        .connect(process.env.MONGO_URI)
        .then(()=>{
           server = app.listen(PORT,()=>{
               console.log(`server running on port ${PORT}`);
           })
           const io = require("socket.io")(server,{
            pingTimeout: 60000,
            cors:{
               origin: "http://localhost:3000"
            }
         })
         io.on("connection",(socket)=>{
            console.log("Connected to socket.io");

            socket.on("setup", (userData)=>{
               socket.join(userData._id)
               socket.emit("connected")
            })

            socket.on("chat room", (room)=>{
               socket.join(room)
               console.log("user joined room "+{room});
            })

            socket.on("new message", (newMessageRecieved)=>{
               var chat = newMessageRecieved.chat
               if(!chat.users) return console.log("users are not defined");

               chat.users.forEach(user=> {
                  if(user._id === newMessageRecieved.sender._id){
                     return;
                  }
                  socket.in(user._id).emit("message recieved", newMessageRecieved)
               })
            })
         })
        })
        .catch((err)=>console.log(err))


const io = require("socket.io")(server)