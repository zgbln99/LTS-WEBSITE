"use client";

import { useState } from "react";
import { RichTextField } from "@/builder/rich-text-field";

// Rich-Text-Eingabe für klassische <form>-Felder: synchronisiert den HTML-Wert
// in ein verstecktes Input, damit Server-Actions ihn auslesen können.
export function HtmlField({
  name,
  initialValue
}: {
  name: string;
  initialValue: string;
}) {
  const [value, setValue] = useState(initialValue || "<p></p>");
  return (
    <>
      <input type="hidden" name={name} value={value} />
      <RichTextField value={value} onChange={setValue} />
    </>
  );
}
