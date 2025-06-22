import { Router } from 'express';

const router = Router();

// Store device tokens for push notifications
const deviceTokens = new Set<string>();

// Register device for push notifications
router.post('/register-push-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    deviceTokens.add(token);
    console.log(`Registered device token: ${token.substring(0, 20)}...`);
    
    res.json({ success: true, message: 'Token registered successfully' });
  } catch (error) {
    console.error('Failed to register token:', error);
    res.status(500).json({ error: 'Failed to register token' });
  }
});

// Send push notification to all registered devices
export async function sendPushNotification(title: string, body: string, data?: any) {
  console.log(`Sending push notification: ${title} - ${body}`);
  console.log(`Registered devices: ${deviceTokens.size}`);
  
  // In production, you would use Firebase Cloud Messaging or similar service
  // For now, we'll log the notification
  for (const token of deviceTokens) {
    console.log(`Would send to device: ${token.substring(0, 20)}...`);
  }
}

export default router;