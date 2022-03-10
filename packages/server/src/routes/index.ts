const express = require('express');
const path = require('path');

const clientPath = '../../../client/build';

const router = express.Router();

router.get('*', (req: any, res: any) => {
  res.sendFile(path.join(__dirname, clientPath, 'index.html'));
});

module.exports = router;
