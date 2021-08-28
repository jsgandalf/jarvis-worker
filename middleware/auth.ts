const jwt = require('jsonwebtoken');

export default (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.SECRET);
    const email = decoded.data;
    if (email !== process.env.ROOT_EMAIL) {
      throw 'Invalid Auth';
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error('Invalid request!')
    });
  }
};