
const usersDb = {
    users: require("../models/users.json"),
    setUsers :function(data){this.users = data}
};

const fsPromises = require('fs').promises
const path = require('path')
const bcrypt = require("bcrypt")

const jwt = require('jsonwebtoken')
require('dotenv').config()

const handleLogin = async(req,res)=>{
    const {username,password} = req.body;
    if(!username ||!password)
        return res.status(400).json({"message":"Username and password required"})
    
    const foundUser = usersDb.users.find(user=>user.username===username)
    if(!foundUser)
        return res.sendStatus(401)
    const roles = Object.values(foundUser.roles)
    const match = await bcrypt.compare(password,foundUser.password)
    if(match){
        const accessToken = jwt.sign(
            {
                "UserInfo":{
                    'username':foundUser.username,
                    "roles":roles
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn:'120s'}
        )
        const refreshToken = jwt.sign(
            {'username':foundUser.username},
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn:'1d'}
        )
        const otherUsers = usersDb.users.filter(person=>person.username!==foundUser.username)
        const currentUser = {...foundUser,refreshToken}
        usersDb.setUsers([...otherUsers,currentUser])
        fsPromises.writeFile(
            path.join(__dirname,'..','models','users.json'),
            JSON.stringify(usersDb.users)
        )
        res.cookie('jwt',refreshToken,{httpOnly:true,sameSite:'none',secure:true})
        res.json({accessToken})
    }
    else
        res.sendStatus(401)
}

module.exports = {handleLogin}