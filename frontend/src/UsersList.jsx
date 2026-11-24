
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/users";
const IMAGE_URL = "http://localhost:5000";

export default function UsersList({ onBack }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(API_URL);
        setUsers(res.data);
      } catch (err) {
        setError("Unable to load users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <main className="page">
      <div className="card">
        <h1>Registered Users</h1>

        <button type="button" onClick={onBack}>
          Back to Registration
        </button>

        {loading && <p>Loading users...</p>}
        {error && <p className="msg error">{error}</p>}

        {!loading && !error && users.length === 0 && (
          <p>No registered users found.</p>
        )}

        {!loading && users.length > 0 && (
          <div>
            {users.map((user) => (
              <div
                key={user._id}
                style={{
                  border: "1px solid #ccc",
                  padding: "15px",
                  marginTop: "15px",
                  borderRadius: "10px",
                }}
              >
                {user.profileImage ? (
                  <img
                    src={`${IMAGE_URL}${user.profileImage}`}
                    alt={user.name}
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                  />
                ) : (
                  <p>No profile image</p>
                )}

                <h3>{user.name}</h3>
                <p>Email: {user.email}</p>
                <p>Phone: {user.phone || "Not provided"}</p>
                <p>
                  Registered:{" "}
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
