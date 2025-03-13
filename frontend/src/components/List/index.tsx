import { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { scrollContainer } from '@/utils/scrollUtils';
import { Media } from '@/types';
import styles from '@/styles/Cards.module.scss';

const Cards = dynamic(() => import('./Cards'));
const FeatureCard = dynamic(() => import('./FeatureCards'));

interface ListProps {
  readonly defaultCard?: boolean;
  readonly heading: string;
  readonly topList?: boolean;
  readonly endpoint: string;
}

export default function List({
  defaultCard = true,
  heading,
  topList = false,
  endpoint
}: ListProps): React.ReactElement {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const getEndpoint = useCallback(async () => {
    try {
      const baseUrl = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_API_BASE;
      const result = await axios.get(`${baseUrl}${endpoint}`);
      setMedia(result.data.data);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    getEndpoint().then(() => {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    });
  }, [getEndpoint]);

  const scrollLeft = () => scrollContainer(scrollRef as React.RefObject<HTMLDivElement>, "left");
  const scrollRight = () => scrollContainer(scrollRef as React.RefObject<HTMLDivElement>, "right");

  return (
    <div className={styles.listContainermain}>
      <div className={styles.listContainer}>
        <strong className={styles.category}>{heading}</strong>
        <div className={`${styles.scrollContainer} ${topList ? styles.featureCardContainer : defaultCard ? styles.defaultCardContainer : styles.nonDefaultCardContainer}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}>
          {isHovered && (
            <button className={styles.scrollButton} onClick={scrollLeft}>
              <ChevronLeft size={32} />
            </button>
          )}
          <div className={styles.cardRow} ref={scrollRef}>
            {loading ? (
              Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className={styles.skeletonCard}></div>
              ))
            ) : media.length === 0 ? (
              <p>No results found.</p>
            ) : (
              media.map((item, index) =>
                topList && index >= 10 ? null : topList ? (
                  <FeatureCard key={item.id || index} index={index + 1} item={item} />
                ) : (
                  <Cards key={item.id || index} defaultCard={defaultCard} item={item} />
                )
              )
            )}
          </div>
          {isHovered && (
            <button className={styles.scrollButton} onClick={scrollRight}>
              <ChevronRight size={32} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
