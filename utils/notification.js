const axios = require('axios');

async function sendNotification(notificationId, userStatus, userName, gameName) {
    // Determine title, message, and image based on user status (win or lose)
    let notificationTitle = '';
    let notificationMessage = '';
    let notificationImage = '';

    if (userStatus === 'win') {
        notificationTitle = `Congratulations, ${userName}! 🎉`;
        notificationMessage = `You have won the game "${gameName}"! Keep playing to win more rewards.`;
        notificationImage = 'https://game.gamechamp.in/img/cash.png'; // Replace with a relevant win image URL
    } else if (userStatus === 'lose') {
        notificationTitle = `Better Luck Next Time, ${userName}!`;
        notificationMessage = `You lost the game "${gameName}". Don't give up, try again to win next time!`;
        notificationImage = 'https://game.gamechamp.in/img/cash.png'; // Replace with a relevant lose image URL
    } else {
        throw new Error('Invalid user status. Must be "win" or "lose".');
    }

    // Notification payload
    const notificationData = {
        app_id: `81fea1fa-8bfc-4526-9a47-c84411b569ae`, // Your OneSignal App ID
        include_player_ids: [notificationId],
        // included_segments: ["All"],
        headings: { en: notificationTitle },
        contents: { en: notificationMessage },
        small_icon: 'logo',
        large_icon: notificationImage,
        priority: 10
    };

    try {
        const response = await axios.post('https://onesignal.com/api/v1/notifications', notificationData, {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `os_v2_app_qh7kd6ul7rcsngshzbcbdnljv26o4cwnvqwemye3jz2qjqls4nyhdisffiek7oquaryu6yzq6zvspo44jkveax7ozlat5ilif5hjeoq` // Your OneSignal REST API Key
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error sending notification:', error.response ? error.response.data : error.message);
        throw new Error('Failed to send notification');
    }
}

sendNotification("123e4567-e89b-12d3-a456-426614174000", "win", "dev", '0000')
module.exports = sendNotification;