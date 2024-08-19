import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export const sendNotification = async (userId: string, message: string) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      message,
      createdAt: new Date(),
      read: false,
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

export const notifyStatusChange = async (correspondence: any) => {
  if (correspondence.status === 'Sent to AO') {
    await sendNotification(correspondence.actionOfficer, `New correspondence assigned: ${correspondence.subject}`);
    // In a real-world scenario, you'd also notify the AO's secretary here
  }
};