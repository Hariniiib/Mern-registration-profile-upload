
import { useState } from "react";
import axios from "axios";
import UsersList from "./UsersList";

const API_URL = "http://localhost:5000/api/register";
const emptyForm = { name: "", email: "", phone: "", password: "" };

export default function App() {
  const [form, setForm] = useState(emptyForm);
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUsers, setShowUsers] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setProfileImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("password", form.password);

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      const res = await axios.post(API_URL, formData);

      setStatus({ type: "success", text: res.data.message });
      setForm(emptyForm);
      setProfileImage(null);
      setPreview("");
    } catch (err) {
      const text =
        err.response?.data?.message || "Could not reach the server.";
      setStatus({ type: "error", text });
    } finally {
      setLoading(false);
    }
  };

  if (showUsers) {
    return <UsersList onBack={() => setShowUsers(false)} />;
  }

  return (
    <main className="page">
      <form className="card" onSubmit={handleSubmit}>
        <h1>Create your account</h1>

        <label>
          Full name
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Phone number
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            minLength={6}
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Profile Image
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </label>

        {preview && (
          <div>
            <p>Image Preview:</p>
            <img
              src={preview}
              alt="Profile preview"
              style={{
                width: "120px",
                height: "120px",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Register"}
        </button>

        {status && (
          <p className={`msg ${status.type}`}>
            {status.text}
          </p>
        )}
      </form>

      <button
        type="button"
        onClick={() => setShowUsers(true)}
        style={{ marginTop: "20px" }}
      >
        View Registered Users
      </button>
    </main>
  );
}
