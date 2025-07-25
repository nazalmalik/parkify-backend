import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pathfinding from '../utils/pathfinding.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mapData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/mapGraph.json'), 'utf8'));
const { nodes, edges } = mapData; // ✅ both nodes and edges needed

const getNavigationPath = (req, res) => {
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).json({ message: 'Start and end points are required.' });
  }

  try {
    const result = pathfinding.getPath(start, end);

    if (!edges[start] || !nodes[end]) {
      return res.status(400).json({ message: 'Invalid start or end node.' });
    }

    if (!result.distance) {
      return res.status(404).json({ message: 'No direct path found between the given points.' });
    }

    res.status(200).json({
      message: 'Path found successfully.',
      ...result,
    });

  } catch (err) {
    console.error('Error in navigationController:', err);
    res.status(500).json({ message: 'Server error while calculating path.' });
  }
};

export default {
  getNavigationPath,
};
