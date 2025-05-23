/* eslint-disable @next/next/no-img-element */
import React, { useContext, useRef, useState } from 'react';
import styles from '@/styles/Modal.module.scss';
import { ModalContext } from '@/context/ModalContext';
import { Play, Add, Like, Dislike, Mute, Unmute } from '@/utils/icons';
import Button from '../Button';
import { Genre } from '@/types';
import { handleMouseEnter, handleMouseLeave } from "@/utils/mouseUtils";
import { useRouter } from "next/navigation";

export default function Modal() {
  const { modalData, setIsModal, isModal } = useContext(ModalContext);
  const { id, title, banner, rating, overview, genre } = modalData;
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [isTrailerPlaying, setIsTrailerPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const router = useRouter();
  const toggleMute = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(
        `{"event":"command","func":"${isMuted ? "unMute" : "mute"}","args":""}`,
        "https://www.youtube.com"
      );
      setIsMuted(!isMuted);
    }
  };
  const handleMoreInfo = () => {
    router.push(`/movie/${id}`);
  };
  return (
    <div className={styles.container}
      style={{ display: isModal ? 'flex' : 'none' }}
      onMouseEnter={() => handleMouseEnter(setIsTrailerPlaying, setTrailerUrl, timerRef, id)}
      onMouseLeave={() => handleMouseLeave(setIsTrailerPlaying, timerRef, setIsMuted)}>
      <div className={styles.overlay} onClick={() => setIsModal(false)}></div>
      <div className={styles.modal}>
        <div className={styles.spotlight}>
          {isTrailerPlaying && trailerUrl ? (
            <iframe
              ref={iframeRef}
              className={styles.spotlight__trailer}
              src={`${trailerUrl}?autoplay=1&mute=1&enablejsapi=1&origin=${window.location.origin}`}
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          ) : (
            <img
              src={banner}
              alt="spotlight"
              className={styles.spotlight__image}
            />
          )}
          <div className={styles.details}>
            <div className={styles.title}>{title}</div>
            <div className={styles.buttonRow}>
              <Button label='Play' filled Icon={Play} onClick={handleMoreInfo}/>
              <Button Icon={Add} rounded />
              <Button Icon={Like} rounded />
              <Button Icon={Dislike} rounded />
              {isTrailerPlaying && (
                <Button
                  Icon={isMuted ? Mute : Unmute}
                  rounded
                  onClick={toggleMute}
                />
              )}
            </div>
            <div className={styles.greenText}>{`${Math.round(rating * 10)}% Match`}</div>
          </div>
        </div>

        <div className={styles.cross} onClick={() => setIsModal(false)}>
          &#10005;
        </div>
        <div className={styles.bottomContainer}>
          <div className={styles.column}>{overview}</div>
          <div className={styles.column}>
            <div className={styles.genre}>Genre: {renderGenre(genre)} </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderGenre(genre: Genre[]) {
  return (
    <div className={styles.row}>
      {genre.map((item, index) => {
        const isLast = index === genre.length - 1;
        return (
          <div key={index} className={styles.row}>
            <span>&nbsp;{item.name}</span>
            {!isLast && <div>,</div>}
          </div>
        );
      })}
    </div>
  );
}
