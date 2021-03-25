/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import Link from 'next/link';
import styles from './header.module.scss';

export default function Header() {
  return (
    // TODO
    <div className={styles.container}>
      <Link href="/">
        <img src="/logo.svg" alt="logo" />
      </Link>
    </div>
  );
}
