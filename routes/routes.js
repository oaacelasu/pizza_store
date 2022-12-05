const controller = require('../controllers/controllers');
const {isAuth, isCustomer, validateOrder, isAdmin} = require('../middlewares/middlewares');

const express = require('express');

const router = express.Router();

router.get('/', controller.login);
router.post('/', controller.login_post);

router.get('/logout', controller.logout);

router.get('/register', controller.register);
router.post('/register', controller.register_post);

router.get('/shopping_cart',isAuth, isCustomer, controller.shopping_cart);
router.post('/shopping_cart',isAuth, isCustomer, controller.shopping_cart_post);

router.get('/my_orders', isAuth, isCustomer, controller.my_orders);

router.get('/dashboard', isAuth, isAdmin, controller.dashboard);
router.get('/dashboard', isAuth, isAdmin, controller.dashboard_order_update);

module.exports = router;

