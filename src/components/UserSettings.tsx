import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { signOut as firebaseSignOut } from "firebase/auth";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

interface UserPreferences {
  theme: 'light' | 'dark' | 'jungle';
}

const UserSettings: React.FC = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      fetchUserPreferences(user.uid);
    } else {
      navigate("/signin");
    }
  }, [user, navigate]);

  const fetchUserPreferences = async (userId: string) => {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setPreferences(userData.preferences || { theme: 'light' });
    }
  };

  const handleDisplayNameUpdate = async () => {
    if (user) {
      try {
        await updateProfile(user, { displayName });
        alert("Display name updated successfully!");
      } catch (error) {
        console.error("Error updating display name:", error);
        alert("Failed to update display name. Please try again.");
      }
    }
  };

  const handlePreferencesUpdate = async () => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      try {
        await setDoc(userDocRef, { preferences }, { merge: true });
        alert("Preferences updated successfully!");
      } catch (error) {
        console.error("Error updating preferences:", error);
        alert("Failed to update preferences. Please try again.");
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Failed to sign out. Please try again.");
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="user-settings p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">User Settings</h2>

      <div className="bg-white shadow-md rounded-lg p-4 mb-4">
        <h3 className="text-xl font-semibold mb-2">Account Information</h3>
        <p className="mb-2"><strong>Email:</strong> {user.email}</p>
        <div className="mb-4">
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">Display Name</label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <button
          onClick={handleDisplayNameUpdate}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Update Display Name
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-4 mb-4">
        <h3 className="text-xl font-semibold mb-2">Theme Preferences</h3>
        <div className="flex space-x-4 mb-4">
          {['light', 'dark', 'jungle'].map((theme) => (
            <button
              key={theme}
              onClick={() => setPreferences({ ...preferences, theme: theme as 'light' | 'dark' | 'jungle' })}
              className={`px-4 py-2 rounded ${preferences.theme === theme ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={handlePreferencesUpdate}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Update Preferences
        </button>
      </div>

      <button
        onClick={handleSignOut}
        className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Sign Out
      </button>
    </div>
  );
};

export default UserSettings;