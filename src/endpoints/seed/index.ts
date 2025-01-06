export * from './home-static'

export const seed = async ({ payload, req }: { payload: any; req: any }) => {
  return {
    homeStatic: {
      slug: 'home',
      _status: 'published',
      title: {
        zh: '首页',
        en: 'Home',
      },
      hero: {
        type: 'none',
      },
      layout: [],
    },
  }
}
