export default async function handler(req, res) {
  if (req.method === 'GET') {
    const vehicleType = req.query.vehicleType;
    // get spots logic
    res.status(200).json({ spots: [] });
  }
}
