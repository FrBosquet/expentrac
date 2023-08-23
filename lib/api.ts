export const getUrl = (...path: string[]) => {
  return `${process.env.NEXT_PUBLIC_BASE_URL}/${path.join('/')}`
}

export const getTag = (topic: string, userId: string) => `${topic}:${userId}`
