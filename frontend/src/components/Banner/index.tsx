/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import { Media } from '@/types';
import { ModalContext } from '@/context/ModalContext';
import styles from '@/styles/Banner.module.scss';
import Loading from '@/components/Loading';
import { getTrailerUrl } from '@/utils/trailerUtils';
import BannerVideo from './BannerVideo';
import BannerDetails from './BannerDetails';
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
        const result = await axios.get('/api/popular?type=movie');
        const randomIndex = Math.floor(Math.random() * 20);
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
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);


  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => {
      setIsTrailerPlaying(true);
    }, 5000);
  };
  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsTrailerPlaying(false);
  };

  if (loading) return <Loading />;

  return (
    <div className={styles.spotlight} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {isTrailerPlaying && trailerUrl ? (
        <BannerVideo trailerUrl={trailerUrl}/>
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
