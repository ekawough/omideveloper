module.exports = (req, res) => {
  res.json({ status: 'ok', app: 'omi-life-logger', version: '2.1.0', platform: 'vercel' });
};
