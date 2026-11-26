const mongoose = require('mongoose');
const leavesSchema = new mongoose.Schema({
 employeeId:{type: String, require:true},
 leaveStartDt:{type:String, require:true},
 leaveEndDt:{type:String, require:true},
 reason:{type:String},
 approvedId:{type:String},
 approvedDt:{type:String},
 createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
},
{ timestamps: true })
module.exports = mongoose.model('leaves',leavesSchema)