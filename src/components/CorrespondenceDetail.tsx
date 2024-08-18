import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

interface Correspondence {
  id: string;
  subject: string;
  recipient: string;
  content: string;
  status: string;
  attachmentUrl: string;
  createdAt: Date;
}

const CorrespondenceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [correspondence, setCorrespondence] = useState<Correspondence | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStatus, setEditedStatus] = useState("");

  useEffect(() => {
    const fetchCorrespondence = async () => {
      if (!id) return;
      const docRef = doc(db, "correspondences", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCorrespondence({ id: docSnap.id, ...docSnap.data() } as Correspondence);
        setEditedStatus(docSnap.data().status);
      } else {
        console.log("No such document!");
        navigate("/");
      }
    };

    fetchCorrespondence();
  }, [id, navigate]);

  const handleStatusUpdate = async () => {
    if (!id || !correspondence) return;
    const docRef = doc(db, "correspondences", id);
    await updateDoc(docRef, { status: editedStatus });
    setCorrespondence({ ...correspondence, status: editedStatus });
    setIsEditing(false);
  };

  if (!correspondence) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="correspondence-detail p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{correspondence.subject}</h1>
      <div className="bg-white shadow-md rounded-lg p-4">
        <p className="mb-2"><strong>Recipient:</strong> {correspondence.recipient}</p>
        <p className="mb-2"><strong>Date:</strong> {correspondence.createdAt.toDate().toLocaleString()}</p>
        <p className="mb-2">
          <strong>Status:</strong> {" "}
          {isEditing ? (
            <select
              value={editedStatus}
              onChange={(e) => setEditedStatus(e.target.value)}
              className="ml-2 rounded border-gray-300"
            >
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="received">Received</option>
              <option value="completed">Completed</option>
            </select>
          ) : (
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              correspondence.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
              correspondence.status === 'sent' ? 'bg-blue-200 text-blue-800' :
              correspondence.status === 'received' ? 'bg-purple-200 text-purple-800' :
              'bg-green-200 text-green-800'
            }`}>
              {correspondence.status}
            </span>
          )}
          {isEditing ? (
            <button
              onClick={handleStatusUpdate}
              className="ml-2 bg-blue-500 text-white px-2 py-1 rounded text-xs"
            >
              Save
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="ml-2 bg-gray-500 text-white px-2 py-1 rounded text-xs"
            >
              Edit
            </button>
          )}
        </p>
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Content:</h2>
          <p className="whitespace-pre-wrap">{correspondence.content}</p>
        </div>
        {correspondence.attachmentUrl && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Attachment:</h2>
            <a
              href={correspondence.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View Attachment
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default CorrespondenceDetail;