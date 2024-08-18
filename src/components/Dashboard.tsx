import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";

interface Correspondence {
  id: string;
  subject: string;
  recipient: string;
  status: string;
  createdAt: any;
}

const Dashboard: React.FC = () => {
  const [correspondences, setCorrespondences] = useState<Correspondence[]>([]);

  useEffect(() => {
    const q = query(collection(db, "correspondences"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const correspondencesData: Correspondence[] = [];
      querySnapshot.forEach((doc) => {
        correspondencesData.push({ id: doc.id, ...doc.data() } as Correspondence);
      });
      setCorrespondences(correspondencesData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="dashboard p-4">
      <h1 className="text-2xl font-bold mb-4">Correspondence Dashboard</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Subject</th>
              <th className="px-4 py-2 text-left">Recipient</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Date</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;