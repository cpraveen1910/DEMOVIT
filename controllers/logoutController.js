const usersDb = {
    users: require("../models/users.json"),
    setUsers :function(data){this.users = data}
};

const fsPromises = require('fs').promises
const path = require('path')

const handleLogout = async(req,res)=>{
    const cookies = req.cookies;
    if(!cookies?.jwt) res.sendStatus(204)

    const refreshToken = cookies.jwt;

    const foundUser = usersDb.users.find(user=>user.refreshToken===refreshToken)
    if(!foundUser){
        res.clearCookie('jwt',{httpOnly:true,sameSite:'none',secure:true})
        res.sendStatus(204)
    }

    const otherUsers = usersDb.users.filter(person=>person.refreshToken!==refreshToken)
    const currentuser = {...foundUser,refreshToken:""}
    usersDb.setUsers([...otherUsers,currentuser])
    await fsPromises.writeFile(
        path.join(__dirname,'..','models','users.json'),
        JSON.stringify(usersDb.users)
    )
}

module.exports = {handleLogout}