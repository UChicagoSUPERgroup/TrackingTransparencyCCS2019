export function getPopularityString (interestInfo) {
  if (!interestInfo) return
  let popularity
  if (interestInfo.impressions >= 10000000000) {
    popularity = 'very popular'
  } else if (interestInfo.impressions >= 1000000000) {
    popularity = 'popular'
  } else if (interestInfo.impressions >= 100000000) {
    popularity = 'somewhat popular'
  } else if (interestInfo.impressions >= 100000000) {
    popularity = 'not very popular'
  }
  return popularity
}

export function getComfortString (interestInfo) {
  if (!interestInfo) return
  let comfort
  if (interestInfo.comfort <= -3) {
    comfort = 'very uncomfortable'
  } else if (interestInfo.comfort <= -2) {
    comfort = 'uncomfortable'
  } else if (interestInfo.comfort <= -1) {
    comfort = 'somewhat uncomfortable'
  } else if (interestInfo.comfort <= 0) {
    comfort = 'neither comfortable nor uncomfortable'
  } else if (interestInfo.comfort <= 1) {
    comfort = 'somewhat comfortable'
  } else if (interestInfo.comfort <= 2) {
    comfort = 'comfortable'
  } else if (interestInfo.comfort) {
    comfort = 'very comfortable'
  }
  return comfort
}
