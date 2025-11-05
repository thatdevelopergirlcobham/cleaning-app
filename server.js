import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/geocode', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
      params: {
        lat,
        lon: lng,
        format: 'json'
      },
      headers: {
        'User-Agent': 'CleanCal/1.0'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch geocoding data' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});