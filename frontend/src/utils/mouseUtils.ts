import { Dispatch, SetStateAction, RefObject } from "react";
import { getTrailerUrl } from "./trailerUtils";

export const handleMouseEnter = (
  setIsTrailerPlaying: Dispatch<SetStateAction<boolean>>,
  setTrailerUrl: Dispatch<SetStateAction<string | null>>,
  timerRef: RefObject<NodeJS.Timeout | null>,
  mediaId: number
) => {
  timerRef.current = setTimeout(async () => {
    const url = await getTrailerUrl(mediaId);
    if (url) {
      setTrailerUrl(url);
      setIsTrailerPlaying(true);
    }
  }, 3000);
};

export const handleMouseLeave = (
  setIsTrailerPlaying: Dispatch<SetStateAction<boolean>>,
  timerRef: RefObject<NodeJS.Timeout | null>,
  setIsMuted?: Dispatch<SetStateAction<boolean>>
) => {
  if (timerRef.current) {
    clearTimeout(timerRef.current);
  }
  setIsTrailerPlaying(false);
  if (setIsMuted) {
    setIsMuted(true);
  }
};


export const handleFeatureMouseEnter = (
  id: number,
  setImage: Dispatch<SetStateAction<string>>,
  banner: string,
  setTrailerUrl: Dispatch<SetStateAction<string | null>>,
  setIsTrailerPlaying: Dispatch<SetStateAction<boolean>>,
  timerRef: RefObject<NodeJS.Timeout | null>
) => {
  setImage(banner);
  timerRef.current = setTimeout(async () => {
    const url = await getTrailerUrl(id);
    if (url) {
      setTrailerUrl(url);
      setIsTrailerPlaying(true);
    }
  }, 3000);
};

export const handleFeatureMouseLeave = (
  setImage: Dispatch<SetStateAction<string>>,
  poster: string,
  setTrailerUrl: Dispatch<SetStateAction<string | null>>,
  setIsTrailerPlaying: Dispatch<SetStateAction<boolean>>,
  timerRef: RefObject<NodeJS.Timeout | null>
) => {
  setImage(poster);
  if (timerRef.current) {
    clearTimeout(timerRef.current);
  }
  setIsTrailerPlaying(false);
  setTrailerUrl(null);
};
