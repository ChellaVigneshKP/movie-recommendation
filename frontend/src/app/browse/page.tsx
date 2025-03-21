"use client";

import dynamic from 'next/dynamic';
import React, { useContext, useState, useEffect } from 'react';

import { ModalContext } from '@/context/ModalContext';
import styles from '@/styles/Browse.module.scss';
import { Section } from '@/types';
import Footer from '@/components/Footer';

const List = dynamic(() => import('@/components/List'), { ssr: false });
const Modal = dynamic(() => import('@/components/Modal'), { ssr: false });
const Layout = dynamic(() => import('@/components/Layout'), { ssr: false });
const Banner = dynamic(() => import('@/components/Banner'), { ssr: false });
const Navbar = dynamic(() => import('@/components/Navbar'), { ssr: false });

export default function Browse(): React.ReactElement {
  const { isModal } = useContext(ModalContext);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      {isModal && <Modal />}
      <Layout>
        <Navbar isScrolled={isScrolled} />
        <Banner />
        <div className={`${styles.contentContainer} -mb-0 md:-mb-20 lg:-mb-25`}>
          {sections.map((item, index) => {
            return (
              <List
                key={index}
                heading={item.heading}
                endpoint={item.endpoint}
                defaultCard={item?.defaultCard ?? true}
                topList={item?.topList}
              />
            );
          })}
        </div>
        <Footer />
      </Layout>
    </>
  );
}

const sections: Section[] = [
  {
    heading: 'Popular on Nextflix',
    endpoint: '/api/popular?type=tv'
  },
  {
    heading: 'Horror Movies',
    endpoint: '/api/discover?type=movie&genre=27'
  },
  {
    heading: 'Only on Nextflix',
    endpoint: '/api/discover?type=tv',
    defaultCard: false
  },
  {
    heading: 'Trending Now',
    endpoint: '/api/trending?type=movie&time=week'
  },
  {
    heading: 'Comedies',
    endpoint: '/api/discover?type=movie&genre=35'
  },
  {
    heading: 'Top 10 in US Today',
    endpoint: '/api/trending?type=tv&time=day',
    topList: true
  },
  {
    heading: 'Action',
    endpoint: '/api/discover?type=movie&genre=28'
  },
  {
    heading: 'TV Sci-Fi and Horror',
    endpoint: '/api/discover?type=tv&genre=10765'
  },
  {
    heading: 'Mystery Movies',
    endpoint: '/api/discover?type=movie&genre=9648'
  },
  {
    heading: 'Animation',
    endpoint: '/api/discover?type=tv&genre=16'
  },
  {
    heading: 'Drama',
    endpoint: '/api/discover?type=movie&genre=18'
  }
];
