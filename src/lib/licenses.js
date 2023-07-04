const wdLicenses = {
    Q6938433: {code: 'CC0', label: '', url: 'https://creativecommons.org/publicdomain/zero/1.0/'},

    Q30942811: {code: 'CC BY 1.0', label: '', url: 'https://creativecommons.org/licenses/by/1.0/'},
    Q19125117: {code: 'CC BY 2.0', label: '', url: 'https://creativecommons.org/licenses/by/2.0/'},
    Q18810333: {code: 'CC BY 2.5', label: '', url: 'https://creativecommons.org/licenses/by/2.5/'},
    Q14947546: {code: 'CC BY 3.0', label: '', url: 'https://creativecommons.org/licenses/by/3.0/'},
    Q75770766: {code: 'CC BY 3.0 BR', label: '', url: 'https://creativecommons.org/licenses/by/3.0/br/'},
    Q18810143: {code: 'CC BY 3.0 US', label: '', url: 'https://creativecommons.org/licenses/by/3.0/us/'},
    Q20007257: {code: 'CC BY 4.0', label: '', url: 'https://creativecommons.org/licenses/by/4.0/'},
    Q20007257: {code: 'CC BY', label: '', url: 'https://creativecommons.org/licenses/by/4.0/'},

    Q80837139: {code: 'CC BY-SA 3.0 AT', label: '', url: 'https://creativecommons.org/licenses/by-sa/3.0/at/deed.en'},

    Q47001652: {code: 'CC BY-SA 1.0', label: '', url: 'https://creativecommons.org/licenses/by-sa/1.0/'},
    Q19068220: {code: 'CC BY-SA 2.0', label: '', url: 'https://creativecommons.org/licenses/by-sa/2.0/'},
    Q77143083: {code: 'CC BY-SA 2.0 DE', label: '', url: 'https://creativecommons.org/licenses/by-sa/2.0/de/'},
    Q42716613: {code: 'CC BY-SA 3.0 DE', label: '', url: 'https://creativecommons.org/licenses/by-sa/3.0/de/deed.de'},
    Q19113751: {code: 'CC BY-SA 2.5', label: '', url: 'https://creativecommons.org/licenses/by-sa/2.5/'},
    Q14946043: {code: 'CC BY-SA 3.0', label: '', url: 'https://creativecommons.org/licenses/by-sa/3.0/'},
    Q18199165: {code: 'CC BY-SA 4.0', label: '', url: 'https://creativecommons.org/licenses/by-sa/4.0/'},
    Q18199165: {code: 'CC BY-SA', label: '', url: 'https://creativecommons.org/licenses/by-sa/4.0/'},

    Q26921686: {code: 'GFDL-1.2-only', label: '', url: 'https://www.gnu.org/licenses/old-licenses/fdl-1.2.html'},
    Q27016752: {code: 'GPL-2.0-or-later', label: '', url: 'https://spdx.org/licenses/GPL-2.0-or-later.html'},
    Q50829104: {code: 'GFDL-1.2+', label: '', url: 'https://www.gnu.org/licenses/old-licenses/fdl-1.2.html'},

    Q152332: {code: 'FAL', label: '', url: 'https://artlibre.org/'},
    
    Q99263261: {code: 'No Known Copyright', label: '', url: 'https://rightsstatements.org/page/NKC/1.0/?language=en'},
    Q99263261: {code: 'UNKNOWN', label: '', url: 'https://rightsstatements.org/page/NKC/1.0/?language=en'},

    Q99578078: {code: 'Copyrighted free use', label: '', url: 'https://commons.wikimedia.org/wiki/Template:Copyrighted_free_use'},
    Q98923445: {code: 'Attribution only license', label: '', url: 'https://commons.wikimedia.org/wiki/Template:Attribution_only_license'},

    Q98592850: {code: 'PD', url: 'https://en.wikipedia.org/wiki/Wikipedia:Granting_work_into_the_public_domain'}
  }

  const wdLicensesByCode = Object.fromEntries(Object.entries(wdLicenses).map(([k, v]) => [v.code, v]))

  const ccBadges = {
    'BY': 'https://mirrors.creativecommons.org/presskit/buttons/88x31/png/by.png',
    'BY-SA': 'https://mirrors.creativecommons.org/presskit/buttons/88x31/png/by-sa.png',
    'BY-ND': 'https://mirrors.creativecommons.org/presskit/buttons/88x31/png/by-nd.png',
    'BY-NC': 'https://mirrors.creativecommons.org/presskit/buttons/88x31/png/by-nc.png',
    'BY-NC EU': 'https://mirrors.creativecommons.org/presskit/buttons/88x31/png/by-nc.eu.png',
    'BY-NC-SA': 'https://mirrors.creativecommons.org/presskit/buttons/88x31/png/by-nc-sa.png',
    'BY-NC-SA EU': 'https://mirrors.creativecommons.org/presskit/buttons/88x31/png/by-nc-sa.eu.png',
    'BY-NC-ND': 'https://mirrors.creativecommons.org/presskit/buttons/88x31/png/by-nc-nd.png',
    'BY-NC-ND EU': 'https://mirrors.creativecommons.org/presskit/buttons/88x31/png/by-nc-nd.eu.png',
    'CC0': 'https://mirrors.creativecommons.org/presskit/buttons/88x31/png/cc-zero.png',
    'PDM': 'https://mirrors.creativecommons.org/presskit/buttons/88x31/png/publicdomain.png',
    'Public Domain Mark': 'https://mirrors.creativecommons.org/presskit/buttons/88x31/png/publicdomain.png',
    'FAL': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Licence_Art_Libre.svg/367px-Licence_Art_Libre.svg.png',
  }

  function addBadges(license) {
    if (license.code.indexOf('BY-NC-ND') === 0) {
      license.badges = [license.code.indexOf('EU') > 0 ? ccBadges['BY-NC-ND EU'] : ccBadges['BY-NC-ND']]
    } else if (license.code.indexOf('BY-NC-SA') === 0) {
      license.badges = [license.code.indexOf('EU') > 0 ? ccBadges['BY-NC-SA EU'] : ccBadges['BY-NC-SA']]
    } else if (license.code.indexOf('BY-NC') === 0) {
      license.badges = [license.code.indexOf('EU') > 0 ? ccBadges['BY-NC EU'] : ccBadges['BY-NC']]
    } else if (license.code.indexOf('BY-ND') === 0) {
      license.badges = [ccBadges['BY-ND']]
    } else if (license.code.indexOf('BY-SA') === 0) {
      license.badges = [ccBadges['BY-SA']]
    } else if (license.code.indexOf('BY') === 0) {
      license.badges = [ccBadges['BY']]
    } else if (license.code.indexOf('PD') === 0) {
      license.badges = [ccBadges['Public Domain Mark']]
    }
    return license
  }

  function strToLicense(licenseStr) {
    /* licenseStr is one of:
        - Wikidata license URL
        - Creative Commons URL
        - Rights Statement URL
        - Creative Commons or Rights Statement code
    */
    // console.log('strToLicense', licenseStr)
    let license
    if (licenseStr.indexOf('http') === 0) { // licenseStr is a URL
      if (licenseStr.indexOf('wikidata.org') > 0) {
        let qid = licenseStr.split('/').pop()
        if (qid) license = wdLicenses[qid]
        else license = {code: 'unknown', label: 'unknown', url: licenseStr}
      } else if (licenseStr.indexOf('creativecommons.org') > 0) {
        // TODO
      } else if (licenseStr.indexOf('rightsstatements.org') > 0) {
        // tODO
      } else {
        license = {code: 'unknown', label: 'unknown', url: licenseStr}
      }
    } else { // licenseStr is a code
      licenseStr = licenseStr.toUpperCase().replace(/\s+/g, ' ')
      if (wdLicensesByCode[licenseStr]) license = wdLicensesByCode[licenseStr]
      else if (licenseStr.indexOf('CC BY') === 0) license = wdLicenses['Q20007257']
      else if (licenseStr.indexOf('CC BY-SA') === 0) license = wdLicenses['Q18199165']
      else license = {code: 'unknown', label: 'unknown', url: ''}
    }
    return addBadges(license)
  }

  export {wdLicenses, ccBadges, strToLicense}