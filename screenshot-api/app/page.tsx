"use client";

import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const handleSubmit = () => {
    const sanitizedUrl = `https://${url}`;
  };
  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-2">
          <p>https://</p>
          <input
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
            }}
            type="text"
          />
        </div>
        <div>
          <input type="radio" name="mobile" id="mobile" />
          <input type="radio" name="tablet" id="tablet" />
          <input type="radio" name="desktop" id="desktop" />
        </div>
      </form>
    </>
  );
}
