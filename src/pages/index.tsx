import { GetStaticProps } from 'next'
import Prismic from '@prismicio/client'
import { format } from 'date-fns'
import { FiUser, FiCalendar } from 'react-icons/fi'

import ptBR from 'date-fns/locale/pt-BR'

import Link from 'next/link'
import { useState } from 'react'
import { Header, MetaTags } from '../components'
import { getPrismicClient } from '../services/prismic'

import styles from './home.module.scss'

interface Post {
  uid?: string
  first_publication_date: string | null
  data: {
    title: string
    subtitle: string
    author: string
  }
}

interface PostPagination {
  next_page: string
  results: Post[]
}

interface HomeProps {
  postsPagination: PostPagination
}

export default function Home(props: HomeProps) {
  const {
    postsPagination: { next_page, results },
  } = props

  const [posts, setPosts] = useState(results)
  const [nextPage, setNextPage] = useState(next_page)

  const loadMorePosts = async () => {
    if (!nextPage) {
      return
    }
    fetch(nextPage)
      .then(response => response.json())
      .then(response => {
        const newPosts = [...posts, ...response.results]
        setNextPage(response.next_page)
        setPosts(newPosts)
      })
  }

  return (
    <>
      <MetaTags title="Home" />
      <Header />
      <main className={styles.container}>
        {posts.map(({ data, uid, first_publication_date }) => (
          <section className={styles.postSection}>
            <Link key={uid} href={`/post/${uid}`}>
              <a>
                <h1>{data.title}</h1>
                <h2>{data.subtitle}</h2>
                <section>
                  <FiCalendar />
                  <time>
                    {format(new Date(first_publication_date), 'dd LLL yyyy', {
                      locale: ptBR,
                    })}
                  </time>
                  <FiUser />
                  <span>{data.author}</span>
                </section>
              </a>
            </Link>
          </section>
        ))}
        {nextPage && (
          <section className={styles.nextSection}>
            <button type="button" onClick={loadMorePosts}>
              <strong>Carregar mais posts</strong>
            </button>
          </section>
        )}
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const prismic = getPrismicClient()
  const { results, next_page } = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['title', 'subtitle', 'author'],
      pageSize: 3,
    },
  )

  return {
    props: {
      postsPagination: {
        next_page,
        results,
      },
    },
  }
}
