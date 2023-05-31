import {fetch, CookieJar} from 'node-fetch-cookies'
import md5 from 'js-md5'

let wcqsOauthToken = 'd08f9e174f67cbd331a7b8733cd71418.410ed743498df300d5cf94d24736a37989399305'
const cookieJar = new CookieJar()

const depictsItemsSPARQL = `
    SELECT DISTINCT ?image ?url ?depicts ?rank ?dro WHERE { 
    ?image wdt:P180 wd:{{qid}}; schema:url ?url .   
    ?image p:P180 [ ps:P180 ?depicts ; wikibase:rank ?rank ] .
    OPTIONAL { ?image wdt:P6243 ?dro . }
    }`


function wcqsSessionToken() {
  return cookieJar.cookies.get('commons-query.wikimedia.org')?.get('wcqsSession').value
}

async function initSession() {
  await fetch(cookieJar, 'https://commons-query.wikimedia.org', {
    credentials: 'include',
    headers: { Cookie: `wcqsOauth=${wcqsOauthToken};` }
  })
}

function mwImage(mwImg, width) {
  // Converts Wikimedia commons image URL to a thumbnail link
  mwImg = decodeURIComponent(mwImg).replace(/ /g,'_')
  const _md5 = md5(mwImg)
  const extension = mwImg.split('.').pop()
  let url = `https://upload.wikimedia.org/wikipedia/commons${width ? '/thumb' : ''}`
  url += `/${_md5.slice(0,1)}/${_md5.slice(0,2)}/${mwImg}`
  if (width) {
    url += `/${width}px-${mwImg}`
    if (extension === 'svg') {
      url += '.png'
    } else if (extension === 'tif' || extension === 'tiff') {
      url += '.jpg'
    }
  }
  return url
}

export async function handler(event, context, callback) {
  if (!wcqsSessionToken()) await initSession()

  const qid = event.path.split('/').filter(pe => pe).pop()
  let query = depictsItemsSPARQL.replace(/{{qid}}/, qid).trim()
  let url = `https://commons-query.wikimedia.org/sparql?query=${encodeURIComponent(query)}`
  let resp = await fetch(cookieJar, url, {
    headers: { Accept: 'application/sparql-results+json'}
  })
  resp = await resp.json()

  let data = {}
  resp.results.bindings.map(b => {
    let id = b.image.value.split('/').pop()
    let file = decodeURIComponent(b.url.value.split('/').pop())
    if (!data[id]) data[id] = {
      id,
      thumb: mwImage(file, 300),
      file,
      depicts: []
    }
    let depicts = {
      id: b.depicts.value.split('/').pop(),
      rank: b.rank.value.split('#').pop().replace('Rank', '')
    }
    if (b.dro?.value.split('/').pop() === depicts.id) depicts.dro = true
    data[id].depicts.push(depicts)
  })
  return { statusCode: 200, body: JSON.stringify(data)}
}