import { Router } from "express";

const router = Router();

// Simple hardcoded admin login for now
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Hardcoded credentials for admin login
  if (username === 'admin' && password === '1234') {
    res.json({ success: true, message: 'Admin login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

export default router;
