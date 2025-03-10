import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';

import { Media } from '@/types';
import styles from '@/styles/Cards.module.scss';

const Cards = dynamic(() => import('./Cards'));
const FeatureCard = dynamic(() => import('./FeatureCards'));

interface ListProps {
  defaultCard?: boolean;
  heading: string;
  topList?: boolean;
  endpoint: string;
}

export default function List({
  defaultCard = true,
  heading,
  topList = false,
  endpoint
}: ListProps): React.ReactElement {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  // Move the getEndpoint function outside of useEffect to avoid defining it on every render
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
  }, [endpoint]); // Add endpoint to the dependency array of the callback function

  useEffect(() => {
    getEndpoint();
  }, [getEndpoint]); // Ensure that the hook depends on the updated getEndpoint function

  return (
    <div className={styles.listContainer}>
      <strong className={styles.category}>{heading}</strong>
      {loading ? (
        <p>Loading...</p> // <-- Shows loading text
      ) : media.length === 0 ? (
        <p>No results found.</p> // <-- Shows fallback text if empty
      ) : (
        <div className={styles.cardRow}>
          {media.map((item, index) => {
            if (topList && index >= 10) return null;
            return topList ? (
              <FeatureCard key={item.id || index} index={index + 1} item={item} />
            ) : (
              <Cards key={item.id || index} defaultCard={defaultCard} item={item} />
            );
          })}
        </div>
      )}
    </div>
  );
}
