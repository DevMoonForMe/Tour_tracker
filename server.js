import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const dataDir = path.join(__dirname, 'data');

const getFilePath = (resource) => path.join(dataDir, `${resource}.json`);

const readData = (resource) => {
  const filePath = getFilePath(resource);
  if (!fs.existsSync(filePath)) {
    if (resource === 'settings') return {};
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch(e) {
    if (resource === 'settings') return {};
    return [];
  }
};

const writeData = (resource, data) => {
  fs.writeFileSync(getFilePath(resource), JSON.stringify(data, null, 2), 'utf-8');
};

const resources = ['trips', 'members', 'contributions', 'expenses'];

resources.forEach(resource => {
  app.get(`/${resource}`, (req, res) => {
    res.json(readData(resource));
  });

  app.post(`/${resource}`, (req, res) => {
    const data = readData(resource);
    const newItem = req.body;
    data.push(newItem);
    writeData(resource, data);
    res.status(201).json(newItem);
  });

  app.put(`/${resource}/:id`, (req, res) => {
    const data = readData(resource);
    const index = data.findIndex(item => item.id === req.params.id);
    if (index !== -1) {
      data[index] = { ...data[index], ...req.body };
      writeData(resource, data);
      res.json(data[index]);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  });

  app.delete(`/${resource}/:id`, (req, res) => {
    let data = readData(resource);
    data = data.filter(item => item.id !== req.params.id);
    writeData(resource, data);
    res.json({ success: true });
  });
});

app.get('/settings', (req, res) => {
  res.json(readData('settings'));
});

app.post('/settings', (req, res) => {
  writeData('settings', req.body);
  res.json(req.body);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Custom API Server running on port ${PORT}`);
});
