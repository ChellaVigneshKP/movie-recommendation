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
    heading: 'ALS Based Recommendations',
    endpoint: '/api/recommendation?type=als'
  },
  {
    heading: 'SVD Based Recommendations',
    endpoint: '/api/recommendation?type=svd'
  },
  {
    heading: 'Based on Your Recent Searches',
    endpoint: '/api/recommendation?type=nlp',
    defaultCard: false
  },
  {
    heading: 'Deep Learning Based Recommendations',
    endpoint: '/api/recommendation?type=deepmatch'
  },
  {
    heading: 'Top 10 NCF',
    endpoint: '/api/recommendation?type=ncf',
    topList: true
  },
  // {
  //   heading: 'Action',
  //   endpoint: '/api/recommendation?type=als'
  // },
  // {
  //   heading: 'TV Sci-Fi and Horror',
  //   endpoint: '/api/recommendation?type=als'
  // },
  // {
  //   heading: 'Mystery Movies',
  //   endpoint: '/api/recommendation?type=als'
  // },
  // {
  //   heading: 'Animation',
  //   endpoint: '/api/recommendation?type=als'
  // },
  // {
  //   heading: 'Drama',
  //   endpoint: '/api/recommendation?type=als'
  // }
];
