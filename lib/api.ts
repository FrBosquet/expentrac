export const getUrl = (...path: string[]) => {
  return `${process.env.API_BASE_URL}/${path.join('/')}`;
}