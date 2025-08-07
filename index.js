const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json());

// In-memory storage for notifications
let notifications = [];
try {
    const data = fs.readFileSync('notifications.json');
    notifications = JSON.parse(data);
} catch (err) {
    fs.writeFileSync('notifications.json', '[]');
    console.log('Created notifications.json');
}

// Webhook endpoint
app.post('/webhook', (req, res) => {
    const { embeds } = req.body;
    if (!embeds || !Array.isArray(embeds) || embeds.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid webhook data' });
    }

    const embed = embeds[0];
    const fields = embed.fields || [];
    const notification = {
        gameName: fields.find(f => f.name === '🏷️ Name')?.value || 'Unknown',
        modelName: fields.find(f => f.name === '🏷️ Name')?.value || 'Unknown',
        moneyText: fields.find(f => f.name === '💰 Money per sec')?.value || 'N/A',
        placeId: parseInt(fields.find(f => f.name === '🌐 Join Link')?.value.match(/\d+/)?.[0]) || 0,
        jobId: fields.find(f => f.name === '🆔 Job ID')?.value || 'xxx-xxx-xxx',
        timestamp: Date.now() / 1000
    };

    notifications.push(notification);
    fs.writeFileSync('notifications.json', JSON.stringify(notifications, null, 2));
    console.log('Received and stored notification:', notification);
    res.json({ success: true, message: 'Webhook received' });
});

// Notifications endpoint
app.get('/notifications', (req, res) => {
    const recentNotifications = notifications.filter(n => Date.now() - (n.timestamp * 1000) < 5 * 60 * 1000); // Last 5 minutes
    res.json(recentNotifications);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
