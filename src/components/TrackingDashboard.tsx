import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface CorrespondenceStatus {
  status: string;
  count: number;
}

const TrackingDashboard: React.FC = () => {
  const [statusCounts, setStatusCounts] = useState<CorrespondenceStatus[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'correspondences'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const counts: { [key: string]: number } = {};
      querySnapshot.forEach((doc) => {
        const status = doc.data().status;
        counts[status] = (counts[status] || 0) + 1;
      });
      const statusData = Object.entries(counts).map(([status, count]) => ({ status, count }));
      setStatusCounts(statusData);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="tracking-dashboard p-4">
      <h2 className="text-2xl font-bold mb-4">Correspondence Tracking Dashboard</h2>
      <div className="chart-container" style={{ width: '100%', height: 300 }}>
        <BarChart
          width={600}
          height={300}
          data={statusCounts}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="status" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </div>
    </div>
  );
};

export default TrackingDashboard;