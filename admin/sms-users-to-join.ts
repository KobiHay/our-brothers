const twilio = require('twilio');
import * as admin from 'firebase-admin';
import { firebaseAdmin, twilioCrendentials } from '../config';

admin.initializeApp({
  credential: admin.credential.cert(firebaseAdmin as any),
  databaseURL: 'https://our-brothers.firebaseio.com'
});

const db = admin.database();
const client = new twilio(
  twilioCrendentials.accountSid,
  twilioCrendentials.authToken
);

if (!client || !client.messages || !client.messages.create) {
  console.warn('Failed to send SMS, failed to initialize twilio');
} else {
  db.ref('/users')
    .once('value')
    .then(usersSnapshot => {
      let contacts = {};
      let promises = [];

      const users = usersSnapshot.val();

      for (let userId in users) {
        const user = users[userId];
        if (
          user &&
          user.role === 'bereaved' &&
          userId === '7XfafBUGGdWCnae8vOS1d0kKk3Q2' &&
          user.profile &&
          user.profile.phoneNumber
        ) {
          contacts[user.profile.phoneNumber] = userId;
        }
      }

      console.log(Object.keys(contacts).length + ' phones.');
      for (const phone in contacts) {
        if (phone === '+972526244742') {
          const message = {
            body: `אנחנו שמחים לעדכן על פתיחת ההרשמה של מפגשי 'האחים שלנו' לשנת 2020, הכנסו לאתר וקחו חלק> www.ourbrothers.co.il. להסרה השיבו "הסר"`,
            to: phone,
            from: 'OurBrothers'
          };
          promises.push(
            client.messages
              .create(message)
              .then(message =>
                console.log(
                  `SMS sent to ${phone} ${contacts[phone]} - ${message.sid}`
                )
              )
          );
          // promises.push((new Promise(resolve => resolve())).then((message) => console.log('SMS sent to ' + phone + ' + ' + contacts[phone])))
        }
      }

      Promise.all(promises)
        .then(() => {
          console.log('Successfully.');
        })
        .catch(error => {
          console.error(error);
        });
    });
}
