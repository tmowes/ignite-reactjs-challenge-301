import { NextApiRequest, NextApiResponse } from 'next'
import { Document } from '@prismicio/client/types/documents'
import { getPrismicClient } from '../../services/prismic'

function linkResolver(doc: Document): string {
  if (doc.type === 'posts') {
    return `/post/${doc.uid}`
  }
  return '/'
}

// eslint-disable-next-line consistent-return
export default async (request: NextApiRequest, response: NextApiResponse) => {
  const { token: ref, documentId } = request.query as {
    token: string
    documentId: string
  }
  const prismic = getPrismicClient(request)

  const redirectUrl = await prismic
    .getPreviewResolver(ref, documentId)
    .resolve(linkResolver, '/')

  if (!redirectUrl) {
    return response.status(401).json({ message: 'Invalid token' })
  }

  response.setPreviewData({ ref })
  response.writeHead(302, { Location: `${redirectUrl}` })
  response.end()
}
