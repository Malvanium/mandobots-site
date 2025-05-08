// src/components/AppointmentForm.tsx
import React, { useState } from "react";

/**
 * Stand-alone appointment request form that posts to Formspree.
 * Styling uses existing Tailwind red/off-white palette.
 */

// Hard-coded endpoint for reliability (override with env if desired)
const FORM_ENDPOINT = process.env.REACT_APP_FORM_ENDPOINT ||
  "https://formspree.io/f/xnndvdar";

interface FormState {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  message: string;
}

type Status = "idle" | "sending" | "success" | "error";

const AppointmentForm: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    message: "",
  });
  const [status, setStatus] = useState<Status>("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          date: form.date,
          time: form.time,
          message: form.message,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("success");
      setForm({ name: "", email: "", phone: "", date: "", time: "", message: "" });
    } catch (err) {
      console.error("Form submission failed", err);
      setStatus("error");
    }
  };

  return (
    <section className="max-w-xl mx-auto p-6 bg-offwhite rounded-lg shadow-lg animate-fadeIn">
      <h2 className="text-2xl font-display font-bold text-primary mb-4">Book an Appointment</h2>

      {status === "success" ? (
        <p className="text-green-700 font-medium">Thanks! Your request has been sent.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-primary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name*"
              required
              className="px-4 py-2 bg-white rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email*"
              required
              className="px-4 py-2 bg-white rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone"
              className="px-4 py-2 bg-white rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                required
                className="px-4 py-2 bg-white rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                name="time"
                type="time"
                value={form.time}
                onChange={handleChange}
                required
                className="px-4 py-2 bg-white rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Additional details (optional)"
            rows={4}
            className="w-full px-4 py-2 bg-white rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {status === "error" && (
            <p className="text-red-600 text-sm">Oops, something went wrong. Please try again.</p>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full py-2 bg-primary text-offwhite font-semibold rounded hover:bg-neon transition-colors disabled:opacity-50"
          >
            {status === "sending" ? "Sending…" : "Submit Request"}
          </button>
        </form>
      )}
    </section>
  );
};

export default AppointmentForm;
