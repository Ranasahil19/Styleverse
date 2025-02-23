const Seller = require("../../models/seller")

//get all pending request
exports.getSellerRequest = async ( req , res) => {
    try {
        const request = await Seller.find().select("-password");
        res.status(200).json(request);
    } catch (error) {
        res.status(500).json({message : 'Server error'})
    }
}

exports.approveRequest = async (req , res) => {
    const {sellerId , action} = req.body;

    try {
        const seller = await Seller.findById(sellerId);
        if(!seller) return res.status(404).json({ message : "Seller Request not found"});

        if(action === "approve"){
            await Seller.findByIdAndUpdate(sellerId, {status : "approved"});
            return res.status(200).json({message : "Seller Request Approved"});
        }else if(action === "reject"){
            await Seller.findByIdAndUpdate(sellerId , {status : "rejected"});
            return res.status(200).json({message : "Seller Request Rejected"});
        }else {
            res.status(400).json({message : "Invalid Request"});
        }
    } catch (error) {
        res.status(500).json({message : "Server error"})
    }
}