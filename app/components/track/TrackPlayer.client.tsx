import type { Sampler } from "tone";
import type ChordBeat from "../../music/ChordBeat";

import { useEffect, useRef, useState } from "react";
import { Part, Transport, start, now } from "tone";
import { loadInstruments } from "../../music/loader";
import Music from "../../music/Music";
import PlayChord from "./PlayChord";

export default function TrackPlayer({ sheet, bpm = 120 }: any) {
  const [isPlaying, setIsPlaying] = useState<Boolean>(false);
  const [, setIsReady] = useState<Boolean>(false);
  const [currentBpm, setCurrentBpm] = useState<number>();

  const piano = useRef<Sampler | null>(null);
  const drums = useRef<Sampler | null>(null);
  const music = new Music({ sheet });

  let chordsPart = useRef<Part | null>(null);
  let chordsPartChords = useRef<Array<ChordBeat> | null>(null);
  let drumPart = useRef<Part | null>(null);

  useEffect(() => {
    const { pianoSampler, drumSampler } = loadInstruments(() =>
      console.log("Instruments Ready")
    );
    setCurrentBpm(bpm);
    piano.current = pianoSampler;
    drums.current = drumSampler;
    // console.log("sheet prop", sheet);
    setupMusic();
  }, []);

  useEffect(() => {
    return () => {
      stop();
      disposeParts();
    };
  }, []);

  useEffect(() => {
    if (Transport.bpm && typeof currentBpm !== "undefined") {
      console.log("Effect bpm", currentBpm);
      Transport.bpm.value = currentBpm;
    }
  }, [currentBpm]);

  useEffect(() => {
    setIsReady(true);
  }, [chordsPart, drumPart]);

  function setupMusic(): void {
    const { chords, groove, loopEndTime } = music.generateMusic();

    chordsPart.current = new Part(function (time, note) {
      document
        .querySelector(`button.sheet-grid__chord.active`)
        ?.classList.remove("active");

      const activeElement = document.querySelector(
        `button.sheet-grid__chord.bar-${note.bar}.beat-${note.beat}`
      );

      activeElement?.classList.add("active");
      piano?.current?.triggerAttackRelease(
        note.note,
        note.duration,
        time,
        0.35
      );
    }, chords);

    chordsPart.current.start(0);
    chordsPart.current.loop = true;
    chordsPart.current.loopEnd = loopEndTime;
    chordsPartChords.current = chords;

    drumPart.current = new Part(function (time, note) {
      drums?.current?.triggerAttackRelease(
        note?.note,
        note?.duration,
        time,
        0.2
      );
    }, groove);
    drumPart.current.start(0);
    drumPart.current.loop = true;
    drumPart.current.loopEnd = loopEndTime;
  }

  function disposeParts() {
    chordsPart?.current?.dispose();
    drumPart?.current?.dispose();
  }

  function play(): void {
    Transport.swing = 1;
    setIsPlaying(true);
    if (typeof Transport.start !== "undefined") Transport.start();
    start();
  }

  function stop(): void {
    setIsPlaying(false);
    document
      .querySelector(`button.sheet-grid__chord.active`)
      ?.classList.remove("active");
    if (typeof Transport.stop !== "undefined") Transport.stop();
  }

  function clickChord(chord: ChordBeat): void {
    piano?.current?.triggerAttackRelease(chord.note, "8n", now(), 0.35);
  }

  if (!chordsPartChords.current) {
    return <div>Generating Chords</div>;
  }

  return (
    <div>
      <div className="">
        <div className="sheet-grid sheet-grid--player my-4">
          {chordsPartChords.current.map((chord: ChordBeat) => (
            <PlayChord key={chord.time} chord={chord} clickChord={clickChord} />
          ))}
        </div>
      </div>

      <div className="grid grid-flow-col gap-4">
        <label htmlFor="bpm-slider" className="flex flex-col">
          <span>bpm: {currentBpm}</span>
          <input
            onChange={(e) => setCurrentBpm(parseInt(e.target.value))}
            min="50"
            max="240"
            type="range"
            name="bpm-slider"
            id="bpm-slider"
          />
        </label>
        {isPlaying ? (
          <button className="button" onClick={stop}>
            Stop
          </button>
        ) : (
          <button className="button button--submit" onClick={play}>
            Play
          </button>
        )}
      </div>
    </div>
  );
}
