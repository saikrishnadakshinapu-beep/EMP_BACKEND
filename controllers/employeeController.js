const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const User = require('../models/User');


exports.createEmployee = async (req, res, next) => {
  let createdUser;

  try {
    const {
      name,
      email,
      password,
      phone,
      department,
      designation,
      salary,
      joiningDate
    } = req.body;
 
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required'
      });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }
 
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    
    const [existingUser, existingEmployee] = await Promise.all([
      User.findOne({ email: normalizedEmail }),
      Employee.findOne({ email: normalizedEmail })
    ]);

    if (existingUser || existingEmployee) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }

   
    createdUser = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password
    });
 
    const employee = await Employee.create({
      name: normalizedName,
      email: normalizedEmail,
      phone,
      password,
      department,
      designation,
      salary,
      joiningDate,
      createdBy: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: {
        userId: createdUser._id,
        employee
      }
    });

  } catch (err) {
 
    if (createdUser) {
      try {
        await User.deleteOne({ _id: createdUser._id });
      } catch (cleanupError) {
        console.error('User rollback failed:', cleanupError);
      }
    }

    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }

    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next(err);
  }
};
 
exports.getEmployees = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);

    const filter = {};
    if (req.query.department) filter.department = req.query.department;
    if (req.query.search) {
      const rx = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: rx }, { email: rx }];
    }

    const [employees, total] = await Promise.all([
      Employee.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Employee.countDocuments(filter),
    ]);

    res.json({ total, page, pages: Math.ceil(total / limit), employees });
  } catch (err) {
    next(err);
  }
};

exports.getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid employee id' });
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ employee });
  } catch (err) {
    next(err);
  }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.body;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid employee id' });
    }

    const fields = [
      'name',
      'email',
      'phone',
      'password',
      'department',
      'designation',
      'salary',
      'joiningDate'
    ];
    const updates = {};
    for (const field of fields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No employee fields provided' });
    }

    if (typeof updates.name === 'string') updates.name = updates.name.trim();
    if (typeof updates.email === 'string') {
      updates.email = updates.email.trim().toLowerCase();
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const user = await User.findOne({ email: employee.email });
    if (updates.email && updates.email !== employee.email) {
      const [existingEmployee, existingUser] = await Promise.all([
        Employee.findOne({ email: updates.email, _id: { $ne: employee._id } }),
        User.findOne({
          email: updates.email,
          ...(user ? { _id: { $ne: user._id } } : {})
        })
      ]);

      if (existingEmployee || existingUser) {
        return res.status(409).json({ message: 'Email already exists' });
      }
    }

    Object.assign(employee, updates);
    if (user) {
      if (updates.name !== undefined) user.name = updates.name;
      if (updates.email !== undefined) user.email = updates.email;
      await user.validate();
    }
    await employee.validate();

    if (user) await user.save();
    await employee.save();

    res.json({
      success: true,
      message: 'Employee updated successfully',
      employee
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

exports.deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.body;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Wrong employee id' });
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const user = await User.findOne({ email: employee.email });
    await employee.deleteOne();
    if (user) await user.deleteOne();

    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (err) {
    next(err);
  }
};
