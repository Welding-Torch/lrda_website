import React, { useEffect, useRef, useState } from "react";
import AudioPlayer from "react-h5-audio-player";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { randomUUID } from "crypto";
import { toast } from "sonner";
import { uploadAudio } from "../utils/audioUpload";
import { FileUp } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AudioType } from "../models/media_class";
import { Input } from "@/components/ui/input";

type AudioPickerProps = {
  audioArray: AudioType[];
  setAudio?: React.Dispatch<React.SetStateAction<AudioType[]>>;
};

const AudioPicker: React.FC<AudioPickerProps> = ({ audioArray, setAudio }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [curRec, setCurRec] = useState<string | undefined>();
  const [placeVal, setPlaceVal] = useState<string>("No Recordings");
  const [selectedFile, setSelectedFile] = useState(null);
  const audioPlayerRef = useRef<AudioPlayer>(null);

  useEffect(() => {
    if (audioArray.length >= 1) {
      setPlaceVal("Select Recording");
    } else {
      setPlaceVal("No Recordings");
    }
    if (audioPlayerRef.current && audioPlayerRef.current.audio.current) {
      audioPlayerRef.current.audio.current.pause();
      audioPlayerRef.current.audio.current.currentTime = 0;
    }
    setCurRec(undefined);
    setCurrentIdx(0);

    audioPlayerRef?.current?.audio?.current?.pause();
  }, [audioArray]);

  const handleSelectChange = (selectedURI: string) => {
    const selectedIdx = audioArray.findIndex(
      (audio) => audio.uri === selectedURI
    );
    if (selectedIdx >= 0) {
      setCurRec(selectedURI);
      setCurrentIdx(selectedIdx);
    }
  };

  const handleIncrementRecs = () => {
    const nextIdx = (currentIdx + 1) % audioArray.length;
    setCurrentIdx(nextIdx);
    setCurRec(audioArray[nextIdx].uri);
  };

  const handleDecrementRecs = () => {
    const prevIdx = (currentIdx - 1 + audioArray.length) % audioArray.length;
    setCurrentIdx(prevIdx);
    setCurRec(audioArray[prevIdx].uri);
  };

  async function handleFileChange(event: any) {
    toast("Status Update", {
      description: "Audio upload in progress.",
      duration: 2000,
    });

    const file = event.target.files[0];
    const location = await uploadAudio(file);
    if (location != "error") {
      const newAudio = new AudioType({
        type: "audio",
        uuid: randomUUID.toString(),
        uri: location,
        name: file.name,
        isPlaying: false,
        duration: "0:00",
      });

      toast("Status Update", {
        description: "Audio upload success!",
        duration: 4000,
      });

      setAudio([...audioArray, newAudio]);
    } else {
      console.log("UPLOAD FAILED");
      toast("Status Update", {
        description: "Audio Upload Failed! Please try again later.",
        duration: 4000,
      });
    }
  }

  const currentAudio = audioArray.find((audio) => audio.uri === curRec);
  const currentUUID = currentAudio ? currentAudio.uuid : null;

  return (
    <div className="flex flex-col items-center p-2 h-min min-w-[90px] max-w-[280px] shadow-sm rounded-md border border-border bg-white">
      <div className="flex flex-row max-w-[280px] w-[100%] justify-evenly align-center items-center cursor-pointer h-10">
        <Popover>
          <PopoverTrigger asChild>
            <FileUp className="" />
          </PopoverTrigger>
          <PopoverContent className="z-30">
            <div className="flex p-4 flex-col justify-center items-center w-96 min-w-[90px] max-w-[280px] h-min bg-white shadow-lg rounded-md">
              <div className="px-4">Upload Media Here.</div>
              <div className="px-4 mb-3">It must be of type '.mp3'</div>
              <Input
                type="file"
                accept=".mp3"
                onChange={(e) => handleFileChange(e)}
              />
            </div>
          </PopoverContent>
        </Popover>

        <Select
          onValueChange={handleSelectChange}
          key={currentUUID}
          defaultValue={curRec}
        >
          <SelectTrigger placeholder={placeVal} className="w-[180px]">
            <SelectValue
              placeholder={placeVal}
              defaultValue={"SelectRecording"}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {audioArray.length >= 1 ? (
                audioArray.map((audio) => (
                  <SelectItem key={audio.uuid} value={audio.uri}>
                    {audio.name}
                  </SelectItem>
                ))
              ) : (
                <SelectLabel>No Recordings</SelectLabel>
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <AudioPlayer
        ref={audioPlayerRef}
        src={curRec}
        onPlay={(e) => console.log("onPlay")}
        className="flex flex-row p-3 rounded-md w-[90]"
        onClickNext={handleIncrementRecs}
        onClickPrevious={handleDecrementRecs}
        key={currentUUID}
      />
    </div>
  );
};

export default AudioPicker;
