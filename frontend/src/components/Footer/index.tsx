import styles from '@/styles/Footer.module.scss';
import { Github, Linkedin, Twitter } from '@/utils/icons';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        {/* Social Icons */}
        <div className={styles.socialicons}>
          <a href='https://linkedin.com/in/chella-vignesh-k-p' target='_blank' rel='noreferrer'>
            <Linkedin />
          </a>
          <a href='https://twitter.com/ChellaVignesh6' target='_blank' rel='noreferrer'>
            <Twitter />
          </a>
          <a href='https://github.com/ChellaVigneshKP' target='_blank' rel='noreferrer'>
            <Github />
          </a>
        </div>

        {/* Footer Links */}
        <div className={styles.links}>
          <a href='#'>Audio Description</a>
          <a href='#'>Help Centre</a>
          <a href='#'>Gift Cards</a>
          <a href='#'>Media Centre</a>
          <a href='#'>Investor Relations</a>
          <a href='#'>Jobs</a>
          <a href='#'>Terms of Use</a>
          <a href='#'>Privacy</a>
          <a href='#'>Legal Notices</a>
          <a href='#'>Cookie Preferences</a>
          <a href='#'>Corporate Information</a>
          <a href='#'>Contact Us</a>
        </div>
      </div>

      {/* Service Code Button */}
      <button className={styles.servicecode}>Service Code</button>

      {/* Copyright */}
      <p className={styles.copyright}>© 2000-2025 chellavignesh.com</p>
    </footer>
  );
}