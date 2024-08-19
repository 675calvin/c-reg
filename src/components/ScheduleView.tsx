import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthProvider';

interface ScheduleItem {
  id: string;
  subject: string;
  deadlineDate: Date;
}

const ScheduleView: React.FC = () => {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'correspondences'),
      where('actionOfficer', '==', user.displayName),
      where('status', 'in', ['Sent to AO', 'Processing']),
      orderBy('deadlineDate')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items: ScheduleItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.deadlineDate) {
          items.push({
            id: doc.id,
            subject: data.subject,
            deadlineDate: data.deadlineDate.toDate(),
          });
        }
      });
      setScheduleItems(items);
    });

    return unsubscribe;
    }, [user]);

      return (
        <div className="schedule-view p-4">
          <h2 className="text-xl font-bold mb-4">Upcoming Deadlines</h2>
          <ul className="space-y-2">
            {scheduleItems.map((item) => (
              <li key={item.id} className="bg-white p-2 rounded shadow">
                <span className="font-semibold">{item.subject}</span>
                <br />
                <span className="text-sm text-gray-600">
                  Deadline: {item.deadlineDate.toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      );
    };

    export default ScheduleView;