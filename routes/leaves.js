const router = require('express').Router();
const auth = require('../middleware/auth');


router.use(auth);

const {
    insertLeave,
} = require ('../controllers/leavesController')

router.post('/insertLeave', insertLeave)


module.exports = router





