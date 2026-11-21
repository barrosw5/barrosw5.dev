// Stories run in the browser, where the real "next/server" can't load (it
// expects Node). Components only reach it through server code that stories
// replace, so this just has to exist. See viteFinal in ../main.ts.
export const connection = async () => {};
