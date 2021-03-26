import { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import ptBR from 'date-fns/locale/pt-BR'
import Prismic from '@prismicio/client'

import { FiUser, FiCalendar, FiClock } from 'react-icons/fi'
import { RichText } from 'prismic-dom'
import { format } from 'date-fns'
import Header from '../../components/Header'

import { getPrismicClient } from '../../services/prismic'

import commonStyles from '../../styles/common.module.scss'
import styles from './post.module.scss'

interface Post {
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
}

export default function Post(props: PostProps) {
  const {
    post: { first_publication_date, data },
  } = props
  const { isFallback } = useRouter()

  const calculateReadTime = () => {
    const arrayOfWords = data.content.reduce((acc, cur) => {
      const words = RichText.asText(cur.body).split(' ')
      return [...acc, ...words]
    }, [])
    const readTime = Math.ceil(arrayOfWords.length / 200)
    return readTime
  }

  if (isFallback) {
    return <h1>Carregando...</h1>
  }
  return (
    <>
      <Header />
      <main className={styles.container}>
        <img src={data.banner.url} alt="banner" />
        <article>
          <h1>{data.title}</h1>
          <section>
            <time>
              <FiCalendar />
              {format(new Date(first_publication_date), 'dd LLL yyyy', {
                locale: ptBR,
              })}
            </time>
            <p>
              <FiUser />
              {data.author}
            </p>
            <p>
              <FiClock />
              {`${calculateReadTime()} min`}
            </p>
          </section>
          {data.content.map(({ heading, body }) => (
            <div key={heading}>
              <h2>{heading}</h2>
              <div
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }}
              />
            </div>
          ))}
        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient()
  const { results } = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 1,
    },
  )
  return {
    paths: results.map(post => {
      return {
        params: {
          slug: post.uid,
        },
      }
    }),
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<PostProps> = async ({ params }) => {
  const { slug } = params
  const prismic = getPrismicClient()
  const { first_publication_date, data, uid } = await prismic.getByUID(
    'post',
    String(slug),
    {},
  )

  return {
    props: {
      post: { first_publication_date, data, uid },
    },
    revalidate: 60 * 30,
  }
}
