const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/pieChartController');

// 获取最新的资产配置占比
router.get('/totalRatio/:user_id', portfolioController.getPortfolioValuePie);
//查看当前改portfolio的资产配置占比
// router.get('/:portfolioRatio/:portfolio_id', portfolioController.getPortfolioStockValues);
module.exports = router;