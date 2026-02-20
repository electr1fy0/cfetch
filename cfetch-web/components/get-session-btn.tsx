"use client";

export default function GetSessionButton() {
  async function getSession() {
    const res = await fetch("http://localhost:8080/session", {
      credentials: "include",
    });
    const data = await res.json();
    console.log(data);
  }

  return <div onClick={getSession}>Get Session</div>;
}
