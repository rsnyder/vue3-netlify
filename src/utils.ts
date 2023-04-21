export function findQids(claims:any): string[] {
  let qids: Set<string> = new Set()
  Object.entries(claims).forEach((args: any) => {
    qids.add(args[0])
    args[1].forEach((val: any) => {
      if (val.mainsnak.snaktype === 'value') {
        if (val.mainsnak.datatype === 'wikibase-item') qids.add(val.mainsnak.datavalue.value.id)
        if (val.mainsnak.datatype === 'wikibase-property') qids.add(val.mainsnak.datavalue.value.id)
        if (val.mainsnak.datatype === 'quantity') qids.add(val.mainsnak.datavalue.value.unit.split('/').pop())
      }
      
      if (val.qualifiers) {
        Object.values(val.qualifiers).forEach((qvals: any) => {
          qvals.forEach((qval: any) => {
            qids.add(qval.property)
            if (qval.snaktype === 'value') {
              if (qval.datatype === 'wikibase-item') qids.add(qval.datavalue.value.id)
              if (qval.datatype === 'quantity') qids.add(qval.datavalue.value.unit.split('/').pop())
            }
          })
        })
      }
      if (val.references) {
        val.references.forEach((ref: any) => {
          Object.values(ref.snaks).forEach((rs: any) => {
            Object.values(rs).forEach((rval: any) => {
              qids.add(rval.property)
              if (rval.snaktype === 'value') {
                if (rval.datatype === 'wikibase-item') qids.add(rval.datavalue.value.id)
                if (rval.datatype === 'quantity') qids.add(rval.datavalue.value.unit.split('/').pop())
              }
            })
          })
        })
      }
    })

  })
  return Array.from(qids)
}

export function langLabels(labels:any, language:string) {
  return Object.fromEntries(
    Object.keys(labels)
    .map(eid => [eid, labels[eid][language] || labels[eid]['en'] || '']))
}