/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { Media } from "@/types";
import { ModalContext } from "@/context/ModalContext";
import styles from "@/styles/Banner.module.scss";
import Loading from "@/components/Loading";
import { getTrailerUrl } from "@/utils/trailerUtils";
import BannerVideo from "./BannerVideo";
import BannerDetails from "./BannerDetails";
import { handleMouseEnter, handleMouseLeave } from "@/utils/mouseUtils";

export default function Banner() {
  const [media, setMedia] = useState<Media>();
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const { setModalData, setIsModal } = useContext(ModalContext);
  const [loading, setLoading] = useState(true);
  const [isTrailerPlaying, setIsTrailerPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const onClick = (data: Media) => {
    setModalData(data);
    setIsModal(true);
  };

  useEffect(() => {
    if (hasFetched) return;
    const getMedia = async () => {
      setLoading(true);
      try {
        const result = await axios.get("/api/popular?type=movie");
        const getRandomIndex = (max: number) => {
          const array = new Uint32Array(1);
          window.crypto.getRandomValues(array);
          return array[0] % max;
        };
        const randomIndex = getRandomIndex(20);
        const mediaData = result.data.data[randomIndex];
        setMedia(mediaData);
        setTrailerUrl(await getTrailerUrl(mediaData.id));
        setHasFetched(true);
      } catch (error) {
        console.error("Error fetching media:", error);
        setTimeout(getMedia, 5000);
      } finally {
        setLoading(false);
      }
    };
    getMedia();
  }, [hasFetched]);

  useEffect(() => {
    const timer = timerRef.current;
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

  if (loading) return <Loading />;

  return (
    <div
      className={styles.spotlight}
      onMouseEnter={() => handleMouseEnter(setIsTrailerPlaying, setTrailerUrl, timerRef, media?.id ?? 0)}
      onMouseLeave={() => handleMouseLeave(setIsTrailerPlaying, timerRef)}
    >
      {isTrailerPlaying && trailerUrl ? (
        <BannerVideo trailerUrl={trailerUrl} />
      ) : (
        <div className={styles.spotlight__overlay}>
          <img
            src={media?.banner ?? "/login-banner.jpg"}
            alt="spotlight"
            className={styles.spotlight__image}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      {media && <BannerDetails media={media} onClick={onClick} />}
    </div>
  );
}