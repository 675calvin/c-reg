import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { useAuth } from "./AuthProvider";

const AddCorrespondence: React.FC = () => {
  const [subject, setSubject] = useState("");
  const [recipient, setRecipient] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("pending");
  const [attachment, setAttachment] = useState<File | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log("Selected file:", file.name, file.type);
      setAttachment(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to create a correspondence.");
      return;
    }

    try {
      let attachmentUrl = "";
      if (attachment) {
        const attachmentRef = ref(storage, `attachments/${user.uid}/${Date.now()}_${attachment.name}`);
        await uploadBytes(attachmentRef, attachment);
        attachmentUrl = await getDownloadURL(attachmentRef);
      }

      await addDoc(collection(db, "correspondences"), {
        userId: user.uid,
        subject,
        recipient,
        content,
        status,
        attachmentUrl,
        createdAt: serverTimestamp(),
      });

      alert("Correspondence created successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error creating correspondence:", error);
      alert("Failed to create correspondence. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-correspondence p-4 mx-auto max-w-2xl">
      <h2 className="text-2xl font-bold mb-4 text-center">Create New Correspondence</h2>

      <div className="mb-4">
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
        <input
          type="text"
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">Recipient</label>
        <input
          type="text"
          id="recipient"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          rows={4}
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        >
          <option value="pending">Pending</option>
          <option value="sent">Sent</option>
          <option value="received">Received</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="attachment" className="block text-sm font-medium text-gray-700">Attachment (PDF or Image)</label>
        <input
          type="file"
          id="attachment"
          onChange={handleAttachmentChange}
          accept=".pdf,.jpg,.jpeg,.png"
          className="mt-1 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-indigo-50 file:text-indigo-700
            hover:file:bg-indigo-100"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
      >
        Create Correspondence
      </button>
    </form>
  );
};

export default AddCorrespondence;