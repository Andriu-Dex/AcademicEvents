const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const {
  sendPushNotificationToUser,
  buildNotificationPayload,
} = require('./pushNotification.service');

const prisma = new PrismaClient();

/**
 * Schedule event reminders (24 hours and 1 hour before event start)
 * Runs every hour
 */
const scheduleEventReminders = () => {
  // Run every hour at minute 0
  const cronSchedule = '0 * * * *';

  cron.schedule(cronSchedule, async () => {
    try {
      console.log('⏰ [CRON] Running event reminder job...');

      const now = new Date();

      // Find events starting in 24 hours (±30 minutes window)
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const window24Start = new Date(in24Hours.getTime() - 30 * 60 * 1000);
      const window24End = new Date(in24Hours.getTime() + 30 * 60 * 1000);

      // Find events starting in 1 hour (±15 minutes window)
      const in1Hour = new Date(now.getTime() + 1 * 60 * 60 * 1000);
      const window1Start = new Date(in1Hour.getTime() - 15 * 60 * 1000);
      const window1End = new Date(in1Hour.getTime() + 15 * 60 * 1000);

      // Get events for 24h reminder
      const events24h = await prisma.event.findMany({
        where: {
          startDate: {
            gte: window24Start,
            lte: window24End,
          },
          status: 'ACTIVE',
        },
        include: {
          registrations: {
            where: {
              status: {
                in: ['ACCEPTED', 'APPROVED'],
              },
            },
            include: {
              account: {
                select: {
                  id: true,
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Get events for 1h reminder
      const events1h = await prisma.event.findMany({
        where: {
          startDate: {
            gte: window1Start,
            lte: window1End,
          },
          status: 'ACTIVE',
        },
        include: {
          registrations: {
            where: {
              status: {
                in: ['ACCEPTED', 'APPROVED'],
              },
            },
            include: {
              account: {
                select: {
                  id: true,
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      let sent24h = 0;
      let sent1h = 0;

      // Send 24h reminders
      for (const event of events24h) {
        const eventTime = event.startDate.toLocaleTimeString('es-EC', {
          hour: '2-digit',
          minute: '2-digit',
        });

        const payload = buildNotificationPayload('EVENT_REMINDER_24H', {
          eventId: event.id,
          eventName: event.name,
          eventTime,
          eventImageUrl: event.coverImageUrl,
        });

        for (const registration of event.registrations) {
          try {
            await sendPushNotificationToUser(
              registration.account.id,
              event.tenantId,
              payload.notification,
              payload.data
            );
            sent24h++;
          } catch (error) {
            console.error(`Error sending 24h reminder to ${registration.account.id}:`, error);
          }
        }
      }

      // Send 1h reminders
      for (const event of events1h) {
        const payload = buildNotificationPayload('EVENT_REMINDER_1H', {
          eventId: event.id,
          eventName: event.name,
          eventImageUrl: event.coverImageUrl,
        });

        for (const registration of event.registrations) {
          try {
            await sendPushNotificationToUser(
              registration.account.id,
              event.tenantId,
              payload.notification,
              payload.data
            );
            sent1h++;
          } catch (error) {
            console.error(`Error sending 1h reminder to ${registration.account.id}:`, error);
          }
        }
      }

      console.log(`✅ [CRON] Event reminders sent: ${sent24h} (24h), ${sent1h} (1h)`);
    } catch (error) {
      console.error('❌ [CRON] Error in event reminder job:', error);
    }
  });

  console.log('✅ Event reminder cron job scheduled (every hour)');
};

/**
 * Initialize all scheduled notifications
 */
const initializeScheduledNotifications = () => {
  console.log('🚀 Initializing scheduled notifications...');

  try {
    scheduleEventReminders();

    console.log('✅ All scheduled notifications initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing scheduled notifications:', error);
  }
};

module.exports = {
  initializeScheduledNotifications,
  scheduleEventReminders,
};
