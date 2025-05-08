import React, { useState } from "react";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xnndvdar";

export default function AppointmentForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    date: "",
    time: "",
    notes: "",
  });
  const [status, setStatus] = useState<"idle"|"sending"|"success"|"error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) setStatus("success");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success")
    return <p className="text-green-600">Thanks! We’ve received your request and will contact you soon.</p>;

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      {["name","email","phone","service","date","time"].map((field) => (
        <input
          key={field}
          name={field}
          type={field === "email" ? "email" : field === "date" ? "date" : field === "time" ? "time" : "text"}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          value={(form as any)[field]}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded focus:outline-none"
        />
      ))}
      <textarea
        name="notes"
        placeholder="Additional notes"
        value={form.notes}
        onChange={handleChange}
        className="w-full border px-3 py-2 rounded focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
      >
        {status === "sending" ? "Sending…" : "Book Appointment"}
      </button>
      {status === "error" && <p className="text-red-600">Error sending request. Please try again.</p>}
    </form>
  );
}
