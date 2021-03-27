import { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom'
import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import { FiUser, FiCalendar, FiClock } from 'react-icons/fi'

import { useMemo } from 'react'
import Link from 'next/link'
import { Header, CommentsSection, MetaTags } from '../../components'
import { getPrismicClient } from '../../services/prismic'

// import commonStyles from '../../styles/common.module.scss'
import styles from './post.module.scss'

interface Post {
  uid?: string
  first_publication_date: string | null
  data: {
    title: string
    banner: {
      url: string
    }
    author: string
    content: {
      heading: string
      body: {
        text: string
      }[]
    }[]
  }
}

interface PostProps {
  post: Post
  prevPost: Post
  nextPost: Post
}

export default function Post(props: PostProps) {
  const {
    prevPost,
    post: { first_publication_date, data },
    nextPost,
  } = props

  const { isFallback } = useRouter()

  const estimatedReadTime = useMemo(() => {
    if (isFallback) {
      return 0
    }

    const averageWordsReadPerMinute = 200

    const countTextWords = data.content.reduce((acc, curr) => {
      const headingWords = curr.heading.split(/\s/g).length
      const bodyWords = curr.body.reduce((accBody, currBody) => {
        const textWords = currBody.text.split(/\s/g).length
        return accBody + textWords
      }, 0)
      return acc + headingWords + bodyWords
    }, 0)

    const readTime = Math.ceil(countTextWords / averageWordsReadPerMinute)
    return readTime
  }, [data.content, isFallback])

  if (isFallback) {
    return <h1>Carregando...</h1>
  }

  return (
    <>
      <MetaTags title={`${data.title}`} />
      <main className={styles.postMain}>
        <Header />
        <div className={styles.bannerContainer}>
          <img src={data.banner.url} alt="banner" />
        </div>
        <article className={styles.postContainer}>
          <h1>{data.title}</h1>
          <section>
            <FiCalendar />
            <time>
              {format(new Date(first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </time>
            <FiUser />
            <p>{data.author}</p>
            <FiClock />
            <p>{`${estimatedReadTime} min`}</p>
          </section>
          {data.content.map(({ heading, body }, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={`${heading}${i}`} className={styles.postContent}>
              <h2>{heading}</h2>
              <div
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }}
              />
            </div>
          ))}
        </article>
        <div className={styles.footer}>
          <div className={styles.pagination}>
            {prevPost && (
              <Link href={`/post/${prevPost.uid}`}>
                <a className={styles.prevPost}>
                  <span>{prevPost.data.title}</span>
                  <strong>Post anterior</strong>
                </a>
              </Link>
            )}
            {nextPost && (
              <Link href={`/post/${nextPost.uid}`}>
                <a className={styles.nextPost}>
                  <span>{nextPost.data.title}</span>
                  <strong>Próximo post</strong>
                </a>
              </Link>
            )}
          </div>
          <CommentsSection />
        </div>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient()
  const { results } = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ])
  return {
    paths: results.map(post => {
      return {
        params: {
          slug: post.uid,
        },
      }
    }),
    fallback: true,
    // fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<PostProps> = async ({ params }) => {
  const { slug } = params
  const prismic = getPrismicClient()
  const { first_publication_date, data, uid, id } = await prismic.getByUID(
    'posts',
    String(slug),
    {},
  )

  const prevPost =
    (
      await prismic.query([Prismic.predicates.at('document.type', 'posts')], {
        pageSize: 1,
        after: id,
        orderings: '[document.first_publication_date desc]',
        fetch: ['posts.title'],
      })
    ).results[0] ?? null

  const nextPost =
    (
      await prismic.query([Prismic.predicates.at('document.type', 'posts')], {
        pageSize: 1,
        after: id,
        orderings: '[document.first_publication_date]',
        fetch: ['posts.title'],
      })
    ).results[0] ?? null

  return {
    props: {
      post: { first_publication_date, data, uid },
      prevPost,
      nextPost,
    },
    revalidate: 60 * 30, // 30 minutes
  }
}
