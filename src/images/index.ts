interface License {
  code: string
  label: string
  url: string
  badges: string[]
}

interface Image {
  aspect_ratio?: number
  attribution?: string
  coords?: string
  createdBy?: string
  creator?: string
  creator_url?: string
  depicts?: string[]
  description?: string
  detail_url?: string
  foreign_landing_url?: string
  format?: string
  id: string
  imageQualityAssessment?: string
  height?: number
  license?: License
  license_version?: string
  logo?: string
  pageid?: string
  provider?: string
  raw: object
  score?: number
  size?: number
  source?: string
  tags?: string[]
  title?: string
  thumbnail?: string
  url?: string
  width?: number
}

export { Image, License } 