const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname)));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency } = req.body;
        
        if (!amount || amount < 50) {
            throw new Error('Invalid amount. Minimum amount is 50 cents.');
        }

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount),
            currency,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                orderId: Date.now().toString(36).toUpperCase()
            }
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            orderId: paymentIntent.metadata.orderId
        });
    } catch (error) {
        console.error('Payment Intent Error:', error);
        res.status(500).json({ 
            error: error.message,
            details: 'Error creating payment intent'
        });
    }
});

// Handle payment success
app.get('/payment-success', (req, res) => {
    const amount = req.query.amount || '0.00';
    const orderId = req.query.order_id || Date.now().toString(36).toUpperCase();
    res.redirect(`/payment-result.html?status=success&amount=${amount}&orderId=${orderId}`);
});

// Handle payment failure
app.get('/payment-failure', (req, res) => {
    res.redirect('/payment-result.html?status=failure');
});

// Serve payment result page
app.get('/payment-result.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'payment-result.html'));
});

// Handle order details page
app.get('/order-details', (req, res) => {
    res.sendFile(path.join(__dirname, 'order-details.html'));
});

// Fallback route for all other requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server running on port ${port}`));
