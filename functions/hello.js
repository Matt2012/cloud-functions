export default async function (req, res) {
  const user = req.query.user || 'Guest';
  res.json({ message: `Hello, ${user}` });
}