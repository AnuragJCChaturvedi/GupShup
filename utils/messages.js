const customizeMessage = (username, message) =>{
    return {
        username,
        message,
        createdAt: new Date().getTime()
    }
} 

module.exports = {
    customizeMessage
}