import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import TrackingDashboard from "./TrackingDashboard";
import ScheduleView from "./ScheduleView";

interface Correspondence {
  id: string;
  subject: string;
  recipient: string;
  status: string;
  createdAt: any;
  actionOfficer: string;
}

const Dashboard: React.FC = () => {
  const [correspondences, setCorrespondences] = useState<Correspondence[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    let q = query(collection(db, "correspondences"), orderBy("createdAt", "desc"));

    if (user.role === 'level2AO') {
      q = query(q, where("actionOfficer", "==", user.displayName));
    } else if (user.role === 'level3AO') {
      // Assuming level3AO can see correspondences assigned to their deputy
      q = query(q, where("actionOfficer", "==", user.deputy));
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const correspondencesData: Correspondence[] = [];
      querySnapshot.forEach((doc) => {
        correspondencesData.push({ id: doc.id, ...doc.data() } as Correspondence);
      });
      setCorrespondences(correspondencesData);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="dashboard p-4">
      <h1 className="text-2xl font-bold mb-4">Correspondence Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <TrackingDashboard />
        <ScheduleView />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Subject</th>
              <th className="px-4 py-2 text-left">Recipient</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Date</th>
              {(user?.role === 'level1AO' || user?.role === 'secretary' || user?.role === 'admin') && (
                <th className="px-4 py-2 text-left">Action Officer</th>
              )}
            </tr>
          </thead>
          <tbody>
            {correspondences.map((corr) => (
              <tr key={corr.id} className="border-b">
                <td className="px-4 py-2">
                  <Link to={`/correspondence/${corr.id}`} className="text-blue-600 hover:underline">
                    {corr.subject}
                  </Link>
                </td>
                <td className="px-4 py-2">{corr.recipient}</td>
                <td className="px-4 py-2">{corr.status}</td>
                <td className="px-4 py-2">
                  {corr.createdAt ? new Date(corr.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                </td>
                {(user?.role === 'level1AO' || user?.role === 'secretary' || user?.role === 'admin') && (
                  <td className="px-4 py-2">{corr.actionOfficer}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;