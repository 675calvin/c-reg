import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export const logChange = async (userId: string, correspondenceId: string, changes: object) => {
  try {
    await addDoc(collection(db, 'auditTrail'), {
      userId,
      correspondenceId,
      changes,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error logging change:', error);
  }
};