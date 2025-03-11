import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Button from '../Button';
import { Media } from '@/types';
import { Play, Info } from '@/utils/icons';
import { ModalContext } from '@/context/ModalContext';
import styles from '@/styles/Banner.module.scss';
import Loading from '@/components/Loading';

export default function Banner() {
  const [media, setMedia] = useState<Media>();
  const { setModalData, setIsModal } = useContext(ModalContext);
  const [loading, setLoading] = useState(true);

  const onClick = (data: Media) => {
    setModalData(data);
    setIsModal(true);
  };

  useEffect(() => {
    const random = Math.floor(Math.random() * 20);
    const getMedia = async () => {
      try {
        const result = await axios.get('/api/popular?type=movie');
        setMedia(result.data.data[random]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getMedia();
  }, []);

  if(loading) return <Loading />;

  return (
    <div className={styles.spotlight}>
      <Image
        src={media?.banner ?? '/login-banner.jpg'}
        alt="spotlight"
        className={styles.spotlight__image}
        fill
      />      
      <div className={styles.spotlight__details}>
        <div className={styles.title}>{media?.title}</div>
        <div className={styles.synopsis}>{media?.overview}</div>
        <div className={styles.buttonRow}>
          <Button label='Play' filled Icon={Play} />
          {media && <Button label='More Info' Icon={Info} onClick={() => onClick(media)} />}
        </div>
      </div>
    </div>
  );
}
