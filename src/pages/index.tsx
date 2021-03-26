import { GetStaticProps } from 'next'
import Prismic from '@prismicio/client'
import { format, parseISO } from 'date-fns'
// import ptBR from 'date-fns/locale/pt-BR'

import Link from 'next/link'
import { useState } from 'react'
import Header from '../components/Header'
import { getPrismicClient } from '../services/prismic'

// import commonStyles from '../styles/common.module.scss'
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
      <Header />

      <main className={styles.container}>
        <section>
          {posts.map(({ data, uid, first_publication_date }) => {
            const formatDate = format(
              parseISO(first_publication_date),
              "dd' 'LLL' 'yyyy",
            )
            return (
              <Link key={uid} href={`/post/${uid}`}>
                <a>
                  <h1>{data.title}</h1>
                  <p>{data.subtitle}</p>
                  <div>
                    <time>{formatDate.toLowerCase()}</time>
                    <span>{data.author}</span>
                  </div>
                </a>
              </Link>
            )
          })}
        </section>
        {nextPage && (
          <section>
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
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 1,
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
