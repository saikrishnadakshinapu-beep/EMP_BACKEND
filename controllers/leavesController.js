const mongoose = require('mongoose');
const Leaves = require('../models/leaves');
const emp = require('../models/Employee');


exports.insertLeave() = async (req, res) => {
    try {
        const {
            employeeId,
            leaveStartDt,
            leaveEndDt,
            reason,
            approvedId,
            approvedDt,
            createdBy
        } = req.body

        if (!employeeId || !leaveStartDt || !leaveEndDt) {
            return res.status(400).json({
                success: false,
                message: 'Emp Id, Start Dt , End Dt required'
            });
        }

        let user = await emp.findById(employeeId);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'user not found'
            });
        }

        if (user) {
            const leavDta = await Leaves.create({
                employeeId,
                leaveStartDt,
                leaveEndDt,
                reason,
                approvedId,
                approvedDt,
                createdBy
            })
    
        return res.status(200).json({
            success: true,
            message: 'Leave Inserted Succesfully',
            data: {
                employeeId: employeeId,
                user,
                leavDta
            }
        });
    }
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            success: true,
            desc: err
        })
         
    }
}