const usersDb = {
    users: require("../models/users.json"),
    setUsers :function(data){this.users = data}
};

const jwt = require('jsonwebtoken')
require('dotenv').config()

const handleRefreshToken = (req,res)=>{
    const cookies = req.cookies;
    if(!cookies?.jwt)return res.sendStatus(402)

    console.log(cookies.jwt)
    const refreshToken = cookies.jwt

    const foundUser = usersDb.users.find(user=>user.refreshToken===refreshToken)
    if(!foundUser) return res.sendStatus(403)

    const roles = Object.values(foundUser.roles)
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err,decoded)=>{
            if(err || foundUser.username !=decoded.username) return res.sendStatus(403)
            
            const accessToken = jwt.sign(
                {
                "UserInfo":{
                    'username':foundUser.username,
                    "roles":roles
                }
                },
                process.env.ACCESS_TOKEN_SECRET ,
                {expiresIn:'120s'}
            )
            res.json({accessToken})
        }
    )
}

module.exports = {handleRefreshToken}