import fetch from 'node-fetch'

export async function handler(event, context, callback) {

    // console.log(event)
    // const {qid} = JSON.parse(event.body)

    const qid = event.path.split('/').filter(pe => pe).pop()
    const URL = `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`
    console.log(URL)
    const response = await fetch(URL)
    const data = await response.json()

    return {
        statusCode: 200,
        // By setting the data to data.results, we eliminate the need for our client app to do this
        body: JSON.stringify({
            data: data.entities[qid]
        })
    }
}