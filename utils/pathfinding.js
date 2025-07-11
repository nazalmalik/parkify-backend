import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mapData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/mapGraph.json'), 'utf8'));
const { nodes, edges } = mapData;

function dijkstra(start, end) {
  const distances = {};
  const previous = {};
  const visited = new Set();
  const queue = new Set(Object.keys(nodes));

  // Initialize all distances to Infinity
  for (const node of queue) {
    distances[node] = Infinity;
    previous[node] = null;
  }
  distances[start] = 0;

  while (queue.size > 0) {
    // Find the node with the smallest distance
    let current = null;
    for (const node of queue) {
      if (current === null || distances[node] < distances[current]) {
        current = node;
      }
    }

    if (current === end) break;
    queue.delete(current);
    visited.add(current);

    if (!edges[current]) continue;

    for (const neighbor in edges[current]) {
      if (visited.has(neighbor)) continue;
      const alt = distances[current] + edges[current][neighbor];
      if (alt < distances[neighbor]) {
        distances[neighbor] = alt;
        previous[neighbor] = current;
      }
    }
  }

  // Reconstruct the path
  const path = [];
  const coordinates = [];
  let currentNode = end;

  while (currentNode !== null) {
    path.unshift(currentNode);
    coordinates.unshift({
      node: currentNode,
      x: nodes[currentNode]?.x,
      y: nodes[currentNode]?.y,
    });
    currentNode = previous[currentNode];
  }

  return {
    path,
    distance: distances[end] !== Infinity ? distances[end] : null,
    coordinates,
  };
}

export default { getPath: dijkstra };
