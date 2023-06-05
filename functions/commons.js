import {fetch, CookieJar} from 'node-fetch-cookies'
import md5 from 'js-md5'

let wcqsOauthToken = 'd08f9e174f67cbd331a7b8733cd71418.410ed743498df300d5cf94d24736a37989399305'
const cookieJar = new CookieJar()

const depictsItemsSPARQL = `
    SELECT DISTINCT ?image ?url ?depicts ?rank ?dro ?quality ?width ?height ?mime WHERE { 
    ?image wdt:P180 wd:{{qid}}; schema:url ?url .   
    ?image p:P180 [ ps:P180 ?depicts ; wikibase:rank ?rank ] .
    ?image schema:encodingFormat ?mime .
    FILTER(?mime IN ('image/jpeg', 'image/png')) .
    OPTIONAL { ?image schema:width ?width . }
    OPTIONAL { ?image schema:height ?height . }
    OPTIONAL { ?image wdt:P6243 ?dro . }
    OPTIONAL { ?image wdt:P6731 ?quality . }
    }`

commonsImageQualityAssessment = {
  'Q63348049': 'featured',
  'Q63348069': 'quality',
  'Q63348040': 'valued'
}

function wcqsSessionToken() {
  return cookieJar.cookies.get('commons-query.wikimedia.org')?.get('wcqsSession').value
}

async function initSession() {
  console.log('Initializing Wikimedia Commons Query Service session')
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

/*
async function loadImageData(pageIds) {
  let merged = [...this.depictsImages.map(item => item.pageid), ...this.categoryImages.map(item => item.pageid)]
  merged = merged.filter((val, idx) => merged.indexOf(val) === idx)
  let pageIds = merged.slice(this.loaded.length, this.loaded.length + this.pageSize*4)
  let url = `https://commons.wikimedia.org/w/api.php?origin=*&format=json&action=query&prop=imageinfo&iiprop=extmetadata|size|mime&pageids=${pageIds.join('|')}`
  let resp = await fetch(url)
  if (resp.ok) {
    resp = await resp.json()
    this.loaded = [
      ...this.loaded,
      ...this.transformItems(
        pageIds.map((id) => resp.query.pages[id])
        .map((page) => {
          let metadata = {
            ...page.imageinfo[0],
            ...page.imageinfo[0].extmetadata,
            ...{
              docid: this.imageMap[page.pageid].docid,
              title: page.title,
              pageid: page.pageid,
              url: this.imageMap[page.pageid].url
            }
          }
          delete metadata.extmetadata
          return metadata
        }))
    ]
  }
}
*/

export async function handler(event, context, callback) {
  if (!wcqsSessionToken()) await initSession()

  const qid = event.path.split('/').filter(pe => pe).pop()
  console.log(`path: ${event.path} qid: ${qid}`)

  let query = depictsItemsSPARQL.replace(/{{qid}}/, qid).trim()
  let url = `https://commons-query.wikimedia.org/sparql?query=${encodeURIComponent(query)}`
  console.log(url)
  let resp = await fetch(cookieJar, url, {
    headers: { Accept: 'application/sparql-results+json'}
  })
  .catch(err => {
    console.log(err)
    initSession()
  })
  if (resp.ok) {
    resp = await resp.json()

    let data = {}
    resp.results.bindings.map(b => {
      let id = b.image.value.split('/').pop()
      let file = decodeURIComponent(b.url.value.split('/').pop())
      if (!data[id]) data[id] = {
        id,
        thumb: mwImage(file, 300),
        width: parseInt(b.width.value),
        height: parseInt(b.height.value),
        aspect: Number((parseInt(b.width.value)/parseInt(b.height.value)).toFixed(4)),
        mime: b.mime.value,
        file,
        depicts: {}
      }
      let depicted = b.depicts.value.split('/').pop()
      data[id].depicts[depicted] = { id: depicted }
      if (b.rank.value.split('#').pop().replace('Rank', '') === 'Preferred') data[id].depicts[depicted].prominent = true
      if (b.dro?.value.split('/').pop() === depicted) data[id].depicts[depicted].dro = true
      if (b.quality?.value) data[id].imageQualityAssessment = commonsImageQualityAssessment[b.quality.value.split('/').pop()]
    })
    let values = Object.values(data).map(img => {
      img.score = 0
      img.depicts = Object.values(img.depicts)
      let depicted = img.depicts.find(d => d.id === qid)
      if (depicted.dro) img.score += 5
      else if (depicted.prominent) img.score += 2
      if (img.imageQualityAssessment === 'featured') img.score += 3
      else if (img.imageQualityAssessment === 'quality') img.score += 2
      else if (img.imageQualityAssessment === 'valued') img.score += 1
      return img
    })
    .sort((a, b) => b.score - a.score)
    .slice(0,50)
    console.log(JSON.stringify(values))

    return { statusCode: 200, body: JSON.stringify(values)}
  } else {
    initSession()
  }
}