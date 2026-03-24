import { useEffect, useRef } from "react";
import { Howl } from "howler";

let ambientSound = null;

export function initAudio(BASE) {
  if (ambientSound) return;
  ambientSound = new Howl({
    src: [`${BASE}sounds/ambient.mp3`],
    loop: true,
    volume: 0.3,
    autoplay: false,
  });
}

export function playAmbient() {
  if (ambientSound && !ambientSound.playing()) ambientSound.play();
}

export function stopAmbient() {
  if (ambientSound) ambientSound.stop();
}

export function playClick(BASE) {
  new Howl({ src: [`${BASE}sounds/click.mp3`], volume: 0.5 }).play();
}

export function playWhoosh(BASE) {
  new Howl({ src: [`${BASE}sounds/whoosh.mp3`], volume: 0.4 }).play();
}

export default function AudioManager({ enabled }) {
  const BASE = import.meta.env.BASE_URL;

  useEffect(() => {
    initAudio(BASE);
  }, []);

  useEffect(() => {
    if (enabled) playAmbient();
    else stopAmbient();
  }, [enabled]);

  return null;
}
