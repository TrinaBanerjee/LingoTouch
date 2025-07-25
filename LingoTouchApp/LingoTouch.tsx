// LingoTouch.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function LingoTouch() {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [brailleText, setBrailleText] = useState("");
  const [inputLang, setInputLang] = useState("en");
  const [outputLang, setOutputLang] = useState("es");
  const [dyslexiaFont, setDyslexiaFont] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    document.body.style.backgroundColor = highContrast ? "#000" : "#fff";
    document.body.style.color = highContrast ? "#fff" : "#000";
  }, [highContrast]);

  const translate = async () => {
    const res = await fetch("/api/translate", {
      method: "POST",
      body: JSON.stringify({ text: inputText, sourceLang: inputLang, targetLang: outputLang }),
    });
    const data = await res.json();
    setTranslatedText(data.translated);
    setBrailleText(toBraille(data.translated));
    speakText(data.translated);
    triggerVibration();
  };

  const toBraille = (text: string) => {
    const brailleMap: { [key: string]: string } = {
      a: "⠁", b: "⠃", c: "⠉", d: "⠙", e: "⠑", f: "⠋", g: "⠛", h: "⠓",
      i: "⠊", j: "⠚", k: "⠅", l: "⠇", m: "⠍", n: "⠝", o: "⠕", p: "⠏",
      q: "⠟", r: "⠗", s: "⠎", t: "⠞", u: "⠥", v: "⠧", w: "⠺", x: "⠭",
      y: "⠽", z: "⠵", " ": " ",
    };
    return text.toLowerCase().split("").map(c => brailleMap[c] || "").join("");
  };

  const recordSpeech = () => {
    const recognition = new (window.SpeechRecognition || (window as any).webkitSpeechRecognition)();
    recognition.lang = inputLang;
    recognition.onresult = (event: any) => {
      setInputText(event.results[0][0].transcript);
    };
    recognition.start();
  };

  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = outputLang;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  };

  const triggerVibration = () => {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  const downloadBrailleFile = () => {
    const blob = new Blob([brailleText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'braille.txt';
    link.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === 'Enter') translate();
  };

  return (
    <div
      className={\`p-6 max-w-xl mx-auto space-y-4 outline-none focus:outline-none \${dyslexiaFont ? 'font-[OpenDyslexic]' : ''}\`}
      tabIndex={0}
    >
      <h1 className="text-2xl font-bold">LingoTouch Translator</h1>

      <div className="flex justify-between space-x-2">
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={dyslexiaFont} onChange={() => setDyslexiaFont(!dyslexiaFont)} />
          <span>Dyslexia-Friendly Font</span>
        </label>
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={highContrast} onChange={() => setHighContrast(!highContrast)} />
          <span>High Contrast Mode</span>
        </label>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <label className="block mb-1 font-semibold">Input Language</label>
          <select value={inputLang} onChange={(e) => setInputLang(e.target.value)} className="w-full p-2 border rounded">
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="hi">Hindi</option>
            <option value="bn">Bengali</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block mb-1 font-semibold">Output Language</label>
          <select value={outputLang} onChange={(e) => setOutputLang(e.target.value)} className="w-full p-2 border rounded">
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="hi">Hindi</option>
            <option value="bn">Bengali</option>
          </select>
        </div>
      </div>

      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full p-2 border rounded"
        placeholder="Enter text to translate (Ctrl + Enter to submit)"
        aria-label="Text input area for translation"
      />

      <div className="flex space-x-2">
        <Button onClick={translate} aria-label="Translate text">Translate</Button>
        <Button onClick={recordSpeech} aria-label="Speak text">🎤 Speak</Button>
        <Button onClick={downloadBrailleFile} aria-label="Download Braille output">📥 Braille</Button>
      </div>

      {translatedText && (
        <div className="mt-4" aria-live="polite">
          <h2 className="font-semibold">Translation:</h2>
          <p>{translatedText}</p>
          <h2 className="font-semibold mt-2">Braille Output:</h2>
          <p className="font-braille text-xl">{brailleText}</p>
        </div>
      )}

      <div className="mt-6">
        <h3 className="font-semibold">Sign Language Support</h3>
        <div className="border p-2 bg-gray-100 rounded text-sm">
          <p className="mb-2">Below is a sign language animation based on the translated text:</p>
          {translatedText && (
            <img
              src={\`https://media.signlanguageapi.com/animate?text=\${encodeURIComponent(translatedText)}\`}
              alt="Sign language animation"
              className="w-full max-h-64 object-contain rounded border"
            />
          )}
        </div>
      </div>
    </div>
  );
}
