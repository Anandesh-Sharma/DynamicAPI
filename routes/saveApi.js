const express = require('express');
const service = require('../services/saveApi')
var router = express.Router();


router.post('/', async function(req, res, next){
    result = await service.createUserApi(req.body);
    console.log(result );
    res.json(result);
});

router.get('/', function(req, res, next){
  console.log(req.body);
  res.json({'status': true});
});

module.exports = router;