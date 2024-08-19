import { db } from '../firebase';
import { collection, query, where, getDocs, updateDoc, Timestamp } from 'firebase/firestore';

export const checkAndUpdateStatuses = async () => {
  const now = Timestamp.now();
  const q = query(
    collection(db, 'correspondences'),
    where('status', '==', 'Sent to AO'),
    where('dateToAO', '<=', now)
  );

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach(async (doc) => {
    await updateDoc(doc.ref, { status: 'Processing' });
  });
};