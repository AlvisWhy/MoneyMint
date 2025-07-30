const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');

// 创建新的 portfolio
router.post('/create', portfolioController.createPortfolio);

// 获取某个用户的所有 portfolios
router.get('/user/:user_id', portfolioController.getPortfoliosByUser);

// // 获取某个 portfolio 的所有持仓
// router.get('/:portfolio_id/holdings', portfolioController.getHoldingsByPortfolio);

module.exports = router;
