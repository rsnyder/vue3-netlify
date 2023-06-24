import fetch from 'node-fetch'
import { mwImage, mwUrlHash } from './mw-utils'

const imageExtensions = new Set('jpg jpeg png gif svg tif tiff'.split(' '))

export async function handler(event) {
  
  const category = event.path.split('/').filter(pe => pe).pop()

  let categoryImagesContinue = ''
  let collector = []
  while (categoryImagesContinue !== undefined) {
    let resp = await fetch(`https://commons.wikimedia.org/w/api.php?origin=*&action=query&generator=categorymembers&gcmlimit=500&gcmtitle=Category:${category.replace(/ /,'_')}&format=json&gcmnamespace=6&gcmtype=file&prop=imageinfo&iiprop=url&gcmcontinue=${categoryImagesContinue}`)
    if (!resp.ok) return { statusCode: resp.status, body: resp.statusText }
      
    resp = await resp.json()
    categoryImagesContinue = resp.continue?.gcmcontinue
    let batch = Object.fromEntries(Object.values(resp.query.pages).map(page => {
      // console.log(page)
      let pageid = page.pageid
      let id = mwUrlHash(page.imageinfo[0].descriptionurl)
      let docid = page.title.replace(/File/,'commons')
      let url = page.imageinfo[0].descriptionurl
      return [pageid, {id, docid, pageid, url}]
    }))
    collector = [...collector, ...Object.values(batch)] 
  }
  let images = collector
    .filter(item => imageExtensions.has(item.url.split('.').pop().toLowerCase()))
    .map(item => transformItem(item))

  return { statusCode: 200, body: JSON.stringify(images)}

}

function transformItem(item) {
  let doc = {id: item.id, source: 'cc'}
  doc.thumbnail = mwImage(item.url, 300)
  return doc
}