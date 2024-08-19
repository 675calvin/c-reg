import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthProvider";
import PermissionGate from "./PermissionGate";
import { notifyStatusChange } from "../utils/notifications";
import { logChange } from "../utils/auditTrail";

interface Correspondence {
  id: string;
  subject: string;
  recipient: string;
  content: string;
  status: string;
  attachmentUrl: string;
  createdAt: Date;
  actionOfficer: string;
  aoComments: string;
  dateActionFinalized: Date | null;
}

const CorrespondenceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [correspondence, setCorrespondence] = useState<Correspondence | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStatus, setEditedStatus] = useState("");
  const [editedAoComments, setEditedAoComments] = useState("");
  const [editedDateActionFinalized, setEditedDateActionFinalized] = useState<Date | null>(null);

  useEffect(() => {
    const fetchCorrespondence = async () => {
      if (!id) return;
      const docRef = doc(db, "correspondences", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCorrespondence({ id: docSnap.id, ...docSnap.data() } as Correspondence);
        setEditedStatus(docSnap.data().status);
        setEditedAoComments(docSnap.data().aoComments || "");
        setEditedDateActionFinalized(docSnap.data().dateActionFinalized ? new Date(docSnap.data().dateActionFinalized.seconds * 1000) : null);
      } else {
        console.log("No such document!");
        navigate("/");
      }
    };

    fetchCorrespondence();
  }, [id, navigate]);

  const handleUpdate = async () => {
    if (!id || !correspondence || !user) return;
    const docRef = doc(db, "correspondences", id);
    const updateData: Partial<Correspondence> = {};
    const changes: {[key: string]: any} = {};

    if (user.role === 'level1AO' || user.role === 'secretary' || user.role === 'admin') {
      if (editedStatus !== correspondence.status) {
        updateData.status = editedStatus;
        changes.status = { from: correspondence.status, to: editedStatus };
      }
    }

    if (user.role === 'level2AO' || user.role === 'admin') {
      if (editedAoComments !== correspondence.aoComments) {
        updateData.aoComments = editedAoComments;
        changes.aoComments = { from: correspondence.aoComments, to: editedAoComments };
      }
      if (editedDateActionFinalized !== correspondence.dateActionFinalized) {
        updateData.dateActionFinalized = editedDateActionFinalized;
        changes.dateActionFinalized = { 
          from: correspondence.dateActionFinalized ? correspondence.dateActionFinalized.toDate().toISOString() : null, 
          to: editedDateActionFinalized ? editedDateActionFinalized.toISOString() : null 
        };
      }
    }

    if (Object.keys(updateData).length > 0) {
      await updateDoc(docRef, updateData);
      const updatedCorrespondence = { ...correspondence, ...updateData };
      setCorrespondence(updatedCorrespondence);
      setIsEditing(false);

      // Log the changes
      await logChange(user.uid, id, changes);

      // Send notification if status changed to 'Sent to AO'
      if (updateData.status === 'Sent to AO') {
        await notifyStatusChange(updatedCorrespondence);
      }
    }
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
          <PermissionGate allowedRoles={['level1AO', 'secretary', 'admin']}>
            {isEditing ? (
              <select
                value={editedStatus}
                onChange={(e) => setEditedStatus(e.target.value)}
                className="ml-2 rounded border-gray-300"
              >
                <option value="Registered">Registered</option>
                <option value="Pending Instructions">Pending Instructions</option>
                <option value="Sent to AO">Sent to AO</option>
                <option value="Processing">Processing</option>
                <option value="Closed/Archived">Closed/Archived</option>
              </select>
            ) : (
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                correspondence.status === 'Registered' ? 'bg-yellow-200 text-yellow-800' :
                correspondence.status === 'Pending Instructions' ? 'bg-blue-200 text-blue-800' :
                correspondence.status === 'Sent to AO' ? 'bg-purple-200 text-purple-800' :
                correspondence.status === 'Processing' ? 'bg-orange-200 text-orange-800' :
                'bg-green-200 text-green-800'
              }`}>
                {correspondence.status}
              </span>
            )}
          </PermissionGate>
        </p>
        <PermissionGate allowedRoles={['level1AO', 'level2AO', 'secretary', 'admin']}>
          <p className="mb-2"><strong>Action Officer:</strong> {correspondence.actionOfficer}</p>
        </PermissionGate>
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Content:</h2>
          <p className="whitespace-pre-wrap">{correspondence.content}</p>
        </div>
        <PermissionGate allowedRoles={['level2AO', 'admin']}>
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">AO Comments:</h2>
            {isEditing ? (
              <textarea
                value={editedAoComments}
                onChange={(e) => setEditedAoComments(e.target.value)}
                className="w-full p-2 border rounded"
                rows={4}
              />
            ) : (
              <p className="whitespace-pre-wrap">{correspondence.aoComments}</p>
            )}
          </div>
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Date Action Finalized:</h2>
            {isEditing ? (
              <input
                type="date"
                value={editedDateActionFinalized ? editedDateActionFinalized.toISOString().split('T')[0] : ''}
                onChange={(e) => setEditedDateActionFinalized(e.target.value ? new Date(e.target.value) : null)}
                className="p-2 border rounded"
              />
            ) : (
              <p>{correspondence.dateActionFinalized ? correspondence.dateActionFinalized.toDate().toLocaleDateString() : 'Not finalized'}</p>
            )}
          </div>
        </PermissionGate>
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
        <PermissionGate allowedRoles={['level1AO', 'level2AO', 'secretary', 'admin']}>
          {isEditing ? (
            <button
              onClick={handleUpdate}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save Changes
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Edit
            </button>
          )}
        </PermissionGate>
      </div>
    </div>
  );
};

export default CorrespondenceDetail;