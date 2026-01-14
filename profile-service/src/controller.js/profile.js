

export async function getUserInfo(req, res){
console.log("Received headers:");
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];

    if(!userId || !userRole){
        return res.status(400).json({ error: "Missing user ID or role" });
    }

    res.json({
        success: true,
        message:{
            userId,
            userRole
        }
    })

}

