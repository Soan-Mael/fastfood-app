// backend/src/services/emailService.js
const nodemailer = require('nodemailer');

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email de confirmation de commande
const sendOrderConfirmation = async (order) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.quantity}x</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${(item.price * item.quantity).toFixed(2)} ₽</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f97316; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
        .order-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        table { width: 100%; border-collapse: collapse; }
        .total { font-size: 18px; font-weight: bold; color: #f97316; text-align: right; margin-top: 15px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        .status { display: inline-block; padding: 5px 10px; background: #f97316; color: white; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍔 ФудФаст</h1>
          <p>Confirmation de votre commande</p>
        </div>
        <div class="content">
          <p>Bonjour <strong>${order.userName}</strong>,</p>
          <p>Merci pour votre commande ! Nous la préparons avec soin.</p>
          
          <div class="order-details">
            <h3>📋 Détails de la commande</h3>
            <p><strong>Numéro de commande :</strong> #${order.orderNumber || order._id.slice(-6)}</p>
            <p><strong>Restaurant :</strong> ${order.restaurantName}</p>
            <p><strong>Adresse de livraison :</strong> ${order.address}</p>
            <p><strong>Mode de paiement :</strong> ${order.paymentMethod === 'card' ? 'Carte bancaire' : 'Espèces à la livraison'}</p>
            
            <table>
              <thead>
                <tr><th>Qté</th><th>Article</th><th>Prix</th></tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div class="total">
              Total: ${order.total.toFixed(2)} ₽
            </div>
          </div>
          
          <p>📱 <strong>Suivi de votre commande :</strong></p>
          <p>Vous pouvez suivre l'état de votre commande en temps réel dans l'application.</p>
          
          <p>⏰ <strong>Livraison estimée :</strong> ${order.estimatedDelivery}</p>
          
          <p style="margin-top: 20px;">L'équipe ФудФаст vous remercie et vous souhaite un excellent appétit ! 🍕</p>
        </div>
        <div class="footer">
          <p>© 2024 ФудФаст - Livraison de repas à domicile</p>
          <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"ФудФаст" <${process.env.EMAIL_USER}>`,
    to: order.userEmail || 'client@email.com',
    subject: `Confirmation de commande #${order.orderNumber || order._id.slice(-6)}`,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email de confirmation envoyé pour la commande ${order._id}`);
    return true;
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return false;
  }
};

// Email de mise à jour de statut
const sendStatusUpdateEmail = async (order, oldStatus, newStatus) => {
  const statusLabels = {
    confirmed: 'confirmée',
    preparing: 'en préparation',
    picked_up: 'prise en charge par le livreur',
    on_the_way: 'en route vers vous',
    delivered: 'livrée',
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f97316; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .status-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍔 ФудФаст</h1>
        </div>
        <div class="content">
          <p>Bonjour <strong>${order.userName}</strong>,</p>
          <p>Le statut de votre commande #${order.orderNumber || order._id.slice(-6)} a changé :</p>
          
          <div class="status-box">
            <p>Nouveau statut : <strong style="color: #f97316;">${statusLabels[newStatus] || newStatus}</strong></p>
          </div>
          
          <p>Vous pouvez suivre votre commande dans l'application.</p>
          
          <p>Cordialement,<br>L'équipe ФудФаст</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"ФудФаст" <${process.env.EMAIL_USER}>`,
    to: order.userEmail,
    subject: `Mise à jour de votre commande #${order.orderNumber || order._id.slice(-6)}`,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email de mise à jour envoyé pour la commande ${order._id}`);
    return true;
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return false;
  }
};

module.exports = {
  sendOrderConfirmation,
  sendStatusUpdateEmail,
};