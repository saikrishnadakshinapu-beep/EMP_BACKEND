const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');

// All employee routes require a valid token in the request headers
router.use(auth);

router.post('/', createEmployee);
router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.put('/updEmp', updateEmployee);
router.delete('/dltEmp', deleteEmployee);

module.exports = router;
