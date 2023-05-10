<template>

  <div ref="root">
    <h1>Markdown</h1>
  </div>

</template>

<script setup lang="ts">

  import { computed, onMounted, ref, toRaw, watch } from 'vue'
  import { marked } from 'marked'

  onMounted(async () =>  {
    let md = await getMarkdown('https://raw.githubusercontent.com/rsnyder/vue3-netlify/main/static/pages/en/default.md')
    console.log(md)
  })

  async function getMarkdown(path:string) {
    let response = await fetch(path)
    return await response.text()
  }

  // Convert essay Markdown into HTML.  Markdown headings are used to infer content heirarchy
  function parseMarkdown(markdown: string): string {

    let tmp = new DOMParser().parseFromString(marked.parse(markdown), 'text/html').children[0].children[1]      
    let essay = document.createElement('div')
    let currentSection: any = essay
    currentSection.setAttribute('data-id', '1')
    let segments: any[] = []
    let segment: any

    Array.from(tmp.querySelectorAll('param'))
      .filter(param => Object.values(param.attributes).find(attr => attr.nodeName !== 'id' && attr.nodeName !== 'class' && attr.nodeName !== 'component') === undefined)
      .forEach(param => {
        let prior = param.previousElementSibling
        if (prior && param.id) prior.id = param.id
        if (prior && param.className) prior.className = param.className
        if (prior && param.attributes.getNamedItem('component')) {
          if (param.attributes.getNamedItem('component')) {
            let componentAttr: any = param.attributes.getNamedItem('component')
            if (componentAttr) prior.setAttribute('data-component', componentAttr.value)
          }
        }
        if (param.parentElement) param.parentElement.removeChild(param)
      })

    Array.from(tmp.children as HTMLCollectionOf<HTMLElement>).forEach((el: HTMLElement) => {
      if (el.tagName[0] === 'H' && isNumeric(el.tagName.slice(1))) {
        let sectionLevel = parseInt(el.tagName.slice(1))
        if (segments) {
          segments.forEach(segment => currentSection.innerHTML += segment.outerHTML)
          segments = []
          segment = null
        }

        currentSection = new DOMParser().parseFromString('<section></section>', 'text/html').children[0].children[1].children[0]
        let elClasses = Array.from(el.classList)
        el.removeAttribute('class')
        if (el.id) {
          currentSection.id = el.id
          el.removeAttribute('id')
        }
        if (el.dataset.component) {
          currentSection.setAttribute('data-component', el.dataset.component)
          el.removeAttribute('data-component')
        }
        if (!el.innerHTML) el.style.display = 'none'
        currentSection.innerHTML += el.outerHTML

        let headings = Array.from(essay.querySelectorAll(`H${sectionLevel-1}`))
        let parent: any = sectionLevel === 1 || headings && headings.length > 0 ? headings.pop()?.parentElement : null
        if (parent) {
          let parentDataID = parent.dataset.id || ''
          let sectionSeq = parent.querySelectorAll(`H${sectionLevel}`).length + 1
          let currentDataID = parentDataID ? `${parentDataID}.${sectionSeq}` : sectionSeq
          currentSection.setAttribute('data-id', currentDataID)
        }

        if (elClasses.indexOf('cards') >= 0) {
          let wrapper = new DOMParser().parseFromString(`<section class="${elClasses.join(' ')}"></section>`, 'text/html').children[0].children[1].children[0]
          currentSection.appendChild(wrapper)
        } else {
          currentSection.classList.add(...elClasses)
          let wrapper = parent ? parent.querySelector(':scope > .cards') : null
          if (wrapper) {
            currentSection.classList.add('card')
            parent = wrapper
          }
        }

        (parent || essay).appendChild(currentSection)

      } else if (el.tagName === 'P' || el.tagName === 'UL' || el.tagName === 'OL') {
        let entityCardsSubsection = el.tagName === 'UL' ? currentSection.querySelector('section.cards.entities') : null
        if (entityCardsSubsection) {
          Array.from(el.children).forEach(child => {
            let entityElem = new DOMParser().parseFromString(`<section class="card entity" data-qid="wd:${child.innerHTML}"></section>`, 'text/html').children[0].children[1].children[0]
            entityCardsSubsection.innerHTML += entityElem.outerHTML
          })
        } else {
          let segID = `${currentSection.dataset.id}.${segments.length + 1}`
          segment = new DOMParser().parseFromString('<div></div>', 'text/html').children[0].children[1].children[0]
          segment.setAttribute('data-id', segID)
          segment.setAttribute('id', segID)
          segment.classList.add('segment')
          segment.innerHTML = el.outerHTML
          segments.push(segment)
        }
      } else {
        if (segment) {
          segment.innerHTML += el.outerHTML
        } else {
          currentSection.innerHTML += el.outerHTML
        }
      }
    })
    if (segments) {
      segments.forEach(segment => currentSection.innerHTML += segment.outerHTML)
      segments = []
    }

    return essay.innerHTML
  }

  function isNumeric(arg: any): boolean { return !isNaN(arg) }

</script>

<style>

  h1 {
    margin-top: 0;
    font-size: 1.6em;
  }

</style>