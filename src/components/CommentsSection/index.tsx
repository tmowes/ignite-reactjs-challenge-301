import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function CommentsSection() {
  const { asPath } = useRouter()

  useEffect(() => {
    const scriptElem = document.createElement('script')
    const anchor = document.getElementById('inject-comments-for-utterances')
    anchor.innerHTML = ''
    scriptElem.src = 'https://utteranc.es/client.js'
    scriptElem.async = true
    scriptElem.crossOrigin = 'anonymous'
    scriptElem.setAttribute('repo', 'tmowes/ignite-reactjs-challenge-301')
    scriptElem.setAttribute('issue-term', 'pathname')
    scriptElem.setAttribute('label', 'blog-comment')
    scriptElem.setAttribute('theme', 'dark-blue')
    anchor.appendChild(scriptElem)
  }, [asPath])

  return <div id="inject-comments-for-utterances" />
}
